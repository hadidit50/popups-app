import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Page } from '@/components/Page';
import { PopupCardSkeleton } from '@/components/Skeleton';
import { SponsoredTag } from '@/components/SponsoredTag';
import { AdvertiserTermsNote } from '@/features/legal/AdvertiserNotes';
import { PromoteForm, PromoteOptions } from '@/features/promote/PromoteForm';
import { getI18n } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t('promote.title'), description: t('promote.intro') };
}

export default async function PromotePage() {
  const { t } = await getI18n();
  return (
    <Page>
      <div style={{ display: 'grid', gap: 'var(--space-lg)', maxWidth: '40rem', marginInline: 'auto' }}>
        <header style={{ display: 'grid', gap: 'var(--space-xxs)', paddingTop: 'var(--space-md)' }}>
          <h1 className="t-display">{t('promote.title')}</h1>
          <p className="t-body t-secondary">{t('promote.intro')}</p>
        </header>
        <PromoteOptions />
        <p className="t-body" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-xs)' }}>
          <SponsoredTag /> {t('promote.honest')}
        </p>
        <AdvertiserTermsNote />
        <Suspense fallback={<PopupCardSkeleton />}>
          <PromoteForm />
        </Suspense>
      </div>
    </Page>
  );
}
