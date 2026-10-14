import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';

/** Always shown on promoted content. Never hide or shrink it — user trust depends on it. */
export function SponsoredTag() {
  const { t } = useTranslation();
  return (
    <View style={styles.tag}>
      <AppText variant="metaStrong" color={colors.sponsored} maxFontSizeMultiplier={1.6}>
        {t('common.sponsored')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.sponsoredSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
});
