import type { PopupSummary } from './types.ts';

const DAY = 86_400_000;
const everyDay = (opens: string, closes: string) =>
  [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, opens, closes }));
const img = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=75&auto=format&fit=crop`;

/** Offline sample data for the design preview, so it works before Supabase is set up. */
export function samplePopups(nowMs = Date.now()): PopupSummary[] {
  // Round to the hour so sample times read naturally ("18:00", not "18:02").
  const now = Math.floor(nowMs / 3_600_000) * 3_600_000;
  const base = {
    country_code: 'IL',
    timezone: 'Asia/Jerusalem',
    short_description: null,
    lat: 32.08,
    lng: 34.78,
    address: '',
  };
  return [
    {
      ...base,
      id: 's1',
      slug: 'florentin-food-market',
      title: 'שוק האוכל של פלורנטין',
      category: 'food',
      city_slug: 'tel-aviv',
      city_name: 'תל אביב-יפו',
      starts_at: new Date(now - 10 * DAY).toISOString(),
      ends_at: new Date(now + 20 * DAY).toISOString(),
      price_range: 'medium',
      cover_image_url: img('photo-1555396273-367ea4eb4db5'),
      hours: [],
      distance_km: 1.24,
    },
    {
      ...base,
      id: 's2',
      slug: 'sneaker-drop',
      title: 'Sneaker Drop – פופ-אפ סניקרס',
      category: 'brands',
      city_slug: 'tel-aviv',
      city_name: 'תל אביב-יפו',
      starts_at: new Date(now - 4 * DAY).toISOString(),
      ends_at: new Date(now + 2 * DAY).toISOString(),
      price_range: 'high',
      cover_image_url: img('photo-1542291026-7eec264c27ff'),
      hours: everyDay('10:00', '22:00'),
      distance_km: 0.35,
      is_sponsored: true,
    },
    {
      ...base,
      id: 's3',
      slug: 'jaffa-walls',
      title: 'קירות מדברים – תערוכת רחוב ביפו',
      category: 'art',
      city_slug: 'tel-aviv',
      city_name: 'תל אביב-יפו',
      starts_at: new Date(now - 20 * DAY).toISOString(),
      ends_at: new Date(now + 4 * 3_600_000).toISOString(),
      price_range: 'free',
      cover_image_url: null,
      hours: [],
      distance_km: 3.8,
    },
    {
      ...base,
      id: 's4',
      slug: 'hadar-design',
      title: 'יריד עיצוב בהדר',
      category: 'fashion',
      city_slug: 'haifa',
      city_name: 'חיפה',
      starts_at: new Date(now + 2 * DAY).toISOString(),
      ends_at: new Date(now + 4 * DAY).toISOString(),
      price_range: 'medium',
      cover_image_url: 'https://invalid.example/broken.jpg',
      hours: everyDay('10:00', '22:00'),
      distance_km: null,
    },
  ];
}
