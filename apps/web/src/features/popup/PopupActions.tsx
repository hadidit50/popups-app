'use client';

import { useEffect, useState } from 'react';
import type { PopupDetails } from '@whats-poppin/shared';
import { Icon } from '@/components/Icon';
import { useI18n } from '@/lib/i18n-client';
import { useIsSaved } from '@/lib/saved';
import { track } from '@/lib/track';
import { lastDayReminderIcs } from './calendar';
import { appleMapsUrl, googleMapsUrl, wazeUrl } from './nav-links';
import { ButtonLink } from '@/components/Button';
import styles from './PopupDetails.module.css';

/**
 * Navigate (Waze / Google Maps — no extra chooser step), save, share and calendar reminder.
 * From the home page that's 2 taps to navigation: card → "ניווט".
 */
export function PopupActions({ popup }: { popup: PopupDetails }) {
  const { t } = useI18n();
  const [saved, toggleSaved] = useIsSaved(popup.id);
  const [toast, setToast] = useState<string | null>(null);
  const [isApple, setIsApple] = useState(false);

  useEffect(() => {
    setIsApple(/iPhone|iPad|Macintosh/.test(navigator.userAgent));
    track(popup.id, 'view', 'details');
  }, [popup.id]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  const pageUrl = () => window.location.href.split('#')[0];

  const share = async () => {
    track(popup.id, 'share', 'details');
    const data = { title: popup.title, text: popup.short_description ?? popup.title, url: pageUrl() };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(data.url);
      setToast(t('details.linkCopied'));
    } catch {
      /* the visitor closed the share sheet */
    }
  };

  const remind = () => {
    const ics = lastDayReminderIcs({
      title: t('details.calendarTitle', { title: popup.title }),
      url: pageUrl(),
      address: popup.address,
      endsAt: popup.ends_at,
      timezone: popup.timezone,
    });
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${popup.slug}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
  };

  const navigate = (app: string) => track(popup.id, 'navigate', `details_${app}`);

  return (
    <div className={styles.actions}>
      <div className={styles.sticky}>
        <div className={styles.navRow}>
          <ButtonLink
            href={wazeUrl(popup.lat, popup.lng)}
            external
            icon="waze"
            fullWidth
            onClick={() => navigate('waze')}
            aria-label={t('details.navigateLabel', { title: popup.title, app: 'Waze' })}
          >
            Waze
          </ButtonLink>
          <ButtonLink
            href={googleMapsUrl(popup.lat, popup.lng)}
            external
            icon="google-maps"
            fullWidth
            variant="secondary"
            onClick={() => navigate('google')}
            aria-label={t('details.navigateLabel', { title: popup.title, app: 'Google Maps' })}
          >
            Google Maps
          </ButtonLink>
        </div>
      </div>
      {isApple ? (
        <a className={styles.apple} href={appleMapsUrl(popup.lat, popup.lng)} target="_blank" rel="noopener noreferrer" onClick={() => navigate('apple')}>
          <Icon name="apple" size={18} />
          {t('details.navigateApple')}
        </a>
      ) : null}
      <div className={styles.secondaryRow}>
        <button
          type="button"
          className={styles.iconAction}
          aria-pressed={saved}
          aria-label={t(saved ? 'a11y.unsaveButton' : 'a11y.saveButton', { title: popup.title })}
          onClick={() => {
            track(popup.id, saved ? 'unsave' : 'save', 'details');
            toggleSaved();
          }}
        >
          <Icon name={saved ? 'heart' : 'heart-outline'} size={26} />
          {saved ? t('details.saved') : t('details.save')}
        </button>
        <button type="button" className={styles.iconAction} onClick={share}>
          <Icon name="share-variant" size={26} />
          {t('details.share')}
        </button>
        <button type="button" className={styles.iconAction} onClick={remind} aria-label={t('details.remindLabel', { title: popup.title })}>
          <Icon name="calendar-plus" size={26} />
          {t('details.remind')}
        </button>
      </div>
      {toast ? (
        <p className={styles.toast} role="status">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
