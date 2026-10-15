'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { CATEGORY_SLUGS, samplePopups, type CategorySlug } from '@whats-poppin/shared';
import { Button } from '@/components/Button';
import { CategoryChip, FilterChip } from '@/components/Chip';
import { PopupCard } from '@/components/PopupCard';
import { SectionHeader } from '@/components/SectionHeader';
import { PopupCardSkeleton } from '@/components/Skeleton';
import { SponsoredTag } from '@/components/SponsoredTag';
import { ErrorState, StateView } from '@/components/StateView';
import { useNow } from '@/hooks/useNow';
import { PopupForm } from '@/features/editor/PopupForm';
import { emptyPopupForm } from '@/lib/popup-editor';
import { LAUNCH_CITIES } from '@whats-poppin/shared';
import { t } from '@/lib/i18n';
import styles from './DesignPreview.module.css';

const SWATCHES = ['primary', 'text', 'text-secondary', 'surface', 'open', 'soon', 'neutral', 'sponsored', 'error'];
const TYPE_SCALE = ['t-display', 't-title', 't-heading', 't-body', 't-body-strong', 't-meta', 't-meta-strong'];

/** Living style guide: every design-system piece on one page, in Hebrew RTL. */
export function DesignPreview() {
  // Sample dates are relative to the visitor's clock, so they are built after the page loads.
  const now = useNow(60 * 60_000);
  const nowMs = now?.getTime();
  const popups = useMemo(() => (nowMs ? samplePopups(nowMs) : []), [nowMs]);
  const [category, setCategory] = useState<CategorySlug | null>(null);
  const [openNow, setOpenNow] = useState(true);
  const [free, setFree] = useState(false);

  return (
    <div className={styles.stack}>
      <header className={styles.intro}>
        <h1 className="t-display">{t('preview.title')}</h1>
        <p className="t-body t-secondary">{t('preview.intro')}</p>
      </header>

      <Section title={t('preview.cards')}>
        <SectionHeader title={t('preview.sampleHeading')} seeAllHref="/design" />
        <div className={styles.carousel}>
          {popups.length === 0
            ? [0, 1].map((i) => <PopupCardSkeleton key={i} variant="compact" />)
            : popups.map((p) => (
                <PopupCard key={p.id} popup={p} href="/design" variant="compact" surface="design" />
              ))}
        </div>
        <div className={styles.grid}>
          {popups.length === 0
            ? [0, 1].map((i) => <PopupCardSkeleton key={i} />)
            : popups.slice(0, 2).map((p) => (
                <PopupCard key={p.id} popup={p} href="/design" surface="design" />
              ))}
        </div>
      </Section>

      <Section title={t('preview.chips')}>
        <div className={styles.chipRow}>
          <CategoryChip slug={null} selected={category === null} onToggle={() => setCategory(null)} />
          {CATEGORY_SLUGS.map((slug) => (
            <CategoryChip key={slug} slug={slug} selected={category === slug} onToggle={() => setCategory(slug)} />
          ))}
        </div>
        <div className={styles.wrapRow}>
          <FilterChip label="פתוח עכשיו" icon="clock-outline" selected={openNow} onToggle={() => setOpenNow((v) => !v)} />
          <FilterChip label="חינם" icon="ticket-outline" selected={free} onToggle={() => setFree((v) => !v)} />
          <SponsoredTag />
        </div>
      </Section>

      <Section title={t('preview.buttons')}>
        <div className={styles.buttons}>
          <Button icon="navigation-variant" fullWidth>
            {t('preview.primaryButton')}
          </Button>
          <Button variant="secondary" icon="share-variant" fullWidth>
            {t('preview.secondaryButton')}
          </Button>
          <Button variant="ghost">{t('preview.ghostButton')}</Button>
          <Button loading fullWidth>
            {t('common.loading')}
          </Button>
        </div>
      </Section>

      <Section title={t('preview.typography')}>
        {TYPE_SCALE.map((cls) => (
          <p key={cls} className={cls}>
            {cls === 't-display' ? t('preview.sampleDisplay') : cls === 't-title' ? t('preview.sampleTitle') : t('preview.sampleBody')}
          </p>
        ))}
      </Section>

      <Section title={t('preview.colors')}>
        <div className={styles.swatches}>
          {SWATCHES.map((name) => (
            <div key={name} className={styles.swatch}>
              <span className={styles.swatchColor} style={{ background: `var(--color-${name})` }} />
              <span className="t-meta t-secondary" dir="ltr">
                {name}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t('form.newTitle')}>
        {now ? <PopupForm
          initial={emptyPopupForm()}
          cities={LAUNCH_CITIES.map((c, i) => ({ id: i + 1, slug: c.slug, name_he: t(`cities.${c.slug}`), timezone: null, country_code: c.countryCode }))}
          mode="organizer"
          onSaved={() => undefined}
        /> : null}
      </Section>

      <Section title={t('preview.states')}>
        <div className={styles.states}>
          <PopupCardSkeleton />
          <div className={styles.stateBox}>
            <StateView icon="heart-outline" title={t('saved.emptyTitle')} body={t('saved.emptyBody')} action={<Button fullWidth>{t('saved.emptyAction')}</Button>} />
          </div>
          <div className={styles.stateBox}>
            <ErrorState offline action={<Button fullWidth>{t('common.retry')}</Button>} />
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className="t-title">{title}</h2>
      {children}
    </section>
  );
}
