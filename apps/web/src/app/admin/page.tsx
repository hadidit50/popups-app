import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Page } from '@/components/Page';
import { PopupCardSkeleton } from '@/components/Skeleton';
import { AdminApp } from '@/features/admin/AdminApp';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: t('admin.title'), robots: { index: false } };

export default function AdminPage() {
  return (
    <Page>
      <div style={{ display: 'grid', gap: 'var(--space-md)', maxWidth: '56rem', marginInline: 'auto' }}>
        <h1 className="t-display" style={{ paddingTop: 'var(--space-md)' }}>
          {t('admin.title')}
        </h1>
        <Suspense fallback={<PopupCardSkeleton variant="row" />}>
          <AdminApp />
        </Suspense>
      </div>
    </Page>
  );
}
