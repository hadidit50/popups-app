import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPopupStatus, type OpeningHoursRow, type PopupTiming } from './status.ts';

const TZ = 'Asia/Jerusalem';
// Wednesday 14.10.2026 (Israel is UTC+3 until 25.10.2026)
const at = (local: string) => new Date(`${local}+03:00`);
const everyDay = (opens: string, closes: string): OpeningHoursRow[] =>
  [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, opens, closes }));

const popup = (overrides: Partial<PopupTiming> = {}): PopupTiming => ({
  startsAt: at('2026-10-01T00:00:00'),
  endsAt: at('2026-10-31T23:59:00'),
  timezone: TZ,
  hours: everyDay('10:00', '22:00'),
  ...overrides,
});

test('open now shows closing time', () => {
  const s = getPopupStatus(popup(), at('2026-10-14T12:00:00'));
  assert.equal(s.isOpenNow, true);
  assert.deepEqual(s.primary, { key: 'openUntil', tone: 'open', params: { time: '22:00' } });
  assert.equal(s.ending, undefined);
});

test('before opening today shows "opens today at"', () => {
  const s = getPopupStatus(popup(), at('2026-10-14T08:15:00'));
  assert.equal(s.state, 'opensLater');
  assert.deepEqual(s.primary, { key: 'opensToday', tone: 'soon', params: { time: '10:00' } });
});

test('after closing shows "opens tomorrow at"', () => {
  const s = getPopupStatus(popup(), at('2026-10-14T23:00:00'));
  assert.deepEqual(s.primary, { key: 'opensTomorrow', tone: 'neutral', params: { time: '10:00' } });
});

test('weekday-only hours show the next weekday (Thursday=4)', () => {
  const s = getPopupStatus(
    popup({ hours: [{ weekday: 4, opens: '18:00', closes: '23:00' }] }),
    at('2026-10-12T12:00:00'), // Monday
  );
  assert.deepEqual(s.primary, { key: 'opensOnWeekday', tone: 'neutral', params: { time: '18:00', weekday: 4 } });
});

test('past-midnight hours: still open at 01:00 from yesterday', () => {
  const s = getPopupStatus(popup({ hours: everyDay('20:00', '02:00') }), at('2026-10-14T01:00:00'));
  assert.equal(s.isOpenNow, true);
  assert.equal(s.primary.params?.time, '02:00');
});

test('closing at midnight uses the midnight label', () => {
  const s = getPopupStatus(popup({ hours: everyDay('18:00', '00:00') }), at('2026-10-14T19:00:00'));
  assert.equal(s.primary.key, 'openUntilMidnight');
});

test('no hours = open all day during the event, without a misleading closing time', () => {
  const s = getPopupStatus(popup({ hours: [] }), at('2026-10-14T03:00:00'));
  assert.equal(s.isOpenNow, true);
  assert.deepEqual(s.primary, { key: 'openNow', tone: 'open' });
});

test('no hours on the last day shows the real end time', () => {
  const s = getPopupStatus(popup({ hours: [], endsAt: at('2026-10-14T18:00:00') }), at('2026-10-14T12:00:00'));
  assert.deepEqual(s.primary, { key: 'openUntil', tone: 'open', params: { time: '18:00' } });
});

test('overnight hours that touch the next opening are merged', () => {
  const s = getPopupStatus(popup({ hours: everyDay('00:00', '00:00') }), at('2026-10-14T12:00:00'));
  assert.equal(s.primary.key, 'openNow');
});

test('ended pop-up', () => {
  const s = getPopupStatus(popup({ endsAt: at('2026-10-13T22:00:00') }), at('2026-10-14T12:00:00'));
  assert.equal(s.state, 'ended');
  assert.equal(s.primary.key, 'ended');
});

test('last day hint + closing time clipped to the event end', () => {
  const s = getPopupStatus(popup({ endsAt: at('2026-10-14T20:00:00') }), at('2026-10-14T12:00:00'));
  assert.deepEqual(s.primary.params, { time: '20:00' });
  assert.deepEqual(s.ending, { key: 'lastDay', tone: 'soon' });
});

test('ends tomorrow / in 2 days / no hint beyond 3 days', () => {
  const now = at('2026-10-14T12:00:00');
  assert.equal(getPopupStatus(popup({ endsAt: at('2026-10-15T22:00:00') }), now).ending?.key, 'endsTomorrow');
  assert.deepEqual(getPopupStatus(popup({ endsAt: at('2026-10-16T22:00:00') }), now).ending?.params, { count: 2 });
  assert.equal(getPopupStatus(popup({ endsAt: at('2026-10-18T22:00:00') }), now).ending, undefined);
});

test('an end at exactly midnight counts as the previous day', () => {
  const s = getPopupStatus(popup({ endsAt: at('2026-10-15T00:00:00') }), at('2026-10-14T12:00:00'));
  assert.equal(s.ending?.key, 'lastDay');
});

test('upcoming pop-up far in the future shows a date and no ending hint', () => {
  const s = getPopupStatus(
    popup({ startsAt: at('2026-11-20T10:00:00'), endsAt: at('2026-11-22T22:00:00') }),
    at('2026-10-14T12:00:00'),
  );
  assert.deepEqual(s.primary, { key: 'opensOnDate', tone: 'neutral', params: { date: '20.11' } });
  assert.equal(s.ending, undefined);
});

test('upcoming pop-up opening later this week respects its start time', () => {
  const s = getPopupStatus(
    popup({ startsAt: at('2026-10-16T16:00:00'), endsAt: at('2026-10-17T22:00:00') }),
    at('2026-10-14T12:00:00'),
  );
  assert.deepEqual(s.primary, { key: 'opensOnWeekday', tone: 'neutral', params: { time: '16:00', weekday: 5 } });
});

test('works the same regardless of the phone timezone (input is an absolute instant)', () => {
  const s = getPopupStatus(popup(), new Date('2026-10-14T09:00:00Z')); // 12:00 in Israel
  assert.equal(s.isOpenNow, true);
});
