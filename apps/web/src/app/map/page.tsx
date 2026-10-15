import type { Metadata } from 'next';
import { MapScreen } from '@/features/map/MapScreen';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: t('tabs.map') };

export default function MapPage() {
  return <MapScreen />;
}
