import type { MetadataRoute } from 'next';
import { cacheLife } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { CATEGORY_SLUGS } from '@whats-poppin/shared';
import { DEMO_SEED } from '@whats-poppin/shared/src/demo-data';

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

  let slugs: string[] = DEMO_SEED.filter((p) => p.status === 'approved').map((p) => p.slug);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url?.startsWith('http') && key) {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data } = await supabase.from('popups').select('slug').limit(5000);
    slugs = (data ?? []).map((r: { slug: string }) => r.slug);
  }
  return [...pages, ...slugs.map((slug) => ({ url: `${site}/p/${slug}`, changeFrequency: 'daily' as const, priority: 0.8 }))];
}
