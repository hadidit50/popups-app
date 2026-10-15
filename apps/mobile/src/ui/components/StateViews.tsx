import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

interface StateViewProps {
  icon: IconName;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'neutral' | 'error';
}

/** Empty / error / placeholder state. Always says what happened and what to do next. */
export function StateView({ icon, title, body, actionLabel, onAction, tone = 'neutral' }: StateViewProps) {
  const accent = tone === 'error' ? colors.error : colors.primary;
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <View style={[styles.iconCircle, { backgroundColor: tone === 'error' ? colors.errorSoft : colors.primarySoft }]}>
        <Icon name={icon} size={44} color={accent} />
      </View>
      <AppText variant="title" center accessibilityRole="header">
        {title}
      </AppText>
      {body ? (
        <AppText variant="body" color={colors.textSecondary} center>
          {body}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

export function EmptyState(props: Omit<StateViewProps, 'tone'>) {
  return <StateView {...props} />;
}

/** Generic error with a retry button. Pass `offline` for the no-internet wording. */
export function ErrorState({ onRetry, offline }: { onRetry: () => void; offline?: boolean }) {
  const { t } = useTranslation();
  return (
    <StateView
      tone="error"
      icon={offline ? 'wifi-off' : 'alert-circle-outline'}
      title={t(offline ? 'errors.offlineTitle' : 'errors.genericTitle')}
      body={t(offline ? 'errors.offlineBody' : 'errors.genericBody')}
      actionLabel={t('common.retry')}
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  action: { marginTop: spacing.sm, alignSelf: 'stretch' },
});
