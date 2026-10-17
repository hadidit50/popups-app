'use client';

import { DEFAULT_COUNTRY, zonedDayTime } from '@whats-poppin/shared';
import { DEMO_SEED } from '@whats-poppin/shared/src/demo-data';
import { getSupabaseBrowserClient } from './supabase/client';

// A handful of sample pop-ups an admin can add with one tap (to show the site to friends before real
// content exists) and remove with one tap later. They are copies of the built-in demo data, dated
// relative to the moment they're added, and recognisable by the "sample-" slug prefix.

const PICK = ['florentin-food-market', 'sarona-vintage-market', 'jaffa-street-walls', 'yarkon-kids-ceramics', 'mahane-yehuda-night-market'];
const PREFIX = 'sample-';
const IMAGE = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=75&auto=format&fit=crop`;

function client() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

export async function countSamplePopups(): Promise<number> {
  const { count, error } = await client().from('popups').select('id', { count: 'exact', head: true }).like('slug', `${PREFIX}%`);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** Adds the sample pop-ups (skips any that are already there). Returns how many were added. */
export async function addSamplePopups(sampleNote: string): Promise<number> {
  const supabase = client();
  const now = new Date();
  const tz = DEFAULT_COUNTRY.timezone;
  const { data: cities, error: cErr } = await supabase.from('cities').select('id, slug, country_code, timezone');
  if (cErr) throw new Error(cErr.message);
  let added = 0;
  for (const s of DEMO_SEED.filter((p) => PICK.includes(p.slug))) {
    const city = (cities ?? []).find((c: { slug: string }) => c.slug === s.city_slug) as
      | { id: number; country_code: string; timezone: string | null }
      | undefined;
    if (!city) continue;
    const slug = PREFIX + s.slug;
    const { data: existing } = await supabase.from('popups').select('id').eq('slug', slug).maybeSingle();
    if (existing) continue;
    const zone = city.timezone ?? tz;
    const startsAt = zonedDayTime(s.starts.days, s.starts.time, zone, now);
    const endsAt = zonedDayTime(s.ends.days, s.ends.time, zone, now);
    const { data: row, error } = await supabase
      .from('popups')
      .insert({
        slug,
        title: s.title,
        short_description: s.short_description,
        description: `${s.description}\n\n${sampleNote}`,
        category: s.category,
        country_code: city.country_code,
        city_id: city.id,
        address: s.address,
        location: `SRID=4326;POINT(${s.lng} ${s.lat})`,
        timezone: zone,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        price_range: s.price_range,
        wheelchair_accessible: s.wheelchair_accessible,
        parking_available: s.parking_available,
        kid_friendly: s.kid_friendly,
        status: 'approved',
        source: 'manual',
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    const id = row.id as string;
    if (s.hours.length) {
      const { error: hErr } = await supabase.from('popup_hours').insert(s.hours.map((h) => ({ popup_id: id, weekday: h.weekday, opens: h.opens, closes: h.closes })));
      if (hErr) throw new Error(hErr.message);
    }
    const images = [s.image, s.image2].filter((x): x is string => !!x);
    if (images.length) {
      const { error: iErr } = await supabase
        .from('popup_images')
        .insert(images.map((img, i) => ({ popup_id: id, url: IMAGE(img), storage_path: null, alt: s.title, sort_order: i })));
      if (iErr) throw new Error(iErr.message);
    }
    added++;
  }
  return added;
}

/** Removes every sample pop-up (hours, photos, saves and statistics go with them). */
export async function removeSamplePopups(): Promise<void> {
  const { error } = await client().from('popups').delete().like('slug', `${PREFIX}%`);
  if (error) throw new Error(error.message);
}
