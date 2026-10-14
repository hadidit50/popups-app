import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CATEGORIES, type CategorySlug } from '@whats-poppin/shared';
import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { Touchable } from './Touchable';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: IconName;
  /** Accent used for the icon (and the fill when selected). */
  accent?: string;
}

/** Toggleable pill used for filters ("פתוח עכשיו", "חינם", radius...). */
export function FilterChip({ label, selected = false, onPress, icon, accent = colors.primary }: ChipProps) {
  return (
    <Touchable
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="togglebutton"
      accessibilityState={{ selected, checked: selected }}
      style={[
        styles.chip,
        selected ? { backgroundColor: accent, borderColor: accent } : { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.row}>
        {icon ? <Icon name={icon} size={20} color={selected ? colors.textInverse : accent} /> : null}
        <AppText variant="metaStrong" color={selected ? colors.textInverse : colors.text} maxFontSizeMultiplier={1.6}>
          {label}
        </AppText>
        {selected ? <Icon name="check" size={18} color={colors.textInverse} /> : null}
      </View>
    </Touchable>
  );
}

/** Category chip: icon + name, in the category's color. `slug = null` means "All". */
export function CategoryChip({
  slug,
  selected,
  onPress,
}: {
  slug: CategorySlug | null;
  selected?: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const meta = slug ? CATEGORIES[slug] : null;
  return (
    <FilterChip
      label={t(`categories.${slug ?? 'all'}`)}
      icon={(meta?.icon ?? 'view-grid-outline') as IconName}
      accent={meta?.color ?? colors.text}
      selected={selected}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
