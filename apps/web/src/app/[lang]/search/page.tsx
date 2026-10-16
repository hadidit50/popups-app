import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Page } from '@/components/Page';
import { PopupCardSkeleton } from '@/components/Skeleton';
import { SearchResults } from '@/features/discover/SearchResults';
import { getI18n } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t('search.title'), robots: { index: false } };
}

export default function SearchPage() {
  return (
    <Page>
      <Suspense fallback={<PopupCardSkeleton />}>
        <SearchResults />
      </Suspense>
    </Page>
  );
}
