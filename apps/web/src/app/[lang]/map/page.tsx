import type { Metadata } from 'next';
import { MapScreen } from '@/features/map/MapScreen';
import { getI18n } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t('tabs.map') };
}

export default function MapPage() {
  return <MapScreen />;
}
