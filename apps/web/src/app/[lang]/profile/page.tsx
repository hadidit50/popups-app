import type { Metadata } from 'next';
import { Page } from '@/components/Page';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { getI18n } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t('tabs.profile') };
}

export default function ProfilePage() {
  return (
    <Page>
      <ProfileScreen />
    </Page>
  );
}
