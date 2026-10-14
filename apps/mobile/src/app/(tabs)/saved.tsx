import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EmptyState, Screen } from '@/ui';

// Stage 1: the empty state. Saving + reminders arrive in stage 4.
export default function SavedScreen() {
  const { t } = useTranslation();
  return (
    <Screen scroll>
      <EmptyState
        icon="heart-outline"
        title={t('saved.emptyTitle')}
        body={t('saved.emptyBody')}
        actionLabel={t('saved.emptyAction')}
        onAction={() => router.navigate('/')}
      />
    </Screen>
  );
}
