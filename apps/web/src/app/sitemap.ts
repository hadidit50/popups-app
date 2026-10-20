import type { MetadataRoute } from 'next';
import { cacheLife } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { CATEGORY_SLUGS } from '@whats-poppin/shared';

/** Home, category pages and every live pop-up page, refreshed hourly. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  'use cache';
  cacheLife('hours');
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const pages: MetadataRoute.Sitemap = [
    { url: `${site}/`, changeFrequency: 'hourly', priority: 1 },
    { url: `${site}/map`, changeFrequency: 'hourly', priority: 0.6 },
    ...CATEGORY_SLUGS.map((slug) => ({ url: `${site}/category/${slug}`, changeFrequency: 'daily' as const, priority: 0.7 })),
  ];

  // Without a database the site only has sample pop-ups: keep them out of search engines.
  let slugs: string[] = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url?.startsWith('http') && key) {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data } = await supabase.from('popups').select('slug').limit(5000);
    slugs = (data ?? []).map((r: { slug: string }) => r.slug);
  }
  return [...pages, ...slugs.map((slug) => ({ url: `${site}/p/${slug}`, changeFrequency: 'daily' as const, priority: 0.8 }))];
}
