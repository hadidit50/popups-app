import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Button, EmptyState, Screen, colors, radius, spacing } from '@/ui';
import { ConnectionCheck } from '@/features/dev/ConnectionCheck';

// Stage 1 placeholder + developer tools. Preferences, notifications and "Submit a pop-up" arrive in stages 6–8.
export default function ProfileScreen() {
  const { t } = useTranslation();
  return (
    <Screen scroll>
      <EmptyState icon="account-cog-outline" title={t('profile.placeholderTitle')} body={t('profile.placeholderBody')} />
      {__DEV__ ? (
        <View style={styles.dev}>
          <AppText variant="heading" accessibilityRole="header">
            {t('profile.devSection')}
          </AppText>
          <ConnectionCheck />
          <Button
            variant="secondary"
            icon="palette-swatch-outline"
            label={t('profile.uiPreview')}
            onPress={() => router.push('/dev/ui-preview')}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  dev: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
});
