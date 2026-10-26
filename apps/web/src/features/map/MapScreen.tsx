'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ListFilters, PopupSummary } from '@whats-poppin/shared';
import { CardList } from '@/components/CardList';
import { QuickFilters } from '@/components/Discovery';
import { Icon } from '@/components/Icon';
import { LocationPrompt } from '@/components/LocationControls';
import { PopupCard } from '@/components/PopupCard';
import { StateView } from '@/components/StateView';
import { fetchList, type Place } from '@/lib/data';
import { useI18n } from '@/lib/i18n-client';
import { useLocation } from '@/lib/location';
import { PopupMap } from './PopupMap';
import { AdvertiserDisclaimer } from '@/features/legal/AdvertiserNotes';
import styles from './MapScreen.module.css';

const RADII = [1, 5, 10, 25] as const;
const ZOOM_FOR_RADIUS: Record<number, number> = { 1: 14.5, 5: 12.5, 10: 11.5, 25: 10 };

/**
 * Full-screen map + "Near me". The list panel shows the same pop-ups sorted by distance, so
 * everything on the map is also reachable without the map (screen readers, small screens).
 */
export function MapScreen() {
  const { t, dir } = useI18n();
  const { place, state, ready, requestGps } = useLocation();
  const [filters, setFilters] = useState<ListFilters>({});
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selected, setSelected] = useState<PopupSummary | null>(null);
  const [focus, setFocus] = useState<{ place: Place; zoom: number; key: number; bottomInset?: number } | null>(null);
  const wantsNearMe = useRef(false);

  const all = useQuery({
    queryKey: ['map', filters],
    queryFn: () => fetchList({ section: 'map', filters, limit: 300 }),
  });
  const nearby = useQuery({
    queryKey: ['map-nearby', place?.lat, place?.lng, radiusKm, filters],
    queryFn: () => fetchList({ section: 'nearby', place, radiusKm, filters, limit: 60 }),
    enabled: ready && !!place,
  });

  const screenRef = useRef<HTMLDivElement>(null);
  const goTo = (p: Place, km = radiusKm, panel = panelOpen) => {
    const height = screenRef.current?.clientHeight ?? 700;
    const wide = typeof window !== 'undefined' && window.innerWidth >= 900;
    setFocus({ place: p, zoom: (ZOOM_FOR_RADIUS[km] ?? 12) - (panel && !wide ? 1 : 0), key: Date.now(), bottomInset: panel && !wide ? Math.round(height * 0.6) : 80 });
  };

  // Center on the visitor once their location arrives after tapping "near me".
  useEffect(() => {
    if (place && wantsNearMe.current) {
      wantsNearMe.current = false;
      goTo(place, radiusKm, true);
      setPanelOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place]);

  // First visit with a known location: start there.
  useEffect(() => {
    if (ready && place) goTo(place);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const onNearMe = () => {
    setSelected(null);
    if (state.kind === 'gps' && place) {
      goTo(place, radiusKm, true);
      setPanelOpen(true);
      return;
    }
    wantsNearMe.current = true;
    requestGps();
    setPanelOpen(true);
  };

  const count = nearby.data?.length ?? 0;
  const summary = place
    ? nearby.data
      ? count === 1
        ? t('map.countInAreaOne', { km: radiusKm })
        : t('map.countInArea', { count, km: radiusKm })
      : t('common.loading')
    : t('map.noLocationTitle');

  return (
    <div className={styles.screen} ref={screenRef}>
      <h1 className="visually-hidden">{t('map.title')}</h1>
      <PopupMap popups={all.data ?? []} user={state.kind === 'gps' ? place : null} focus={focus} onSelect={setSelected} />

      <div className={styles.topBar}>
        <QuickFilters value={filters} onChange={setFilters} />
      </div>

      {selected ? (
        <div className={styles.preview}>
          <button type="button" className={styles.previewClose} onClick={() => setSelected(null)} aria-label={t('map.closePreview')}>
            <Icon name="close" size={22} />
          </button>
          <PopupCard popup={selected} variant="row" surface="map" />
        </div>
      ) : !panelOpen ? (
        <button type="button" className={styles.nearMe} onClick={onNearMe} aria-label={t('map.nearMeLabel')}>
          <Icon name="crosshairs-gps" size={24} />
          {t('map.nearMe')}
        </button>
      ) : null}

      <section className={styles.panel} aria-label={summary}>
        <button type="button" className={styles.handle} aria-expanded={panelOpen} onClick={() => setPanelOpen((v) => !v)}>
          <span>{summary}</span>
          <span className={styles.handleHint}>
            {panelOpen ? t('map.listToggleHide') : t('map.listToggleShow')}
            <Icon name={panelOpen ? (dir === 'rtl' ? 'chevron-right' : 'chevron-left') : 'format-list-bulleted'} size={20} />
          </span>
        </button>
        {panelOpen ? (
          <div className={styles.panelBody}>
            {place ? (
              <>
                <div className={styles.radius} role="group" aria-label={t('map.radius')}>
                  {RADII.map((km) => (
                    <button
                      key={km}
                      type="button"
                      className={styles.radiusBtn}
                      aria-pressed={radiusKm === km}
                      onClick={() => {
                        setRadiusKm(km);
                        goTo(place, km);
                      }}
                    >
                      {t('map.radiusOption', { km })}
                    </button>
                  ))}
                </div>
                <AdvertiserDisclaimer />
                <CardList
                  items={nearby.data}
                  loading={nearby.isPending}
                  error={nearby.error}
                  onRetry={() => void nearby.refetch()}
                  layout="rows"
                  surface="map_list"
                  skeletons={3}
                  empty={<StateView icon="map-search-outline" title={t('map.emptyTitle')} body={t('map.emptyBody')} />}
                />
              </>
            ) : (
              <LocationPrompt />
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
