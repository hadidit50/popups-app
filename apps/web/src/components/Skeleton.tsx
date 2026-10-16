'use client';

import { useI18n } from '@/lib/i18n-client';
import styles from './Skeleton.module.css';

/** Card-shaped loading placeholder, so the layout doesn't jump when content arrives. */
export function PopupCardSkeleton({ variant = 'large' }: { variant?: 'large' | 'compact' | 'row' }) {
  const { t } = useI18n();
  if (variant === 'row') {
    return (
      <div className={`${styles.card} ${styles.row}`} role="status" aria-label={t('common.loading')}>
        <div className={styles.image} style={{ width: 112, height: 112, flex: 'none' }} />
        <div className={styles.body} style={{ flex: 1 }}>
          <div className={styles.line} style={{ width: '50%' }} />
          <div className={styles.line} style={{ width: '85%' }} />
          <div className={styles.line} style={{ width: '60%' }} />
        </div>
      </div>
    );
  }
  return (
    <div className={[styles.card, variant === 'compact' && styles.compact].filter(Boolean).join(' ')} role="status" aria-label={t('common.loading')}>
      <div className={styles.image} style={{ aspectRatio: variant === 'compact' ? '4 / 3' : '16 / 10' }} />
      <div className={styles.body}>
        <div className={styles.line} style={{ width: '40%' }} />
        <div className={styles.line} style={{ width: '85%' }} />
        <div className={styles.line} style={{ width: '60%' }} />
      </div>
    </div>
  );
}
