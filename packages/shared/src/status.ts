// The single source of truth for "what does a pop-up's status line say right now".
// Used by the mobile app (cards, details page) and the admin panel, so they always agree.
// The SQL function `popup_is_open_at` mirrors the open/closed part of this logic.

import {
  DAY,
  MINUTE,
  formatLocalShortDate,
  formatLocalTime,
  localWeekday,
  parseTimeOfDay,
  startOfLocalDay,
  toLocalMs,
} from './time.ts';

export interface OpeningHoursRow {
  /** 0 = Sunday ... 6 = Saturday */
  weekday: number;
  /** "10:00" */
  opens: string;
  /** "22:00". If <= opens, the pop-up closes after midnight (e.g. 20:00–02:00). */
  closes: string;
}

export interface PopupTiming {
  startsAt: string | Date;
  endsAt: string | Date;
  /** IANA timezone of the pop-up, e.g. "Asia/Jerusalem" */
  timezone: string;
  /** Empty = open all day, every day, between startsAt and endsAt. */
  hours: OpeningHoursRow[];
}

/** Visual tone of a status: green / amber / grey. Text is always shown too, never color alone. */
export type StatusTone = 'open' | 'soon' | 'neutral';

/** i18n keys under "status." in the app's translation files. */
export type StatusKey =
  | 'openNow'
  | 'openUntil'
  | 'openUntilMidnight'
  | 'opensToday'
  | 'opensTomorrow'
  | 'opensOnWeekday'
  | 'opensOnDate'
  | 'closedNow'
  | 'ended'
  | 'lastDay'
  | 'endsTomorrow'
  | 'endsInDays';

export interface StatusLabel {
  key: StatusKey;
  tone: StatusTone;
  /** time: "18:00", weekday: 0-6, date: "24.10", count: number of days */
  params?: { time?: string; weekday?: number; date?: string; count?: number };
}

export interface PopupStatus {
  state: 'open' | 'opensLater' | 'closed' | 'ended';
  isOpenNow: boolean;
  /** Main status line: "פתוח עכשיו · עד 22:00" / "נפתח היום ב-18:00" / ... */
  primary: StatusLabel;
  /** Optional urgency hint: "יום אחרון!" / "מסתיים מחר" / "מסתיים בעוד יומיים" */
  ending?: StatusLabel;
}

/** How far ahead we look for the next opening before falling back to a plain date. */
const LOOKAHEAD_DAYS = 14;
/** Show "ends in X days" only when the end is this close. */
const ENDING_HINT_DAYS = 3;

interface Interval {
  start: number;
  end: number;
}

/** Opening intervals (in local ms) for the pop-up, around `nowLocal`. */
function openingIntervals(timing: PopupTiming, startL: number, endL: number, nowLocal: number): Interval[] {
  const today = startOfLocalDay(nowLocal);
  const intervals: Interval[] = [];

  // Start one day back so a "20:00–02:00" opening from yesterday is still seen as open at 01:00.
  for (let offset = -1; offset <= LOOKAHEAD_DAYS; offset++) {
    const dayStart = today + offset * DAY;
    const weekday = localWeekday(dayStart);

    const raw: Interval[] =
      timing.hours.length === 0
        ? [{ start: dayStart, end: dayStart + DAY }]
        : timing.hours
            .filter((h) => h.weekday === weekday)
            .map((h) => {
              const opens = parseTimeOfDay(h.opens);
              let closes = parseTimeOfDay(h.closes);
              if (closes <= opens) closes += 24 * 60;
              return { start: dayStart + opens * MINUTE, end: dayStart + closes * MINUTE };
            });

    for (const iv of raw) {
      const start = Math.max(iv.start, startL);
      const end = Math.min(iv.end, endL);
      if (end > start) intervals.push({ start, end });
    }
  }

  intervals.sort((a, b) => a.start - b.start);

  // Merge touching intervals (e.g. all-day opening on consecutive days), so "open until"
  // shows the real closing moment rather than midnight.
  const merged: Interval[] = [];
  for (const iv of intervals) {
    const last = merged[merged.length - 1];
    if (last && iv.start <= last.end) last.end = Math.max(last.end, iv.end);
    else merged.push({ ...iv });
  }
  return merged;
}

export function getPopupStatus(timing: PopupTiming, now: Date = new Date()): PopupStatus {
  const tz = timing.timezone;
  const nowL = toLocalMs(now, tz);
  const startL = toLocalMs(timing.startsAt, tz);
  const endL = toLocalMs(timing.endsAt, tz);

  if (nowL >= endL) {
    return { state: 'ended', isOpenNow: false, primary: { key: 'ended', tone: 'neutral' } };
  }

  const ending = nowL >= startL ? endingHint(nowL, endL) : undefined;
  const intervals = openingIntervals(timing, startL, endL, nowL);

  const current = intervals.find((iv) => iv.start <= nowL && nowL < iv.end);
  if (current) {
    let primary: StatusLabel;
    if (current.end - nowL > DAY) {
      // Open around the clock for more than a day: the closing time isn't useful.
      primary = { key: 'openNow', tone: 'open' };
    } else if (current.end % DAY === 0) {
      primary = { key: 'openUntilMidnight', tone: 'open' };
    } else {
      primary = { key: 'openUntil', tone: 'open', params: { time: formatLocalTime(current.end) } };
    }
    return { state: 'open', isOpenNow: true, primary, ending };
  }

  const next = intervals.find((iv) => iv.start > nowL);
  if (next) {
    return { state: 'opensLater', isOpenNow: false, primary: opensLabel(nowL, next.start), ending };
  }

  if (nowL < startL) {
    // Starts beyond our look-ahead window.
    return { state: 'opensLater', isOpenNow: false, primary: opensLabel(nowL, startL) };
  }

  return { state: 'closed', isOpenNow: false, primary: { key: 'closedNow', tone: 'neutral' }, ending };
}

function opensLabel(nowL: number, opensL: number): StatusLabel {
  const dayDiff = (startOfLocalDay(opensL) - startOfLocalDay(nowL)) / DAY;
  const time = formatLocalTime(opensL);
  if (dayDiff === 0) return { key: 'opensToday', tone: 'soon', params: { time } };
  if (dayDiff === 1) return { key: 'opensTomorrow', tone: 'neutral', params: { time } };
  if (dayDiff < 7) {
    return { key: 'opensOnWeekday', tone: 'neutral', params: { time, weekday: localWeekday(opensL) } };
  }
  return { key: 'opensOnDate', tone: 'neutral', params: { date: formatLocalShortDate(opensL) } };
}

function endingHint(nowL: number, endL: number): StatusLabel | undefined {
  // The last day is the day of the final moment (an end of exactly 00:00 belongs to the day before).
  const lastDay = startOfLocalDay(endL - 1);
  const days = (lastDay - startOfLocalDay(nowL)) / DAY;
  if (days === 0) return { key: 'lastDay', tone: 'soon' };
  if (days === 1) return { key: 'endsTomorrow', tone: 'soon' };
  if (days <= ENDING_HINT_DAYS) return { key: 'endsInDays', tone: 'soon', params: { count: days } };
  return undefined;
}
