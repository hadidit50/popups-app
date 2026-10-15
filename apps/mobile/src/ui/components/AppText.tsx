import { StyleSheet, Text, type TextProps } from 'react-native';
import { colors, typography, type TextVariant } from '../theme';

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  center?: boolean;
}

/**
 * All text in the app goes through here: Rubik font, the type scale, RTL alignment,
 * and system font scaling (never disabled; capped only where layout would break).
 */
export function AppText({ variant = 'body', color = colors.text, center, style, ...rest }: AppTextProps) {
  return (
    <Text
      allowFontScaling
      {...rest}
      style={[typography[variant], styles.base, { color }, center && styles.center, style]}
    />
  );
}

const styles = StyleSheet.create({
  // "left" is flipped to the right automatically in RTL.
  base: { textAlign: 'left', writingDirection: 'auto' },
  center: { textAlign: 'center' },
});
