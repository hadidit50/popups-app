import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText, EmptyState, Screen, colors, spacing } from '@/ui';

// Stage 1 placeholder. The real feed (Hot now, Near me, This weekend, Ending soon) arrives in stage 2.
export default function DiscoverScreen() {
  const { t } = useTranslation();
  return (
    <Screen scroll>
      <View style={styles.header}>
        <AppText variant="display" accessibilityRole="header">
          {t('app.name')}
        </AppText>
        <AppText variant="body" color={colors.textSecondary}>
          {t('app.tagline')}
        </AppText>
      </View>
      <EmptyState
        icon="party-popper"
        title={t('discover.placeholderTitle')}
        body={t('discover.placeholderBody')}
        actionLabel={t('discover.openPreview')}
        onAction={() => router.push('/dev/ui-preview')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.md, paddingBottom: spacing.lg, gap: spacing.xxs },
});
