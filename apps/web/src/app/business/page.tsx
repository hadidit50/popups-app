import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Page } from '@/components/Page';
import { BusinessPage } from '@/features/business/BusinessPage';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: t('business.title'), robots: { index: false } };

export default function Business() {
  return (
    <Page>
      <div style={{ display: 'grid', gap: 'var(--space-lg)', maxWidth: '44rem', marginInline: 'auto' }}>
        <header style={{ display: 'grid', gap: 'var(--space-xxs)', paddingTop: 'var(--space-md)' }}>
          <h1 className="t-display">{t('business.title')}</h1>
          <p className="t-body t-secondary">{t('business.intro')}</p>
        </header>
        <Suspense>
          <BusinessPage />
        </Suspense>
      </div>
    </Page>
  );
}
