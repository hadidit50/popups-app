'use client';

import { localWeekday, toLocalMs, type OpeningHoursRow, type PopupDetails } from '@whats-poppin/shared';
import { ButtonLink } from '@/components/Button';
import { StatusLine } from '@/components/StatusLine';
import { useNow } from '@/hooks/useNow';
import { t, tList } from '@/lib/i18n';
import { popupStatusText } from '@/lib/status';
import styles from './PopupDetails.module.css';

/** Status in words, from the visitor's clock. Ended pop-ups get a friendly banner instead. */
export function LiveStatus({ popup }: { popup: PopupDetails }) {
  const now = useNow();
  const text = now
    ? popupStatusText({ startsAt: popup.starts_at, endsAt: popup.ends_at, timezone: popup.timezone, hours: popup.hours }, now)
    : null;
  if (text?.status.state === 'ended') {
    const category = t(`categories.${popup.category}`);
    return (
      <div className={styles.banner} role="status">
        <p className="t-heading">{t('details.endedTitle')}</p>
        <p className="t-body">{t('details.endedBody')}</p>
        <ButtonLink href={`/category/${popup.category}`} icon="compass-outline" fullWidth>
          {t('details.endedAction', { category })}
        </ButtonLink>
      </div>
    );
  }
  return <StatusLine text={text} />;
}

/** Weekly hours with today highlighted (in the pop-up's timezone). */
export function HoursTable({ hours, timezone }: { hours: OpeningHoursRow[]; timezone: string }) {
  const now = useNow();
  const today = now ? localWeekday(toLocalMs(now, timezone)) : -1;
  const names = tList('weekdays');
  if (hours.length === 0) return <p className="t-body">{t('details.hoursAllDay')}</p>;
  return (
    <table className={styles.hours}>
      <caption className="visually-hidden">{t('details.hours')}</caption>
      <tbody>
        {names.map((name, weekday) => {
          const rows = hours.filter((h) => h.weekday === weekday);
          return (
            <tr key={weekday} data-today={weekday === today}>
              <th scope="row">
                {name}
                {weekday === today ? ` · ${t('details.today')}` : ''}
              </th>
              <td dir="ltr">{rows.length ? rows.map((h) => `${h.opens}–${h.closes}`).join(', ') : t('details.closedDay')}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
