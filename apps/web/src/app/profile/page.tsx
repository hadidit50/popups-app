import type { Metadata } from 'next';
import { Page } from '@/components/Page';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: t('tabs.profile') };

export default function ProfilePage() {
  return (
    <Page>
      <ProfileScreen />
    </Page>
  );
}
