import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { CATEGORIES, type CategorySlug } from '@whats-poppin/shared';
import { Icon, type IconName } from './Icon';

interface PopupImageProps {
  uri: string | null | undefined;
  category: CategorySlug;
  style?: StyleProp<ViewStyle>;
}

/**
 * Pop-up photo with a graceful fallback: if there's no image or it fails to load,
 * show the category color with its icon instead of a broken/blank box.
 * Decorative for screen readers (the card label already describes the pop-up).
 */
export function PopupImage({ uri, category, style }: PopupImageProps) {
  const [failed, setFailed] = useState(false);
  const meta = CATEGORIES[category] ?? CATEGORIES.more;
  const showFallback = !uri || failed;

  return (
    <View style={[styles.box, { backgroundColor: meta.color }, style]} accessible={false} importantForAccessibility="no-hide-descendants">
      {showFallback ? (
        <View style={styles.fallback}>
          <Icon name={meta.icon as IconName} size={56} color="rgba(255,255,255,0.9)" />
        </View>
      ) : (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden' },
  fallback: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
