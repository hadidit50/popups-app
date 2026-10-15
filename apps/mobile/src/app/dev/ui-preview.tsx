import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CATEGORY_SLUGS, type CategorySlug } from '@whats-poppin/shared';
import {
  AppText,
  Button,
  CategoryChip,
  EmptyState,
  ErrorState,
  FilterChip,
  PopupCard,
  PopupCardSkeleton,
  SectionHeader,
  SponsoredTag,
  colors,
  radius,
  spacing,
  typography,
  type TextVariant,
} from '@/ui';
import { samplePopups } from '@whats-poppin/shared';

const SWATCHES: (keyof typeof colors)[] = [
  'primary', 'text', 'textSecondary', 'surface', 'statusOpen', 'statusSoon', 'statusNeutral', 'sponsored', 'error',
];

/** Living style guide: every design-system piece on one screen, in Hebrew RTL. Dev-only entry point. */
export default function UiPreviewScreen() {
  const { t } = useTranslation();
  const popups = useMemo(() => samplePopups(), []);
  const [category, setCategory] = useState<CategorySlug | null>(null);
  const [openNow, setOpenNow] = useState(true);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const toggleSave = (id: string) => setSaved((s) => ({ ...s, [id]: !s[id] }));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Section title={t('preview.colors')}>
        <View style={styles.swatches}>
          {SWATCHES.map((key) => (
            <View key={key} style={styles.swatch}>
              <View style={[styles.swatchColor, { backgroundColor: colors[key] }]} />
              <AppText variant="meta" color={colors.textSecondary}>
                {key}
              </AppText>
            </View>
          ))}
        </View>
      </Section>

      <Section title={t('preview.typography')}>
        {(Object.keys(typography) as TextVariant[]).map((v) => (
          <AppText key={v} variant={v}>
            {v} · {v === 'display' ? t('preview.sampleDisplay') : v === 'title' ? t('preview.sampleTitle') : t('preview.sampleBody')}
          </AppText>
        ))}
      </Section>

      <Section title={t('preview.buttons')}>
        <Button label={t('preview.primaryButton')} icon="navigation-variant" onPress={() => {}} fullWidth />
        <Button label={t('preview.secondaryButton')} icon="share-variant" variant="secondary" onPress={() => {}} fullWidth />
        <Button label={t('preview.ghostButton')} variant="ghost" onPress={() => {}} />
        <Button label={t('common.loading')} loading onPress={() => {}} fullWidth />
      </Section>

      <Section title={t('preview.chips')}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <CategoryChip slug={null} selected={category === null} onPress={() => setCategory(null)} />
          {CATEGORY_SLUGS.map((slug) => (
            <CategoryChip key={slug} slug={slug} selected={category === slug} onPress={() => setCategory(slug)} />
          ))}
        </ScrollView>
        <View style={styles.chipsWrap}>
          <FilterChip label="פתוח עכשיו" icon="clock-outline" selected={openNow} onPress={() => setOpenNow((v) => !v)} />
          <FilterChip label="חינם" icon="ticket-outline" onPress={() => {}} />
          <SponsoredTag />
        </View>
      </Section>

      <Section title={t('preview.cards')} padded={false}>
        <SectionHeader title={t('preview.sampleHeading')} onSeeAll={() => {}} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
          {popups.map((p) => (
            <PopupCard
              key={p.id}
              popup={p}
              variant="compact"
              onPress={() => {}}
              saved={!!saved[p.id]}
              onToggleSave={() => toggleSave(p.id)}
            />
          ))}
          <PopupCardSkeleton variant="compact" />
        </ScrollView>
        <View style={styles.feed}>
          {popups.slice(0, 2).map((p) => (
            <PopupCard key={p.id} popup={p} onPress={() => {}} saved={!!saved[p.id]} onToggleSave={() => toggleSave(p.id)} />
          ))}
          <PopupCardSkeleton />
        </View>
      </Section>

      <Section title={t('preview.states')}>
        <View style={styles.stateBox}>
          <EmptyState icon="heart-outline" title={t('saved.emptyTitle')} body={t('saved.emptyBody')} actionLabel={t('saved.emptyAction')} onAction={() => {}} />
        </View>
        <View style={styles.stateBox}>
          <ErrorState offline onRetry={() => {}} />
        </View>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children, padded = true }: { title: string; children: React.ReactNode; padded?: boolean }) {
  return (
    <View style={styles.section}>
      <AppText variant="title" accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </AppText>
      <View style={[styles.sectionBody, padded && styles.padded]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: spacing.lg, gap: spacing.xl },
  section: { gap: spacing.sm },
  sectionTitle: { paddingHorizontal: spacing.screen },
  sectionBody: { gap: spacing.sm },
  padded: { paddingHorizontal: spacing.screen },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: { alignItems: 'center', gap: 4, width: 96 },
  swatchColor: { width: 56, height: 56, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  chips: { gap: spacing.xs, paddingVertical: spacing.xxs },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, alignItems: 'center' },
  carousel: { gap: spacing.sm, paddingHorizontal: spacing.screen, paddingVertical: spacing.xs },
  feed: { gap: spacing.md, paddingHorizontal: spacing.screen },
  stateBox: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg },
});
