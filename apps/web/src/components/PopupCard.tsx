'use client';

import Link from 'next/link';
import { CATEGORIES, type PopupSummary } from '@whats-poppin/shared';
import { t } from '@/lib/i18n';
import { formatDistance, popupStatusText } from '@/lib/status';
import { useNow } from '@/hooks/useNow';
import { Icon, isIconName } from './Icon';
import { PopupImage } from './PopupImage';
import { SponsoredTag } from './SponsoredTag';
import { StatusLine } from './StatusLine';
import styles from './PopupCard.module.css';

export interface PopupCardProps {
  popup: PopupSummary;
  href: string;
  /** large = full-width feed card, compact = carousel card */
  variant?: 'large' | 'compact';
  saved?: boolean;
  onToggleSave?: () => void;
}

/**
 * The pop-up card. Everything needed to decide is visible without opening it:
 * image, name, category, distance (or city), status in words, and the "Sponsored" tag.
 */
export function PopupCard({ popup, href, variant = 'large', saved = false, onToggleSave }: PopupCardProps) {
  const now = useNow();
  const status = now
    ? popupStatusText({ startsAt: popup.starts_at, endsAt: popup.ends_at, timezone: popup.timezone, hours: popup.hours }, now)
    : null;
  const meta = CATEGORIES[popup.category] ?? CATEGORIES.more;
  const place = formatDistance(popup.distance_km) ?? popup.city_name;
  const free = popup.price_range === 'free' ? t('common.free') : null;
  const compact = variant === 'compact';

  return (
    <article className={[styles.card, compact && styles.compact].filter(Boolean).join(' ')}>
      <Link href={href} className={styles.link}>
        <PopupImage src={popup.cover_image_url} category={popup.category} aspectRatio={compact ? '4 / 3' : '16 / 10'} />
        <div className={styles.body}>
          <div className={styles.topRow}>
            <span className={styles.badge} style={{ background: meta.color }}>
              {isIconName(meta.icon) ? <Icon name={meta.icon} size={16} /> : null}
              {t(`categories.${meta.slug}`)}
            </span>
            {popup.is_sponsored ? <SponsoredTag /> : null}
          </div>
          <h3 className={styles.title}>{popup.title}</h3>
          <StatusLine text={status} />
          <p className={styles.meta}>
            <Icon name="map-marker-outline" size={18} />
            <span>
              {place}
              {free ? ` · ${free}` : ''}
            </span>
          </p>
        </div>
      </Link>
      {onToggleSave ? (
        <button
          type="button"
          className={styles.save}
          aria-pressed={saved}
          aria-label={t(saved ? 'a11y.unsaveButton' : 'a11y.saveButton', { title: popup.title })}
          onClick={onToggleSave}
        >
          <Icon name={saved ? 'heart' : 'heart-outline'} size={26} />
        </button>
      ) : null}
    </article>
  );
}
