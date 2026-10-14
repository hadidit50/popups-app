import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Icon, colors, fonts, type IconName } from '@/ui';

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  index: { active: 'compass', inactive: 'compass-outline' },
  map: { active: 'map', inactive: 'map-outline' },
  saved: { active: 'heart', inactive: 'heart-outline' },
  profile: { active: 'account-circle', inactive: 'account-circle-outline' },
};

/** Exactly 4 tabs. Large icons + always-visible labels, high-contrast active state. */
export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 13 },
        tabBarAllowFontScaling: true,
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 6),
          borderTopColor: colors.border,
          backgroundColor: colors.background,
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name] ?? TAB_ICONS.index;
          return <Icon name={focused ? icons.active : icons.inactive} size={28} color={color as string} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.discover') }} />
      <Tabs.Screen name="map" options={{ title: t('tabs.map') }} />
      <Tabs.Screen name="saved" options={{ title: t('tabs.saved') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
    </Tabs>
  );
}
