import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type DimensionValue } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing } from '../theme';

function Block({ width, height, style }: { width: DimensionValue; height: number; style?: object }) {
  return <View style={[{ width, height, backgroundColor: colors.surfacePressed, borderRadius: radius.sm }, style]} />;
}

/** Card-shaped loading placeholder, so the layout doesn't jump when content arrives. */
export function PopupCardSkeleton({ variant = 'large' }: { variant?: 'large' | 'compact' }) {
  const { t } = useTranslation();
  const opacity = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.6, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.card, variant === 'compact' ? styles.compact : null, { opacity }]}
      accessible
      accessibilityLabel={t('common.loading')}
      accessibilityRole="progressbar"
    >
      <Block width="100%" height={variant === 'compact' ? 204 : 210} style={styles.image} />
      <View style={styles.body}>
        <Block width="40%" height={20} />
        <Block width="85%" height={22} />
        <Block width="60%" height={18} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  compact: { width: 272 },
  image: { borderRadius: 0 },
  body: { padding: spacing.md, gap: spacing.xs },
});
