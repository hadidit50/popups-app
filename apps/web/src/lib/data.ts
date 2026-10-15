import {
  DEFAULT_COUNTRY,
  demoDiscover,
  demoList,
  type DiscoverFeed,
  type ListFilters,
  type ListSection,
  type PopupSummary,
} from '@whats-poppin/shared';
import { getSupabaseBrowserClient } from './supabase/client';

// Client-side data access. Every list goes through the `popup_list` / `discover_feed` database
// functions; until Supabase is connected the same queries run on the built-in demo data.

export interface Place {
  lat: number;
  lng: number;
}

export async function fetchDiscover(place: Place | null): Promise<DiscoverFeed> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return demoDiscover(place?.lat, place?.lng);
  const { data, error } = await supabase.rpc('discover_feed', {
    p_lat: place?.lat ?? null,
    p_lng: place?.lng ?? null,
    p_country: DEFAULT_COUNTRY.code,
    p_locale: 'he',
  });
  if (error) throw new Error(error.message);
  return data as DiscoverFeed;
}

export interface ListQuery {
  section: ListSection;
  place?: Place | null;
  radiusKm?: number;
  filters?: ListFilters;
  limit?: number;
}

export async function fetchList({ section, place, radiusKm, filters = {}, limit = 50 }: ListQuery): Promise<PopupSummary[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return demoList(section, { lat: place?.lat, lng: place?.lng, radiusKm, filters, limit });
  const { data, error } = await supabase.rpc('popup_list', {
    p_section: section,
    p_lat: place?.lat ?? null,
    p_lng: place?.lng ?? null,
    p_radius_km: radiusKm ?? null,
    p_filters: filters,
    p_limit: limit,
    p_country: DEFAULT_COUNTRY.code,
    p_locale: 'he',
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as PopupSummary[];
}
