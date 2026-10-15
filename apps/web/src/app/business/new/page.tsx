import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Page } from '@/components/Page';
import { PopupCardSkeleton } from '@/components/Skeleton';
import { BusinessEditor } from '@/features/business/BusinessEditor';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: t('form.newTitle'), robots: { index: false } };

export default function BusinessNewPage() {
  return (
    <Page>
      <div style={{ display: 'grid', gap: 'var(--space-lg)', maxWidth: '44rem', marginInline: 'auto' }}>
        <h1 className="t-display" style={{ paddingTop: 'var(--space-md)' }}>
          {t('form.newTitle')}
        </h1>
        <Suspense fallback={<PopupCardSkeleton />}>
          <BusinessEditor mode="new" />
        </Suspense>
      </div>
    </Page>
  );
}
