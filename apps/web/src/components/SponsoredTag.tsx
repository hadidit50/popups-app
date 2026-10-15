import { t } from '@/lib/i18n';

/** Always shown on promoted content. Never hide or shrink it — user trust depends on it. */
export function SponsoredTag() {
  return (
    <span
      className="t-meta-strong"
      style={{
        display: 'inline-block',
        background: 'var(--color-sponsored-soft)',
        color: 'var(--color-sponsored)',
        borderRadius: 'var(--radius-sm)',
        padding: '2px var(--space-xs)',
      }}
    >
      {t('common.sponsored')}
    </span>
  );
}
