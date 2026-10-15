import type { Metadata } from 'next';
import { Page } from '@/components/Page';
import { StateView } from '@/components/StateView';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: t('tabs.map') };

// Stage 1 placeholder. Full-screen map + "Near me" arrives in stage 3.
export default function MapPage() {
  return (
    <Page>
      <h1 className="visually-hidden">{t('tabs.map')}</h1>
      <StateView icon="map-search-outline" title={t('map.placeholderTitle')} body={t('map.placeholderBody')} />
    </Page>
  );
}
