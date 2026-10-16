import { getPopupStatus, splitDistance, type PopupTiming, type StatusLabel, type PopupStatus } from '@whats-poppin/shared';
import type { I18n } from './i18n';

export interface PopupStatusText {
  status: PopupStatus;
  /** "פתוח עכשיו · עד 22:00" */
  primary: string;
  /** "יום אחרון!" — only when it ends within 3 days */
  ending?: string;
  /** Both, for screen readers. */
  full: string;
}

function label({ t, tList }: I18n, l: StatusLabel): string {
  const key = l.key === 'endsInDays' && l.params?.count === 2 ? 'endsInTwoDays' : l.key;
  const weekday = l.params?.weekday === undefined ? undefined : tList('weekdays')[l.params.weekday];
  return t(`status.${key}`, { ...l.params, weekday });
}

/** Friendly status words for a pop-up, in its own timezone. */
export function popupStatusText(i18n: I18n, timing: PopupTiming, now: Date = new Date()): PopupStatusText {
  const status = getPopupStatus(timing, now);
  const primary = label(i18n, status.primary);
  const ending = status.ending ? label(i18n, status.ending) : undefined;
  return { status, primary, ending, full: ending ? `${primary}, ${ending}` : primary };
}

/** "350 מ׳ ממך" / "1.2 ק״מ ממך", or null when we don't know the distance. */
export function formatDistance({ t }: I18n, km: number | null | undefined): string | null {
  if (km === null || km === undefined) return null;
  const { unit, value } = splitDistance(km);
  return t(`distance.${unit}`, { value });
}
