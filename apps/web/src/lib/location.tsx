'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LAUNCH_CITIES } from '@whats-poppin/shared';
import { useI18n } from './i18n-client';
import type { Place } from './data';

/**
 * Where the visitor is, for "near me" sorting. Either their GPS position (only after they tap
 * "use my location"), a city they picked, or nothing. Remembered in this browser only.
 */
export type LocationState =
  | { kind: 'unset' }
  | { kind: 'locating' }
  | { kind: 'gps'; place: Place }
  | { kind: 'city'; place: Place; citySlug: string }
  | { kind: 'everywhere' }
  | { kind: 'denied' };

interface LocationContextValue {
  state: LocationState;
  /** Coordinates to sort by, or null. */
  place: Place | null;
  /** "המיקום שלי" / "תל אביב-יפו" / null */
  label: string | null;
  ready: boolean;
  requestGps: () => void;
  chooseCity: (slug: string) => void;
  chooseEverywhere: () => void;
}

const KEY = 'wp.location';
const LocationContext = createContext<LocationContextValue | null>(null);

function load(): LocationState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { kind: 'unset' };
    const saved = JSON.parse(raw) as LocationState;
    if (saved.kind === 'gps' || saved.kind === 'city' || saved.kind === 'everywhere') return saved;
  } catch {}
  return { kind: 'unset' };
}

function save(state: LocationState) {
  try {
    if (state.kind === 'gps' || state.kind === 'city' || state.kind === 'everywhere') {
      localStorage.setItem(KEY, JSON.stringify(state));
    }
  } catch {}
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocationState>({ kind: 'unset' });
  const [ready, setReady] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  const update = useCallback((next: LocationState) => {
    setState(next);
    save(next);
  }, []);

  const requestGps = useCallback(() => {
    if (!('geolocation' in navigator)) {
      update({ kind: 'denied' });
      return;
    }
    setState({ kind: 'locating' });
    navigator.geolocation.getCurrentPosition(
      (pos) => update({ kind: 'gps', place: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
      () => update({ kind: 'denied' }),
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 5 * 60_000 },
    );
  }, [update]);

  const chooseCity = useCallback(
    (slug: string) => {
      const city = LAUNCH_CITIES.find((c) => c.slug === slug);
      if (city) update({ kind: 'city', citySlug: slug, place: { lat: city.lat, lng: city.lng } });
    },
    [update],
  );

  const chooseEverywhere = useCallback(() => update({ kind: 'everywhere' }), [update]);

  const value = useMemo<LocationContextValue>(() => {
    const place = state.kind === 'gps' || state.kind === 'city' ? state.place : null;
    const label =
      state.kind === 'gps' ? t('location.myLocation') : state.kind === 'city' ? t(`cities.${state.citySlug}`) : state.kind === 'everywhere' ? t('cities.all') : null;
    return { state, place, label, ready, requestGps, chooseCity, chooseEverywhere };
  }, [state, ready, requestGps, chooseCity, chooseEverywhere, t]);

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used inside <LocationProvider>');
  return ctx;
}
