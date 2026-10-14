import { StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AppText, Icon, colors, spacing } from '@/ui';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

/** Dev-only: confirms the app can reach Supabase and read the seeded pop-ups. */
export function ConnectionCheck() {
  const { t } = useTranslation();
  const query = useQuery({
    queryKey: ['dev', 'connection'],
    enabled: isSupabaseConfigured,
    queryFn: async () => {
      const { count, error } = await supabase.from('popups').select('id', { count: 'exact', head: true });
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
  });

  let icon: 'check-circle' | 'alert-circle' | 'progress-clock' = 'progress-clock';
  let color: string = colors.textSecondary;
  let text = t('health.checking');
  if (!isSupabaseConfigured) {
    icon = 'alert-circle';
    color = colors.statusSoon;
    text = t('health.notConfigured');
  } else if (query.isSuccess) {
    icon = 'check-circle';
    color = colors.statusOpen;
    text = t('health.ok', { count: query.data });
  } else if (query.isError) {
    icon = 'alert-circle';
    color = colors.error;
    text = t('health.failed', { message: query.error.message });
  }

  return (
    <View style={styles.row} accessible accessibilityLabel={`${t('profile.connection')}: ${text}`}>
      <Icon name={icon} size={24} color={color} />
      <AppText variant="body" color={color} style={styles.text}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  text: { flexShrink: 1 },
});
