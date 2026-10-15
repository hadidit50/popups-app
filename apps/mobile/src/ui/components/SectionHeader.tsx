import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { Touchable } from './Touchable';
import { forwardChevron } from '../../lib/rtl';

interface SectionHeaderProps {
  title: string;
  /** Shows a "הכל ›" link when provided. */
  onSeeAll?: () => void;
  seeAllLabel?: string;
}

export function SectionHeader({ title, onSeeAll, seeAllLabel }: SectionHeaderProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <AppText variant="title" accessibilityRole="header" style={styles.title}>
        {title}
      </AppText>
      {onSeeAll ? (
        <Touchable
          onPress={onSeeAll}
          accessibilityRole="link"
          accessibilityLabel={seeAllLabel ?? `${t('common.seeAll')}: ${title}`}
          style={styles.link}
        >
          <AppText variant="bodyStrong" color={colors.primary}>
            {t('common.seeAll')}
          </AppText>
          <Icon name={forwardChevron()} size={22} color={colors.primary} />
        </Touchable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
    gap: spacing.sm,
  },
  title: { flexShrink: 1 },
  link: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xxs },
});
