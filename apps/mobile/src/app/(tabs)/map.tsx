import { useTranslation } from 'react-i18next';
import { EmptyState, Screen } from '@/ui';

// Stage 1 placeholder. Full-screen map + "Near me" arrives in stage 3.
export default function MapScreen() {
  const { t } = useTranslation();
  return (
    <Screen scroll>
      <EmptyState icon="map-search-outline" title={t('map.placeholderTitle')} body={t('map.placeholderBody')} />
    </Screen>
  );
}
