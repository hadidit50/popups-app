'use client';

import type { CSSProperties } from 'react';
import { Link } from '@/components/Link';
import { CATEGORIES, formatLocalShortDate, toLocalMs, type PopupDetails } from '@whats-poppin/shared';
import { Icon, isIconName, type IconName } from '@/components/Icon';
import { PopupImage } from '@/components/PopupImage';
import { useI18n } from '@/lib/i18n-client';
import { HoursTable, LiveStatus } from './LiveStatus';
import { AdvertiserDisclaimer } from '@/features/legal/AdvertiserNotes';
import { PopupActions } from './PopupActions';
import styles from './PopupDetails.module.css';

type Props = { popup: PopupDetails & { status?: string } };

function Feature({ value, yes, no, icon }: { value: boolean | null; yes: string; no: string; icon: IconName }) {
  const { t } = useI18n();
  const known = value !== null && value !== undefined;
  return (
    <li className={value ? styles.yes : styles.no}>
      <Icon name={icon} size={22} />
      <span>{known ? (value ? yes : no) : `${yes}: ${t('details.unknown')}`}</span>
    </li>
  );
}

/** The pop-up page. Server-rendered for search engines and link previews; live parts are client islands. */
export function PopupDetailsView({ popup }: Props) {
  const { t, forward, back, city } = useI18n();
  const meta = CATEGORIES[popup.category] ?? CATEGORIES.more;
  const images = popup.images.length ? popup.images : [{ url: popup.cover_image_url ?? '', alt: popup.title }];
  const from = formatLocalShortDate(toLocalMs(popup.starts_at, popup.timezone));
  const to = formatLocalShortDate(toLocalMs(new Date(new Date(popup.ends_at).getTime() - 1), popup.timezone));

  return (
    <article className={styles.page}>
      <Link href="/" className={styles.back}>
        <Icon name={back} size={22} />
        {t('details.back')}
      </Link>

      {popup.status && popup.status !== 'approved' ? <p className={styles.pending}>{t('details.pendingNote')}</p> : null}

      <div className={styles.layout}>
        <div style={{ display: 'grid', gap: 'var(--space-lg)', minWidth: 0 }}>
          <div
            className={[styles.gallery, images.length > 1 && styles.galleryMany].filter(Boolean).join(' ')}
            role="region"
            aria-label={t('details.gallery', { title: popup.title })}
            tabIndex={0}
          >
            {images.map((img, i) => (
              <div key={i} aria-label={t('details.photoOf', { n: i + 1, total: images.length })} role="img">
                <PopupImage src={img.url || null} category={popup.category} aspectRatio="4 / 3" />
              </div>
            ))}
          </div>

          <header className={styles.head}>
            <div className={styles.badges}>
              <Link href={`/category/${meta.slug}`} className={styles.badge} style={{ '--accent': meta.color } as CSSProperties}>
                {isIconName(meta.icon) ? (
                  <span className={styles.badgeIcon}>
                    <Icon name={meta.icon} size={18} />
                  </span>
                ) : null}
                {t(`categories.${meta.slug}`)}
              </Link>
              {popup.price_range === 'free' ? <span className="t-meta-strong">{t('common.free')}</span> : null}
            </div>
            <h1 className="t-display">{popup.title}</h1>
            {popup.short_description ? <p className="t-body t-secondary">{popup.short_description}</p> : null}
            <LiveStatus popup={popup} />
          </header>

          <AdvertiserDisclaimer />
          <PopupActions popup={popup} />

          {popup.description ? (
            <section className={styles.card} aria-labelledby="about">
              <h2 id="about" className="t-heading">
                {t('details.about')}
              </h2>
              <p className={`t-body ${styles.description}`}>{popup.description}</p>
              {popup.organizer_name ? <p className="t-meta t-secondary">{t('details.organizer', { name: popup.organizer_name })}</p> : null}
            </section>
          ) : null}
        </div>

        <div className={styles.side}>
          <section className={styles.card} aria-labelledby="where">
            <h2 id="where" className={`t-heading ${styles.cardTitle}`}>
              <Icon name="map-marker-outline" size={22} />
              {t('details.where')}
            </h2>
            <p className="t-body">{popup.address}</p>
            <p className="t-meta t-secondary">{city(popup.city_slug, popup.city_name)}</p>
          </section>

          <section className={styles.card} aria-labelledby="when">
            <h2 id="when" className={`t-heading ${styles.cardTitle}`}>
              <Icon name="calendar-range" size={22} />
              {t('details.when')}
            </h2>
            <p className="t-body-strong">{t('details.dates', { from, to })}</p>
            <HoursTable hours={popup.hours} timezone={popup.timezone} />
          </section>

          <section className={styles.card} aria-labelledby="price">
            <h2 id="price" className={`t-heading ${styles.cardTitle}`}>
              <Icon name="ticket-outline" size={22} />
              {t('details.price')}
            </h2>
            <p className="t-body">{t(`details.priceText.${popup.price_range}`)}</p>
          </section>

          <section className={styles.card} aria-labelledby="access">
            <h2 id="access" className={`t-heading ${styles.cardTitle}`}>
              <Icon name="wheelchair-accessibility" size={22} />
              {t('details.accessibility')}
            </h2>
            <ul className={styles.list}>
              <Feature value={popup.wheelchair_accessible} yes={t('details.wheelchair')} no={t('details.noWheelchair')} icon="wheelchair-accessibility" />
              <Feature value={popup.parking_available} yes={t('details.parking')} no={t('details.noParking')} icon="parking" />
              <Feature value={popup.kid_friendly} yes={t('details.kids')} no={t('details.noKids')} icon="baby-carriage" />
            </ul>
            {popup.accessibility_notes ? <p className="t-body">{popup.accessibility_notes}</p> : null}
          </section>

          {popup.instagram_url || popup.website_url ? (
            <section className={styles.card} aria-labelledby="links">
              <h2 id="links" className="t-heading">
                {t('details.links')}
              </h2>
              <div className={styles.links}>
                {popup.instagram_url ? (
                  <a className="t-body-strong" href={popup.instagram_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 'var(--touch)', color: 'var(--color-primary)' }}>
                    <Icon name="instagram" size={22} />
                    {t('details.instagram')}
                    <Icon name={forward} size={18} />
                  </a>
                ) : null}
                {popup.website_url ? (
                  <a className="t-body-strong" href={popup.website_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 'var(--touch)', color: 'var(--color-primary)' }}>
                    <Icon name="web" size={22} />
                    {t('details.website')}
                    <Icon name={forward} size={18} />
                  </a>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
