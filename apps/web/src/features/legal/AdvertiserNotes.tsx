'use client';

import { Icon } from '@/components/Icon';
import { useI18n } from '@/lib/i18n-client';

/** "The business provided this information and is solely responsible for it." Shown near pop-up info. */
export function AdvertiserDisclaimer({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <p className="t-meta t-secondary" style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'flex-start', margin: compact ? 0 : undefined }}>
      <span style={{ flex: 'none', paddingTop: 2 }}>
        <Icon name="information-outline" size={18} />
      </span>
      <span>{t('common.advertiserDisclaimer')}</span>
    </p>
  );
}

/**
 * Advertiser area and promotion form: which documents apply, with links that open in a new tab so a
 * half-filled form is never lost. (The required consent checkbox comes with stage B.)
 */
export function AdvertiserTermsNote() {
  const { t, href } = useI18n();
  const link = { color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-flex', alignItems: 'center', minHeight: 'var(--touch)' } as const;
  return (
    <div className="t-meta t-secondary" style={{ display: 'grid', gap: 2 }}>
      <p>{t('legal.appliesToAdvertisers')}</p>
      <p style={{ display: 'flex', flexWrap: 'wrap', gap: '0 var(--space-md)' }}>
        <a href={href('/advertisers')} target="_blank" rel="noopener" style={link}>
          {t('legal.advertisers.title')}
        </a>
        <a href={href('/terms')} target="_blank" rel="noopener" style={link}>
          {t('legal.terms.title')}
        </a>
      </p>
    </div>
  );
}
