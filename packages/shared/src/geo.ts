// Launch geography. The database is the source of truth (countries / cities tables);
// this copy lets the app show the city picker instantly, even offline.

export interface CityOption {
  slug: string;
  countryCode: string;
  lat: number;
  lng: number;
}

export const DEFAULT_COUNTRY = { code: 'IL', timezone: 'Asia/Jerusalem', currency: 'ILS', locale: 'he' } as const;

export const LAUNCH_CITIES: CityOption[] = [
  { slug: 'tel-aviv', countryCode: 'IL', lat: 32.0853, lng: 34.7818 },
  { slug: 'jerusalem', countryCode: 'IL', lat: 31.7683, lng: 35.2137 },
  { slug: 'haifa', countryCode: 'IL', lat: 32.794, lng: 34.9896 },
  { slug: 'rishon-lezion', countryCode: 'IL', lat: 31.973, lng: 34.7925 },
  { slug: 'beer-sheva', countryCode: 'IL', lat: 31.2518, lng: 34.7913 },
  { slug: 'eilat', countryCode: 'IL', lat: 29.5577, lng: 34.9519 },
];

/** Center of Israel, used when we have neither location nor a chosen city. */
export const COUNTRY_CENTER = { lat: 31.6, lng: 34.95 };

/** Great-circle distance in km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** "350 מ׳" style values: returns meters under 1 km, otherwise km with one decimal under 10. */
export function splitDistance(km: number): { unit: 'm' | 'km'; value: number } {
  if (km < 1) return { unit: 'm', value: Math.max(50, Math.round((km * 1000) / 50) * 50) };
  if (km < 10) return { unit: 'km', value: Math.round(km * 10) / 10 };
  return { unit: 'km', value: Math.round(km) };
}
