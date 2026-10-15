// Demo mode: the same queries as the Supabase functions (popup_list, discover_feed, popup_details),
// run in memory over the seed data. Used until Supabase is connected, so the site is never empty.
// Keep the behaviour in sync with supabase/migrations/*_feed_hot_sponsored.sql.

import { DEMO_ACTIVITY, DEMO_CITIES, DEMO_PROMOTIONS, DEMO_SEED } from './demo-data.ts';
import { distanceKm } from './geo.ts';
import { getPopupStatus, type OpeningHoursRow } from './status.ts';
import { DAY, MINUTE, localWeekday, parseTimeOfDay, startOfLocalDay, toLocalMs } from './time.ts';
import type { CategorySlug } from './categories.ts';
import type { PopupDetails, PopupSummary, PriceRange } from './types.ts';

const TZ = 'Asia/Jerusalem';
const IMAGE = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=75&auto=format&fit=crop`;

export type ListSection = 'hot' | 'nearby' | 'weekend' | 'ending_soon' | 'all' | 'map';

export interface ListFilters {
  category?: CategorySlug | null;
  categories?: CategorySlug[];
  query?: string;
  ids?: string[];
  open_now?: boolean;
  today?: boolean;
  this_weekend?: boolean;
  free_only?: boolean;
}

export interface ListOptions {
  lat?: number | null;
  lng?: number | null;
  radiusKm?: number | null;
  filters?: ListFilters;
  limit?: number;
}

export interface DiscoverFeed {
  hot: PopupSummary[];
  nearby: PopupSummary[];
  nearby_radius_km: number | null;
  weekend: PopupSummary[];
  ending_soon: PopupSummary[];
}

const HOT_WEIGHTS = { view: 1, save: 4, navigate: 6, ending_soon_boost: 15, new_boost: 10 };
export const SPONSORED_EVERY_N = 5;

/** A local wall-clock time `days` from today (in `tz`) → real instant. */
export function zonedDayTime(days: number, time: string, tz: string, now: Date): Date {
  const targetLocal = startOfLocalDay(toLocalMs(now, tz)) + days * DAY + parseTimeOfDay(time) * MINUTE;
  let guess = targetLocal;
  for (let i = 0; i < 3; i++) {
    const offset = toLocalMs(new Date(guess), tz) - guess;
    guess = targetLocal - offset;
  }
  return new Date(guess);
}

interface DemoPopup extends PopupDetails {
  status: 'approved' | 'pending';
  score: number;
  promotions: string[];
}

function buildDemoPopups(now: Date): DemoPopup[] {
  return DEMO_SEED.map((s) => {
    const starts = zonedDayTime(s.starts.days, s.starts.time, TZ, now);
    const ends = zonedDayTime(s.ends.days, s.ends.time, TZ, now);
    const act = DEMO_ACTIVITY[s.slug] ?? { views: 0, saves: 0, navigations: 0 };
    const score =
      act.views * HOT_WEIGHTS.view +
      act.saves * HOT_WEIGHTS.save +
      act.navigations * HOT_WEIGHTS.navigate +
      (ends.getTime() - now.getTime() < 2 * DAY ? HOT_WEIGHTS.ending_soon_boost : 0) +
      (starts.getTime() <= now.getTime() && now.getTime() - starts.getTime() < 3 * DAY ? HOT_WEIGHTS.new_boost : 0);
    const images = [s.image, s.image2].filter((x): x is string => !!x).map((id) => ({ url: IMAGE(id), alt: s.title }));
    const city = DEMO_CITIES[s.city_slug as keyof typeof DEMO_CITIES];
    return {
      id: `demo-${s.slug}`,
      slug: s.slug,
      title: s.title,
      short_description: s.short_description,
      description: s.description,
      category: s.category as CategorySlug,
      country_code: 'IL',
      city_slug: s.city_slug,
      city_name: city?.name_he ?? s.city_slug,
      address: s.address,
      lat: s.lat,
      lng: s.lng,
      timezone: TZ,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      price_range: s.price_range as PriceRange,
      cover_image_url: images[0]?.url ?? null,
      hours: s.hours as OpeningHoursRow[],
      images,
      website_url: null,
      instagram_url: s.instagram_url,
      wheelchair_accessible: s.wheelchair_accessible,
      parking_available: s.parking_available,
      kid_friendly: s.kid_friendly,
      accessibility_notes: null,
      organizer_name: null,
      status: s.status as 'approved' | 'pending',
      score,
      promotions: DEMO_PROMOTIONS.filter((p) => p.slug === s.slug).map((p) => p.placement),
    };
  });
}

/** Thursday 00:00 → Sunday 00:00 (local); from Thursday on it starts now. Mirrors SQL weekend_range. */
export function weekendRange(now: Date, tz = TZ): { start: number; end: number } {
  const nowL = toLocalMs(now, tz);
  const today = startOfLocalDay(nowL);
  const dow = localWeekday(today);
  const startL = dow >= 4 ? nowL : today + (4 - dow) * DAY;
  const endL = today + (7 - dow) * DAY;
  const offset = nowL - now.getTime();
  return { start: startL - offset, end: endL - offset };
}

function isOnWeekend(p: PopupSummary, now: Date): boolean {
  const w = weekendRange(now, p.timezone);
  const overlaps = new Date(p.starts_at).getTime() < w.end && new Date(p.ends_at).getTime() > w.start;
  return overlaps && (p.hours.length === 0 || p.hours.some((h) => h.weekday >= 4));
}

function isOpenToday(p: PopupSummary, now: Date): boolean {
  const s = getPopupStatus({ startsAt: p.starts_at, endsAt: p.ends_at, timezone: p.timezone, hours: p.hours }, now);
  return s.isOpenNow || s.primary.key === 'opensToday';
}

function toSummary(p: DemoPopup, distance: number | null, sponsored = false): PopupSummary {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    short_description: p.short_description,
    category: p.category,
    country_code: p.country_code,
    city_slug: p.city_slug,
    city_name: p.city_name,
    address: p.address,
    lat: p.lat,
    lng: p.lng,
    timezone: p.timezone,
    starts_at: p.starts_at,
    ends_at: p.ends_at,
    price_range: p.price_range,
    cover_image_url: p.cover_image_url,
    hours: p.hours,
    distance_km: distance === null ? null : Math.round(distance * 100) / 100,
    is_sponsored: sponsored,
    promotion_id: sponsored ? `demo-promo-${p.slug}` : null,
  };
}

/** Same rule as SQL interleave_sponsored: sponsored first, then at most one per N items. */
export function interleaveSponsored<T extends { id: string }>(organic: T[], sponsored: T[], everyN: number, limit: number): T[] {
  const sponsoredIds = new Set(sponsored.map((s) => s.id));
  const out: T[] = [];
  let si = 0;
  for (const item of organic) {
    if (sponsoredIds.has(item.id)) continue;
    if (out.length % Math.max(everyN, 2) === 0 && si < sponsored.length) out.push(sponsored[si++]);
    out.push(item);
  }
  if (out.length === 0 && sponsored.length > 0) out.push(sponsored[0]);
  return out.slice(0, limit);
}

export function demoList(section: ListSection, opts: ListOptions = {}, now = new Date()): PopupSummary[] {
  const { lat, lng, filters = {}, limit = 20 } = opts;
  const origin = lat != null && lng != null ? { lat, lng } : null;
  const radiusKm = Math.min(Math.max(opts.radiusKm ?? 10, 0.1), 500);
  if (section === 'nearby' && !origin) return [];
  const placement = section === 'hot' ? 'hot_now' : section === 'nearby' ? 'nearby_top' : section === 'map' ? 'map_highlight' : null;
  const q = filters.query?.trim().toLowerCase();

  const rows = buildDemoPopups(now)
    .filter((p) => p.status === 'approved' && new Date(p.ends_at) > now)
    .map((p) => ({ p, dist: origin ? distanceKm(origin, p) : null }))
    .filter(({ p, dist }) => {
      if (filters.ids && !filters.ids.includes(p.id)) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (q || filters.categories) {
        const byCat = !!filters.categories?.includes(p.category);
        const byText =
          !!q &&
          [p.title, p.short_description, p.address, p.city_name, DEMO_CITIES[p.city_slug as keyof typeof DEMO_CITIES]?.name_en]
            .some((v) => v?.toLowerCase().includes(q));
        if (!byCat && !byText) return false;
      }
      if (filters.free_only && p.price_range !== 'free') return false;
      if (filters.open_now && !getPopupStatus({ startsAt: p.starts_at, endsAt: p.ends_at, timezone: p.timezone, hours: p.hours }, now).isOpenNow) return false;
      if (filters.today && !isOpenToday(p, now)) return false;
      if ((filters.this_weekend || section === 'weekend') && !isOnWeekend(p, now)) return false;
      if ((section === 'nearby' || section === 'map') && dist !== null && dist > radiusKm) return false;
      if (section === 'ending_soon' && !(new Date(p.ends_at).getTime() - now.getTime() <= 3 * DAY && new Date(p.starts_at) <= now)) return false;
      return true;
    });

  const byDist = (a: number | null, b: number | null) => (a ?? Infinity) - (b ?? Infinity);
  rows.sort((a, b) => {
    if (section === 'hot' && a.p.score !== b.p.score) return b.p.score - a.p.score;
    if (section === 'ending_soon') {
      const d = new Date(a.p.ends_at).getTime() - new Date(b.p.ends_at).getTime();
      if (d) return d;
    }
    const d = byDist(a.dist, b.dist);
    if (d) return d;
    if (section === 'weekend') {
      const s = new Date(a.p.starts_at).getTime() - new Date(b.p.starts_at).getTime();
      if (s) return s;
    }
    return b.p.score - a.p.score;
  });

  if (section === 'map') {
    return rows.slice(0, limit).map(({ p, dist }) => toSummary(p, dist, !!placement && p.promotions.includes(placement)));
  }
  const organic = rows.map(({ p, dist }) => toSummary(p, dist));
  if (placement) {
    const sponsored = rows
      .filter(({ p }) => p.promotions.includes(placement))
      .slice(0, Math.max(1, Math.ceil(limit / SPONSORED_EVERY_N)))
      .map(({ p, dist }) => toSummary(p, dist, true));
    return interleaveSponsored(organic, sponsored, SPONSORED_EVERY_N, limit);
  }
  return organic.slice(0, limit);
}

export function demoDiscover(lat?: number | null, lng?: number | null, now = new Date()): DiscoverFeed {
  let nearby: PopupSummary[] = [];
  let radius: number | null = null;
  if (lat != null && lng != null) {
    for (const r of [10, 25, 50]) {
      nearby = demoList('nearby', { lat, lng, radiusKm: r, limit: 10 }, now);
      if (nearby.length) {
        radius = r;
        break;
      }
    }
  }
  return {
    hot: demoList('hot', { lat, lng, limit: 10 }, now),
    nearby,
    nearby_radius_km: radius,
    weekend: demoList('weekend', { lat, lng, limit: 12 }, now),
    ending_soon: demoList('ending_soon', { lat, lng, limit: 12 }, now),
  };
}

export function demoDetails(slug: string, now = new Date()): PopupDetails | null {
  const p = buildDemoPopups(now).find((x) => x.slug === slug && x.status === 'approved');
  if (!p) return null;
  const { score: _score, promotions: _promotions, status: _status, ...details } = p;
  return details;
}
