import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoDetails, demoDiscover, demoList, interleaveSponsored, weekendRange, zonedDayTime } from './demo.ts';
import { DEMO_SEED } from './demo-data.ts';

const now = new Date('2026-10-14T09:00:00Z'); // Wednesday 12:00 in Israel

test('demo data mirrors the seed: 25 approved pop-ups, 6 cities, 7 categories', () => {
  const live = DEMO_SEED.filter((p) => p.status === 'approved');
  assert.equal(live.length, 25);
  assert.equal(new Set(live.map((p) => p.city_slug)).size, 6);
  assert.equal(new Set(live.map((p) => p.category)).size, 7);
});

test('zonedDayTime converts Israel local time to an instant', () => {
  assert.equal(zonedDayTime(0, '18:00', 'Asia/Jerusalem', now).toISOString(), '2026-10-14T15:00:00.000Z');
  assert.equal(zonedDayTime(14, '18:00', 'Asia/Jerusalem', now).toISOString(), '2026-10-28T16:00:00.000Z'); // after DST ends
});

test('weekend range from a Wednesday is Thursday 00:00 → Sunday 00:00', () => {
  const w = weekendRange(now);
  assert.equal(new Date(w.start).toISOString(), '2026-10-14T21:00:00.000Z');
  assert.equal(new Date(w.end).toISOString(), '2026-10-17T21:00:00.000Z');
});

test('interleave: sponsored first, at most one per N, no duplicates', () => {
  const organic = Array.from({ length: 12 }, (_, i) => ({ id: `o${i}` }));
  const out = interleaveSponsored(organic, [{ id: 's1' }, { id: 's2' }, { id: 'o3' }], 5, 12);
  assert.deepEqual(out.map((x) => x.id).slice(0, 6), ['s1', 'o0', 'o1', 'o2', 'o4', 's2']);
  assert.equal(out.length, 12);
  assert.equal(new Set(out.map((x) => x.id)).size, 12);
});

test('hot list starts with a sponsored item and is sorted by activity', () => {
  const hot = demoList('hot', { limit: 10 }, now);
  assert.equal(hot.length, 10);
  assert.equal(hot[0].is_sponsored, true);
  assert.equal(hot.filter((p) => !p.is_sponsored)[0].slug, 'florentin-food-market');
});

test('nearby is sorted by distance and respects the radius', () => {
  const list = demoList('nearby', { lat: 32.0754, lng: 34.7752, radiusKm: 2, limit: 10 }, now);
  assert.equal(list[0].slug, 'sneaker-drop-dizengoff');
  assert.equal(list[0].is_sponsored, true);
  assert.ok(list.every((p) => (p.distance_km ?? 0) <= 2));
});

test('discover widens nearby radius and is empty far away', () => {
  assert.equal(demoDiscover(32.0853, 34.7818, now).nearby_radius_km, 10);
  const far = demoDiscover(30.6, 34.8, now);
  assert.equal(far.nearby.length, 0);
  assert.equal(far.nearby_radius_km, null);
});

test('filters and search', () => {
  assert.ok(demoList('all', { filters: { category: 'food' }, limit: 50 }, now).every((p) => p.category === 'food'));
  assert.ok(demoList('all', { filters: { free_only: true }, limit: 50 }, now).every((p) => p.price_range === 'free'));
  assert.ok(demoList('all', { filters: { query: 'טאקו' }, limit: 50 }, now).some((p) => p.slug === 'rothschild-taco-truck'));
  assert.ok(demoList('all', { filters: { query: 'חיפה' }, limit: 50 }, now).every((p) => p.city_slug === 'haifa'));
});

test('details: approved only', () => {
  assert.equal(demoDetails('emek-refaim-patisserie', now)?.hours.length, 6);
  assert.equal(demoDetails('pending-candle-workshop', now), null);
});
