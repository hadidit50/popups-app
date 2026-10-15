import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CATEGORIES, type PopupSummary } from '@whats-poppin/shared';
import { colors, radius, shadow, spacing } from '../theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { IconButton } from './IconButton';
import { PopupImage } from './PopupImage';
import { SponsoredTag } from './SponsoredTag';
import { StatusLine } from './StatusLine';
import { Touchable } from './Touchable';
import { usePopupStatusText } from '../../hooks/usePopupStatusText';
import { useFormatters } from '../../hooks/useFormatters';

export interface PopupCardProps {
  popup: PopupSummary;
  onPress: () => void;
  /** large = full-width feed card, compact = carousel card */
  variant?: 'large' | 'compact';
  saved?: boolean;
  onToggleSave?: () => void;
  /** For previews/tests. */
  now?: Date;
}

/**
 * The pop-up card. Everything needed to decide is visible without tapping:
 * image, name, category, distance (or city), status in words, and the "Sponsored" tag.
 */
export function PopupCard({ popup, onPress, variant = 'large', saved = false, onToggleSave, now }: PopupCardProps) {
  const { t } = useTranslation();
  const { distance } = useFormatters();
  const statusText = usePopupStatusText(
    { startsAt: popup.starts_at, endsAt: popup.ends_at, timezone: popup.timezone, hours: popup.hours },
    now,
  );
  const meta = CATEGORIES[popup.category] ?? CATEGORIES.more;
  const categoryName = t(`categories.${meta.slug}`);
  const place = distance(popup.distance_km) ?? popup.city_name;
  const priceLabel = popup.price_range === 'free' ? t('common.free') : null;

  const a11yLabel = [
    t('a11y.popupCard', { title: popup.title, category: categoryName, place, status: statusText.full }),
    priceLabel,
    popup.is_sponsored ? t('a11y.sponsoredSuffix') : null,
  ]
    .filter(Boolean)
    .join(', ');

  const compact = variant === 'compact';

  return (
    <View style={[styles.card, compact ? styles.compact : styles.large]}>
      <Touchable onPress={onPress} accessibilityLabel={a11yLabel} accessibilityRole="button" style={styles.pressable}>
        <PopupImage uri={popup.cover_image_url} category={popup.category} style={compact ? styles.imageCompact : styles.imageLarge} />

        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={[styles.categoryBadge, { backgroundColor: meta.color }]}>
              <Icon name={meta.icon as IconName} size={16} color={colors.textInverse} />
              <AppText variant="metaStrong" color={colors.textInverse} maxFontSizeMultiplier={1.6} numberOfLines={1}>
                {categoryName}
              </AppText>
            </View>
            {popup.is_sponsored ? <SponsoredTag /> : null}
          </View>

          <AppText variant={compact ? 'bodyStrong' : 'heading'} numberOfLines={2}>
            {popup.title}
          </AppText>

          <StatusLine text={statusText} />

          <View style={styles.metaRow}>
            <Icon name="map-marker-outline" size={18} color={colors.textSecondary} />
            <AppText variant="meta" color={colors.textSecondary} numberOfLines={1} style={styles.flex}>
              {place}
              {priceLabel ? ` · ${priceLabel}` : ''}
            </AppText>
          </View>
        </View>
      </Touchable>

      {onToggleSave ? (
        <View style={styles.saveButton}>
          <IconButton
            appearance="floating"
            icon={saved ? 'heart' : 'heart-outline'}
            color={saved ? colors.error : colors.text}
            selected={saved}
            accessibilityLabel={t(saved ? 'a11y.unsaveButton' : 'a11y.saveButton', { title: popup.title })}
            onPress={onToggleSave}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  large: { alignSelf: 'stretch' },
  compact: { width: 272 },
  pressable: { borderRadius: radius.lg, overflow: 'hidden' },
  imageLarge: { width: '100%', aspectRatio: 16 / 10 },
  imageCompact: { width: '100%', aspectRatio: 4 / 3 },
  body: { padding: spacing.md, gap: spacing.xs },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  flex: { flexShrink: 1 },
  // "end" side = left in RTL, away from where the eye starts reading.
  saveButton: { position: 'absolute', top: spacing.xs, end: spacing.xs },
});
