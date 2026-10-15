import type { Metadata } from 'next';
import { Page } from '@/components/Page';
import { SavedList } from '@/features/saved/SavedList';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: t('tabs.saved') };

export default function SavedPage() {
  return (
    <Page>
      <SavedList />
    </Page>
  );
}
