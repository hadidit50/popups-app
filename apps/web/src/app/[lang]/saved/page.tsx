import type { Metadata } from 'next';
import { Page } from '@/components/Page';
import { SavedList } from '@/features/saved/SavedList';
import { getI18n } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t('tabs.saved') };
}

export default function SavedPage() {
  return (
    <Page>
      <SavedList />
    </Page>
  );
}
