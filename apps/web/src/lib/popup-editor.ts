'use client';

import {
  DAY,
  DEFAULT_COUNTRY,
  instantToLocalDate,
  localDateTimeToInstant,
  type CategorySlug,
  type PriceRange,
  type PopupStatusDb,
} from '@whats-poppin/shared';
import { getSupabaseBrowserClient } from './supabase/client';

// Load / save a pop-up from the business area and the admin panel. RLS decides who may write what:
// organizers can only touch their own pop-ups and always land in "pending"; admins can do anything.

export type TriState = 'yes' | 'no' | 'unknown';

export interface HoursGroup {
  days: number[];
  opens: string;
  closes: string;
}

export interface PopupImageValue {
  url: string;
  storage_path: string | null;
}

export interface PopupFormValues {
  id?: string;
  slug?: string;
  title: string;
  short_description: string;
  description: string;
  category: CategorySlug | '';
  city_slug: string;
  address: string;
  lat: number | null;
  lng: number | null;
  geocoded_label: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  hours: HoursGroup[];
  price_range: PriceRange;
  wheelchair: TriState;
  parking: TriState;
  kids: TriState;
  accessibility_notes: string;
  instagram_url: string;
  website_url: string;
  images: PopupImageValue[];
  status: PopupStatusDb;
  rejection_reason: string;
}

export interface City {
  id: number;
  slug: string;
  name_he: string;
  timezone: string | null;
  country_code: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export function emptyPopupForm(): PopupFormValues {
  return {
    title: '',
    short_description: '',
    description: '',
    category: '',
    city_slug: '',
    address: '',
    lat: null,
    lng: null,
    geocoded_label: '',
    start_date: today(),
    end_date: new Date(Date.now() + 7 * DAY).toISOString().slice(0, 10),
    all_day: false,
    hours: [{ days: [0, 1, 2, 3, 4, 5, 6], opens: '10:00', closes: '22:00' }],
    price_range: 'free',
    wheelchair: 'unknown',
    parking: 'unknown',
    kids: 'unknown',
    accessibility_notes: '',
    instagram_url: '',
    website_url: '',
    images: [],
    status: 'pending',
    rejection_reason: '',
  };
}

export type FormErrors = Partial<Record<keyof PopupFormValues, string>>;

export function validatePopupForm(v: PopupFormValues, t: (k: string) => string): FormErrors {
  const e: FormErrors = {};
  if (v.title.trim().length < 2) e.title = t('form.required');
  if (!v.category) e.category = t('form.required');
  if (!v.city_slug) e.city_slug = t('form.required');
  if (!v.address.trim()) e.address = t('form.required');
  else if (v.lat === null || v.lng === null) e.address = t('form.mustFind');
  if (!v.start_date) e.start_date = t('form.required');
  if (!v.end_date) e.end_date = t('form.required');
  else if (v.start_date && v.end_date < v.start_date) e.end_date = t('form.datesInvalid');
  return e;
}

const triToBool = (v: TriState) => (v === 'unknown' ? null : v === 'yes');
const boolToTri = (v: boolean | null): TriState => (v === null ? 'unknown' : v ? 'yes' : 'no');

function slugify(title: string) {
  const latin = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${latin || 'popup'}-${suffix}`;
}

export async function loadCities(): Promise<City[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from('cities').select('id, slug, name_he, timezone, country_code').order('sort_order');
  if (error) throw new Error(error.message);
  return (data ?? []) as City[];
}

/** Loads an existing pop-up into form values (organizer: own pop-ups only; admin: any). */
export async function loadPopupForm(id: string): Promise<PopupFormValues | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const [{ data: p, error }, { data: card }] = await Promise.all([
    supabase.from('popups').select('*, popup_hours(*), popup_images(*)').eq('id', id).maybeSingle(),
    supabase.from('popup_cards').select('lat, lng, city_slug').eq('id', id).maybeSingle(),
  ]);
  if (error) throw new Error(error.message);
  if (!p) return null;

  const groups = new Map<string, HoursGroup>();
  for (const h of (p.popup_hours ?? []) as { weekday: number; opens: string; closes: string }[]) {
    const opens = h.opens.slice(0, 5);
    const closes = h.closes.slice(0, 5);
    const key = `${opens}-${closes}`;
    const g = groups.get(key) ?? { days: [], opens, closes };
    g.days.push(h.weekday);
    groups.set(key, g);
  }
  const hours = [...groups.values()].map((g) => ({ ...g, days: g.days.sort() }));
  const images = ((p.popup_images ?? []) as { url: string; storage_path: string | null; sort_order: number }[])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(({ url, storage_path }) => ({ url, storage_path }));

  return {
    id: p.id,
    slug: p.slug,
    title: p.title ?? '',
    short_description: p.short_description ?? '',
    description: p.description ?? '',
    category: p.category,
    city_slug: card?.city_slug ?? '',
    address: p.address ?? '',
    lat: card?.lat ?? null,
    lng: card?.lng ?? null,
    geocoded_label: p.address ?? '',
    start_date: instantToLocalDate(p.starts_at, p.timezone),
    // ends_at is the start of the day after the last day
    end_date: instantToLocalDate(new Date(new Date(p.ends_at).getTime() - 1), p.timezone),
    all_day: hours.length === 0,
    hours: hours.length ? hours : emptyPopupForm().hours,
    price_range: p.price_range,
    wheelchair: boolToTri(p.wheelchair_accessible),
    parking: boolToTri(p.parking_available),
    kids: boolToTri(p.kid_friendly),
    accessibility_notes: p.accessibility_notes ?? '',
    instagram_url: p.instagram_url ?? '',
    website_url: p.website_url ?? '',
    images,
    status: p.status,
    rejection_reason: p.rejection_reason ?? '',
  };
}

/** Insert or update. Returns the pop-up's slug. */
export async function savePopupForm(
  v: PopupFormValues,
  opts: { cities: City[]; organizerId?: string | null; asAdmin?: boolean },
): Promise<{ id: string; slug: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error('Supabase is not configured');
  const city = opts.cities.find((c) => c.slug === v.city_slug);
  if (!city) throw new Error('city');
  const tz = city.timezone ?? DEFAULT_COUNTRY.timezone;
  const startsAt = localDateTimeToInstant(v.start_date, '00:00', tz);
  const endsAt = new Date(localDateTimeToInstant(v.end_date, '00:00', tz).getTime() + DAY);

  const row: Record<string, unknown> = {
    title: v.title.trim(),
    short_description: v.short_description.trim() || null,
    description: v.description.trim() || null,
    category: v.category,
    country_code: city.country_code,
    city_id: city.id,
    address: v.address.trim(),
    location: `SRID=4326;POINT(${v.lng} ${v.lat})`,
    timezone: tz,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    price_range: v.price_range,
    wheelchair_accessible: triToBool(v.wheelchair),
    parking_available: triToBool(v.parking),
    kid_friendly: triToBool(v.kids),
    accessibility_notes: v.accessibility_notes.trim() || null,
    instagram_url: v.instagram_url.trim() || null,
    website_url: v.website_url.trim() || null,
  };
  if (opts.asAdmin) {
    row.status = v.status;
    row.rejection_reason = v.status === 'rejected' ? v.rejection_reason.trim() || null : null;
    if (!v.id) row.source = 'manual';
  }
  if (!v.id && opts.organizerId) row.organizer_id = opts.organizerId;

  let id = v.id;
  let slug = v.slug;
  if (id) {
    const { error } = await supabase.from('popups').update(row).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    slug = slugify(v.title);
    const { data, error } = await supabase.from('popups').insert({ ...row, slug }).select('id, slug').single();
    if (error) throw new Error(error.message);
    id = data.id as string;
    slug = data.slug as string;
  }

  // Replace hours and images (simple and always consistent).
  const { error: hErr } = await supabase.from('popup_hours').delete().eq('popup_id', id);
  if (hErr) throw new Error(hErr.message);
  if (!v.all_day) {
    const rows = v.hours.flatMap((g) => g.days.map((weekday) => ({ popup_id: id, weekday, opens: g.opens, closes: g.closes })));
    const unique = [...new Map(rows.map((r) => [`${r.weekday}-${r.opens}`, r])).values()];
    if (unique.length) {
      const { error } = await supabase.from('popup_hours').insert(unique);
      if (error) throw new Error(error.message);
    }
  }
  const { error: iErr } = await supabase.from('popup_images').delete().eq('popup_id', id);
  if (iErr) throw new Error(iErr.message);
  if (v.images.length) {
    const { error } = await supabase.from('popup_images').insert(
      v.images.map((img, i) => ({ popup_id: id, url: img.url, storage_path: img.storage_path, alt: v.title.trim(), sort_order: i })),
    );
    if (error) throw new Error(error.message);
  }
  return { id: id!, slug: slug! };
}

/** Shrinks a photo in the browser (max 1600px, JPEG) and uploads it to Storage. */
export async function uploadPopupImage(file: File): Promise<PopupImageValue> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error('Supabase is not configured');
  const { data: session } = await supabase.auth.getSession();
  const uid = session.session?.user.id;
  if (!uid) throw new Error('not signed in');
  const blob = await resizeImage(file, 1600, 0.85);
  const path = `${uid}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from('popup-images').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('popup-images').getPublicUrl(path);
  return { url: data.publicUrl, storage_path: path };
}

async function resizeImage(file: File, maxSide: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('resize'))), 'image/jpeg', quality));
}
