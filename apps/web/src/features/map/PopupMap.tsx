'use client';

import { useEffect, useRef, useState } from 'react';
import type { GeoJSONSource, Map as MapLibreMap, MapGeoJSONFeature } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CATEGORIES, COUNTRY_CENTER, type PopupSummary } from '@whats-poppin/shared';
import { t } from '@/lib/i18n';
import type { Place } from '@/lib/data';
import styles from './MapScreen.module.css';

// Free OpenStreetMap vector tiles, no API key. If they can't load, markers still show on a plain background.
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const FALLBACK_STYLE = {
  version: 8 as const,
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {},
  layers: [{ id: 'background', type: 'background' as const, paint: { 'background-color': '#eef1f3' } }],
};

interface PopupMapProps {
  popups: PopupSummary[];
  user: Place | null;
  /** Fly here when it changes (e.g. after "near me"). */
  focus: { place: Place; zoom: number; key: number; bottomInset?: number } | null;
  onSelect: (popup: PopupSummary | null) => void;
}

function toGeoJSON(popups: PopupSummary[]) {
  return {
    type: 'FeatureCollection' as const,
    features: popups.map((p) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
      properties: { id: p.id, color: (CATEGORIES[p.category] ?? CATEGORIES.more).color, sponsored: p.is_sponsored ? 1 : 0 },
    })),
  };
}

/** Clustered, category-colored markers. Sponsored places get a bigger marker with a purple ring. */
export function PopupMap({ popups, user, focus, onSelect }: PopupMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupsRef = useRef(popups);
  const onSelectRef = useRef(onSelect);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  popupsRef.current = popups;
  onSelectRef.current = onSelect;

  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | null = null;

    (async () => {
      const maplibre = await import('maplibre-gl');
      if (cancelled || !container.current) return;
      // Copied from the package at build time (scripts/copy-map-worker.mjs); version-busted.
      maplibre.setWorkerUrl(`/vendor/maplibre-gl-worker.mjs?v=${maplibre.getVersion()}`);

      let style: string | typeof FALLBACK_STYLE = STYLE_URL;
      try {
        const res = await fetch(STYLE_URL, { signal: AbortSignal.timeout(6000) });
        if (!res.ok) style = FALLBACK_STYLE;
      } catch {
        style = FALLBACK_STYLE;
      }
      if (cancelled || !container.current) return;

      map = new maplibre.Map({
        container: container.current,
        style,
        center: [COUNTRY_CENTER.lng, COUNTRY_CENTER.lat],
        zoom: 6.4,
        attributionControl: { compact: true },
      });
      mapRef.current = map;
      map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-left');

      map.on('error', () => undefined);
      map.on('load', () => {
        if (!map) return;
        map.addSource('popups', { type: 'geojson', data: toGeoJSON(popupsRef.current), cluster: true, clusterRadius: 44, clusterMaxZoom: 13 });
        map.addSource('user', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'popups',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#c2410c',
            'circle-radius': ['step', ['get', 'point_count'], 20, 10, 26, 30, 32],
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
          },
        });
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'popups',
          filter: ['has', 'point_count'],
          layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['Noto Sans Bold'], 'text-size': 16 },
          paint: { 'text-color': '#ffffff' },
        });
        map.addLayer({
          id: 'sponsored-ring',
          type: 'circle',
          source: 'popups',
          filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'sponsored'], 1]],
          paint: { 'circle-radius': 19, 'circle-color': '#6d28d9', 'circle-opacity': 0.9 },
        });
        map.addLayer({
          id: 'points',
          type: 'circle',
          source: 'popups',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': ['get', 'color'],
            'circle-radius': ['case', ['==', ['get', 'sponsored'], 1], 13, 11],
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
          },
        });
        map.addLayer({
          id: 'user-halo',
          type: 'circle',
          source: 'user',
          paint: { 'circle-color': 'rgba(37, 99, 235, 0.18)', 'circle-radius': 26, 'circle-stroke-width': 1, 'circle-stroke-color': 'rgba(37, 99, 235, 0.4)' },
        });
        map.addLayer({
          id: 'user',
          type: 'circle',
          source: 'user',
          paint: { 'circle-color': '#2563eb', 'circle-radius': 9, 'circle-stroke-width': 4, 'circle-stroke-color': '#ffffff' },
        });

        map.on('click', 'clusters', async (e) => {
          const feature = e.features?.[0] as MapGeoJSONFeature | undefined;
          if (!map || !feature) return;
          const source = map.getSource('popups') as GeoJSONSource;
          const zoom = await source.getClusterExpansionZoom(feature.properties.cluster_id as number);
          map.easeTo({ center: (feature.geometry as GeoJSON.Point).coordinates as [number, number], zoom });
        });
        map.on('click', 'points', (e) => {
          const id = e.features?.[0]?.properties?.id as string | undefined;
          onSelectRef.current(popupsRef.current.find((p) => p.id === id) ?? null);
        });
        map.on('click', (e) => {
          const hits = map?.queryRenderedFeatures(e.point, { layers: ['points', 'clusters'] }) ?? [];
          if (hits.length === 0) onSelectRef.current(null);
        });
        for (const layer of ['clusters', 'points']) {
          map.on('mouseenter', layer, () => map && (map.getCanvas().style.cursor = 'pointer'));
          map.on('mouseleave', layer, () => map && (map.getCanvas().style.cursor = ''));
        }
        setLoaded(true);
      });
    })().catch(() => setFailed(true));

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  // Keep markers in sync with the data.
  useEffect(() => {
    if (!loaded) return;
    (mapRef.current?.getSource('popups') as GeoJSONSource | undefined)?.setData(toGeoJSON(popups));
  }, [popups, loaded]);

  // "You are here" dot.
  useEffect(() => {
    if (!loaded) return;
    (mapRef.current?.getSource('user') as GeoJSONSource | undefined)?.setData({
      type: 'FeatureCollection',
      features: user ? [{ type: 'Feature', geometry: { type: 'Point', coordinates: [user.lng, user.lat] }, properties: {} }] : [],
    });
  }, [user, loaded]);

  useEffect(() => {
    if (!loaded || !focus) return;
    // Keep the target in the part of the map that isn't covered by the list panel.
    mapRef.current?.flyTo({
      center: [focus.place.lng, focus.place.lat],
      zoom: focus.zoom,
      padding: { top: 60, bottom: focus.bottomInset ?? 80, left: 0, right: 0 },
      essential: true,
    });
  }, [focus, loaded]);

  return (
    <div className={styles.mapWrap}>
      <div ref={container} className={styles.map} role="region" aria-label={t('map.mapLabel')} />
      {!loaded && !failed ? <p className={styles.mapStatus}>{t('map.loadingMap')}</p> : null}
      {failed ? <p className={styles.mapStatus}>{t('map.mapError')}</p> : null}
    </div>
  );
}
