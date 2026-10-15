import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { TOUCH_MIN } from '../theme';

export interface TouchableProps extends Omit<PressableProps, 'style' | 'accessibilityLabel'> {
  /** Required: what a screen reader announces. */
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  /** Opacity feedback when pressed (default on). */
  dimOnPress?: boolean;
}

/**
 * Base for every tappable thing. Guarantees a 48×48 minimum touch area and an accessibility label,
 * so no screen can forget either.
 */
export function Touchable({ style, dimOnPress = true, accessibilityRole = 'button', ...rest }: TouchableProps) {
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      hitSlop={4}
      {...rest}
      style={(state) => [
        styles.min,
        typeof style === 'function' ? style(state) : style,
        dimOnPress && state.pressed && styles.pressed,
        rest.disabled && styles.disabled,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  min: { minHeight: TOUCH_MIN, minWidth: TOUCH_MIN },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.45 },
});
