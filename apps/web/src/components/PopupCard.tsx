'use client';

import { Link } from '@/components/Link';
import { useEffect, useRef, type CSSProperties } from 'react';
import { CATEGORIES, type PopupSummary } from '@whats-poppin/shared';
import { useI18n } from '@/lib/i18n-client';
import { useIsSaved } from '@/lib/saved';
import { formatDistance, popupStatusText } from '@/lib/status';
import { track } from '@/lib/track';
import { useNow } from '@/hooks/useNow';
import { Icon, isIconName } from './Icon';
import { PopupImage } from './PopupImage';
import { SponsoredTag } from './SponsoredTag';
import { StatusLine } from './StatusLine';
import styles from './PopupCard.module.css';

export interface PopupCardProps {
  popup: PopupSummary;
  /** Defaults to the pop-up's page. */
  href?: string;
  /** large = full-width feed card, compact = carousel card, row = thumbnail + text list item */
  variant?: 'large' | 'compact' | 'row';
  /** Where the card is shown ("hot", "nearby", "map"...), for analytics. */
  surface?: string;
  /** Show the ♡ save button (default true). */
  showSave?: boolean;
}

/**
 * The pop-up card. Everything needed to decide is visible without opening it:
 * image, name, category, distance (or city), status in words, and the "Sponsored" tag.
 */
export function PopupCard({ popup, href = `/p/${popup.slug}`, variant = 'large', surface, showSave = true }: PopupCardProps) {
  const i18n = useI18n();
  const { t } = i18n;
  const now = useNow();
  const [saved, toggleSaved] = useIsSaved(popup.id);
  const ref = useRef<HTMLElement>(null);

  // Sponsored items count an impression once they are actually on screen.
  useEffect(() => {
    if (!popup.is_sponsored || !ref.current || !('IntersectionObserver' in window)) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          track(popup.id, 'impression', surface, popup.promotion_id);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [popup.id, popup.is_sponsored, popup.promotion_id, surface]);

  const onToggleSave = () => {
    track(popup.id, saved ? 'unsave' : 'save', surface);
    toggleSaved();
  };
  const status = now
    ? popupStatusText(i18n, { startsAt: popup.starts_at, endsAt: popup.ends_at, timezone: popup.timezone, hours: popup.hours }, now)
    : null;
  const meta = CATEGORIES[popup.category] ?? CATEGORIES.more;
  const place = formatDistance(i18n, popup.distance_km) ?? i18n.city(popup.city_slug, popup.city_name);
  const free = popup.price_range === 'free' ? t('common.free') : null;
  const compact = variant === 'compact';
  const row = variant === 'row';

  return (
    <article ref={ref} className={[styles.card, compact && styles.compact, row && styles.row].filter(Boolean).join(' ')}>
      <Link
        href={href}
        className={styles.link}
        onClick={() => popup.is_sponsored && track(popup.id, 'click', surface, popup.promotion_id)}
      >
        <div className={styles.media}>
          <PopupImage src={popup.cover_image_url} category={popup.category} aspectRatio={row ? '1 / 1' : compact ? '4 / 3' : '16 / 10'} />
        </div>
        <div className={styles.body}>
          <div className={styles.topRow}>
            <span className={styles.badge} style={{ '--accent': meta.color } as CSSProperties}>
              {isIconName(meta.icon) ? (
                <span className={styles.badgeIcon}>
                  <Icon name={meta.icon} size={16} />
                </span>
              ) : null}
              {t(`categories.${meta.slug}`)}
            </span>
            {popup.is_sponsored ? <SponsoredTag /> : null}
          </div>
          <h3 className={styles.title}>{popup.title}</h3>
          <StatusLine text={status} />
          <p className={styles.meta}>
            {place}
            {free ? ` · ${free}` : ''}
          </p>
        </div>
      </Link>
      {showSave ? (
        <button
          type="button"
          className={styles.save}
          aria-pressed={saved}
          aria-label={t(saved ? 'a11y.unsaveButton' : 'a11y.saveButton', { title: popup.title })}
          onClick={onToggleSave}
        >
          <Icon name={saved ? 'heart' : 'heart-outline'} size={24} />
        </button>
      ) : null}
    </article>
  );
}
