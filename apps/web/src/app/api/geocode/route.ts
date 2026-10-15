import type { NextRequest } from 'next/server';

// Address → coordinates for the pop-up form.
// Uses Google Geocoding when GOOGLE_MAPS_API_KEY is set (best for Hebrew addresses),
// otherwise OpenStreetMap Nominatim (free, no key).
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  const country = (request.nextUrl.searchParams.get('country') ?? 'IL').toUpperCase();
  if (!q || q.length < 3 || q.length > 200) return Response.json({ error: 'bad_query' }, { status: 400 });

  try {
    const result = process.env.GOOGLE_MAPS_API_KEY ? await google(q, country) : await nominatim(q, country);
    if (!result) return Response.json({ error: 'not_found' }, { status: 404 });
    return Response.json(result);
  } catch {
    return Response.json({ error: 'failed' }, { status: 502 });
  }
}

async function google(q: string, country: string) {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', q);
  url.searchParams.set('components', `country:${country}`);
  url.searchParams.set('language', 'he');
  url.searchParams.set('key', process.env.GOOGLE_MAPS_API_KEY!);
  const res = await fetch(url, { cache: 'no-store' });
  const data = (await res.json()) as { results?: { formatted_address: string; geometry: { location: { lat: number; lng: number } } }[] };
  const hit = data.results?.[0];
  return hit ? { lat: hit.geometry.location.lat, lng: hit.geometry.location.lng, label: hit.formatted_address } : null;
}

async function nominatim(q: string, country: string) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', country.toLowerCase());
  url.searchParams.set('accept-language', 'he');
  const res = await fetch(url, { cache: 'no-store', headers: { 'User-Agent': 'WhatsPoppin/1.0 (pop-up directory; geocoding for submissions)' } });
  const data = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  const hit = data[0];
  return hit ? { lat: Number(hit.lat), lng: Number(hit.lon), label: hit.display_name } : null;
}
