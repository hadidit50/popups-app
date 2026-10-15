'use client';

import type { ReactNode } from 'react';
import type { PopupSummary } from '@whats-poppin/shared';
import { t } from '@/lib/i18n';
import { Button } from './Button';
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

  return (
    <div className={className}>
      {items.map((p) => (
        <PopupCard key={`${p.id}-${p.is_sponsored ? 's' : 'o'}`} popup={p} variant={variant} surface={surface} />
      ))}
    </div>
  );
}

/** Small inline "nothing here" note for feed sections. */
export function SectionNote({ children }: { children: ReactNode }) {
  return <p className={`t-body ${styles.note}`}>{children}</p>;
}
