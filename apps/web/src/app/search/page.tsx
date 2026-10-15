import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Page } from '@/components/Page';
import { PopupCardSkeleton } from '@/components/Skeleton';
import { SearchResults } from '@/features/discover/SearchResults';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: t('search.title'), robots: { index: false } };

export default function SearchPage() {
  return (
    <Page>
      <Suspense fallback={<PopupCardSkeleton />}>
        <SearchResults />
      </Suspense>
    </Page>
  );
}
