import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getPopupStatus, type PopupStatus, type PopupTiming, type StatusLabel } from '@whats-poppin/shared';

export interface PopupStatusText {
  status: PopupStatus;
  /** "פתוח עכשיו · עד 22:00" */
  primary: string;
  /** "יום אחרון!" — only when it ends within 3 days */
  ending?: string;
  /** Both, for screen readers. */
  full: string;
}

/** Translates a pop-up's status into friendly words. `now` is injectable for previews/tests. */
export function usePopupStatusText(timing: PopupTiming, now?: Date): PopupStatusText {
  const { t } = useTranslation();
  return useMemo(() => {
    const status = getPopupStatus(timing, now);
    const label = (l: StatusLabel) => {
      const weekdays = t('weekdays', { returnObjects: true }) as string[];
      const key = l.key === 'endsInDays' && l.params?.count === 2 ? 'endsInTwoDays' : l.key;
      return t(`status.${key}`, {
        ...l.params,
        weekday: l.params?.weekday === undefined ? undefined : weekdays[l.params.weekday],
      });
    };
    const primary = label(status.primary);
    const ending = status.ending ? label(status.ending) : undefined;
    return { status, primary, ending, full: ending ? `${primary}, ${ending}` : primary };
  }, [timing, now, t]);
}
