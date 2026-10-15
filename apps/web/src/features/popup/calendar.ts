import { DAY, startOfLocalDay, toLocalMs } from '@whats-poppin/shared';

function stamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
function dateOnly(localMs: number) {
  const d = new Date(localMs);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
}
function escape(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => `\\${c}`);
}

/**
 * An all-day calendar event on the pop-up's last day, with an alert the day before.
 * Works on every phone without notifications permission.
 */
export function lastDayReminderIcs(opts: { title: string; url: string; address: string; endsAt: string; timezone: string }) {
  const lastDay = startOfLocalDay(toLocalMs(new Date(new Date(opts.endsAt).getTime() - 1), opts.timezone));
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WHATS POPPIN//HE',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@whatspoppin`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART;VALUE=DATE:${dateOnly(lastDay)}`,
    `DTEND;VALUE=DATE:${dateOnly(lastDay + DAY)}`,
    `SUMMARY:${escape(opts.title)}`,
    `LOCATION:${escape(opts.address)}`,
    `URL:${opts.url}`,
    `DESCRIPTION:${escape(opts.url)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escape(opts.title)}`,
    'TRIGGER:-PT12H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}
