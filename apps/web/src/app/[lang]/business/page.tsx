import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Page } from '@/components/Page';
import { BusinessPage } from '@/features/business/BusinessPage';
import { AdvertiserTermsNote } from '@/features/legal/AdvertiserNotes';
import { getI18n } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t('business.title'), robots: { index: false } };
}

export default async function Business() {
  const { t } = await getI18n();
  return (
    <Page>
      <div style={{ display: 'grid', gap: 'var(--space-lg)', maxWidth: '44rem', marginInline: 'auto' }}>
        <header style={{ display: 'grid', gap: 'var(--space-xxs)', paddingTop: 'var(--space-md)' }}>
          <h1 className="t-display">{t('business.title')}</h1>
          <p className="t-body t-secondary">{t('business.intro')}</p>
          <AdvertiserTermsNote />
        </header>
        <Suspense>
          <BusinessPage />
        </Suspense>
      </div>
    </Page>
  );
}
