import { StyleSheet } from 'react-native';
import { colors, radius, shadow } from '../theme';
import { Icon, type IconName } from './Icon';
import { Touchable } from './Touchable';

interface IconButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  color?: string;
  /** "floating" = white circle with shadow, used on top of images and the map. */
  appearance?: 'plain' | 'floating';
  size?: number;
  selected?: boolean;
}

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  color = colors.text,
  appearance = 'plain',
  size = 26,
  selected,
}: IconButtonProps) {
  return (
    <Touchable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={selected === undefined ? undefined : { selected }}
      style={[styles.base, appearance === 'floating' && styles.floating]}
    >
      <Icon name={icon} size={size} color={color} />
    </Touchable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  floating: { backgroundColor: colors.background, ...shadow.card },
});
