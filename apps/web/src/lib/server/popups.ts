import 'server-only';
import { cacheLife } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { demoDetails, type PopupDetails } from '@whats-poppin/shared';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const configured = url.startsWith('http') && anonKey.length > 20;

export type PopupPage = PopupDetails & { status?: 'approved' | 'pending' | 'rejected' };

/** A pop-up's public page data. Cached for a few minutes; status words are computed in the browser. */
export async function getPopupBySlug(slug: string): Promise<PopupPage | null> {
  'use cache';
  cacheLife('minutes');
  if (!configured) return demoDetails(slug);
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.rpc('popup_details', { p_slug: slug, p_locale: 'he' });
  if (error) throw new Error(error.message);
  return (data as PopupPage | null) ?? null;
}
