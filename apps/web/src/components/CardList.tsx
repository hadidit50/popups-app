'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { PopupSummary } from '@whats-poppin/shared';
import { prefersLessMotion } from '@/lib/a11y-prefs';
import { useI18n } from '@/lib/i18n-client';
import { Button } from './Button';
import { Icon } from './Icon';
import { PopupCard } from './PopupCard';
import { PopupCardSkeleton } from './Skeleton';
import { ErrorState } from './StateView';
import styles from './CardList.module.css';

interface CardListProps {
  items: PopupSummary[] | undefined;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  layout: 'carousel' | 'grid' | 'rows';
  surface: string;
  /** Shown when the list is empty — always says what to do next. */
  empty: ReactNode;
  skeletons?: number;
}

/** A list of pop-up cards with built-in loading, error and empty states. */
export function CardList({ items, loading, error, onRetry, layout, surface, empty, skeletons = 3 }: CardListProps) {
  const { t } = useI18n();
  const variant = layout === 'carousel' ? 'compact' : layout === 'rows' ? 'row' : 'large';
  const className = layout === 'carousel' ? styles.carousel : layout === 'rows' ? styles.rows : styles.grid;

  if (loading) {
    return (
      <div className={className}>
        {Array.from({ length: skeletons }, (_, i) => (
          <PopupCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }
  if (error) {
    const offline = typeof navigator !== 'undefined' && !navigator.onLine;
    return <ErrorState offline={offline} action={<Button onClick={onRetry} icon="refresh">{t('common.tryAgain')}</Button>} />;
  }
  if (!items || items.length === 0) return <>{empty}</>;

  const cards = items.map((p) => <PopupCard key={`${p.id}-${p.is_sponsored ? 's' : 'o'}`} popup={p} variant={variant} surface={surface} />);
  return layout === 'carousel' ? <Carousel>{cards}</Carousel> : <div className={className}>{cards}</div>;
}

/**
 * Horizontal row. Touch: swipe. Mouse: previous/next buttons (wide screens only), each scrolling
 * about one screen of cards, disabled at the ends.
 */
function Carousel({ children }: { children: ReactNode }) {
  const { t, dir, forward } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    // scrollLeft is negative in RTL, so compare distances.
    const offset = Math.abs(el.scrollLeft);
    setEdges({ start: offset < 4, end: offset + el.clientWidth >= el.scrollWidth - 4 });
  };
  useEffect(update, [children]);

  const step = (towardsEnd: boolean) => {
    const el = ref.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85 * (towardsEnd ? 1 : -1) * (dir === 'rtl' ? -1 : 1);
    el.scrollBy({ left: amount, behavior: prefersLessMotion() ? 'auto' : 'smooth' });
  };
  const backIcon = forward === 'chevron-left' ? 'chevron-right' : 'chevron-left';

  return (
    <div className={styles.carouselWrap}>
      <div ref={ref} className={styles.carousel} onScroll={update}>
        {children}
      </div>
      <button type="button" className={`${styles.arrow} ${styles.arrowStart}`} aria-label={t('a11y.scrollPrev')} disabled={edges.start} onClick={() => step(false)}>
        <Icon name={backIcon} size={24} />
      </button>
      <button type="button" className={`${styles.arrow} ${styles.arrowEnd}`} aria-label={t('a11y.scrollNext')} disabled={edges.end} onClick={() => step(true)}>
        <Icon name={forward} size={24} />
      </button>
    </div>
  );
}

/** Small inline "nothing here" note for feed sections. */
export function SectionNote({ children }: { children: ReactNode }) {
  return <p className={`t-body ${styles.note}`}>{children}</p>;
}
