import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { Touchable } from './Touchable';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'large' | 'medium';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Defaults to the visible label. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
  secondary: { bg: colors.background, fg: colors.primary, border: colors.primary },
  ghost: { bg: 'transparent', fg: colors.text, border: 'transparent' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'large',
  icon,
  loading,
  disabled,
  fullWidth,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const p = palette[variant];
  return (
    <Touchable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        size === 'large' ? styles.large : styles.medium,
        { backgroundColor: pressed && variant === 'primary' ? colors.primaryPressed : p.bg, borderColor: p.border },
        pressed && variant !== 'primary' && { backgroundColor: colors.surfacePressed },
        fullWidth && styles.fullWidth,
      ]}
      dimOnPress={false}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={22} color={p.fg} /> : null}
          <AppText variant="button" color={p.fg} numberOfLines={2} center>
            {label}
          </AppText>
        </View>
      )}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  large: { minHeight: 56, paddingVertical: spacing.sm },
  medium: { minHeight: 48, paddingVertical: spacing.xs },
  fullWidth: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
