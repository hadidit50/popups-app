import { t } from '@/lib/i18n';
import styles from './Skeleton.module.css';

/** Card-shaped loading placeholder, so the layout doesn't jump when content arrives. */
export function PopupCardSkeleton({ variant = 'large' }: { variant?: 'large' | 'compact' }) {
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
