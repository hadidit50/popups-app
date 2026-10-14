import { StyleSheet, View } from 'react-native';
import type { StatusTone } from '@whats-poppin/shared';
import { colors, spacing } from '../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';
import type { PopupStatusText } from '../../hooks/usePopupStatusText';

const toneColor: Record<StatusTone, string> = {
  open: colors.statusOpen,
  soon: colors.statusSoon,
  neutral: colors.statusNeutral,
};

/** "● פתוח עכשיו · עד 22:00   ⏳ יום אחרון!" — always words, color only reinforces. */
export function StatusLine({ text }: { text: PopupStatusText }) {
  const tone = text.status.primary.tone;
  return (
    <View style={styles.row} accessible={false}>
      <View style={styles.item}>
        <View style={[styles.dot, { backgroundColor: toneColor[tone] }]} />
        <AppText variant="metaStrong" color={toneColor[tone]}>
          {text.primary}
        </AppText>
      </View>
      {text.ending ? (
        <View style={styles.item}>
          <Icon name="timer-sand" size={16} color={colors.statusSoon} />
          <AppText variant="metaStrong" color={colors.statusSoon}>
            {text.ending}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.sm, rowGap: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
