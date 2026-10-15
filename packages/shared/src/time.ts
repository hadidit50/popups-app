// Time helpers that work in a pop-up's own timezone, regardless of the phone's timezone.
//
// We represent a local wall-clock moment as "local ms": the number of ms since epoch
// as if the local wall-clock time were UTC. This makes day/weekday math trivial and
// DST-safe for display purposes (we never convert local ms back to a real instant).

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** Converts a real instant to "local ms" in the given IANA timezone. */
export function toLocalMs(instant: Date | string, timeZone: string): number {
  const date = typeof instant === 'string' ? new Date(instant) : instant;
  const parts: Record<string, number> = {};
  for (const p of formatterFor(timeZone).formatToParts(date)) {
    if (p.type !== 'literal') parts[p.type] = Number(p.value);
  }
  // Some engines report midnight as hour 24 even with h23.
  const hour = parts.hour === 24 ? 0 : parts.hour;
  return Date.UTC(parts.year, parts.month - 1, parts.day, hour, parts.minute, parts.second);
}

/** Start of the local day (00:00) for a local-ms value. */
export function startOfLocalDay(localMs: number): number {
  return Math.floor(localMs / DAY) * DAY;
}

/** 0 = Sunday ... 6 = Saturday (Israeli week starts on Sunday). */
export function localWeekday(localMs: number): number {
  return new Date(localMs).getUTCDay();
}

/** "18:00" */
export function formatLocalTime(localMs: number): string {
  const d = new Date(localMs);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** "24.10" (day.month, the common Israeli short format) */
export function formatLocalShortDate(localMs: number): string {
  const d = new Date(localMs);
  return `${d.getUTCDate()}.${d.getUTCMonth() + 1}`;
}

/** Parses "18:30" or "18:30:00" into minutes after midnight. */
export function parseTimeOfDay(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + (m || 0);
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** "2026-10-14" + "18:00" in `timeZone` → the real instant. DST-safe. */
export function localDateTimeToInstant(date: string, time: string, timeZone: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const target = Date.UTC(y, m - 1, d) + parseTimeOfDay(time) * MINUTE;
  let guess = target;
  for (let i = 0; i < 3; i++) guess = target - (toLocalMs(new Date(guess), timeZone) - guess);
  return new Date(guess);
}

/** Instant → "YYYY-MM-DD" in `timeZone` (for date inputs). */
export function instantToLocalDate(instant: Date | string, timeZone: string): string {
  const d = new Date(toLocalMs(instant, timeZone));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}
