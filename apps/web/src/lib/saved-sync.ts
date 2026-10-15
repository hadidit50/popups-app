'use client';

import { getSavedIds, setSaved } from './saved';
import { getSupabaseBrowserClient } from './supabase/client';

/**
 * Keeps this browser's saved list and the visitor's Supabase favorites in sync, so reminders can be
 * sent (stage 8) and saved items follow a signed-in visitor to other devices.
 * Visitors who never signed up get an anonymous Supabase session — no sign-up screen.
 */
let running: Promise<void> | null = null;

export function syncSaved(): Promise<void> {
  running ??= doSync().finally(() => {
    running = null;
  });
  return running;
}

async function doSync() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const local = getSavedIds().filter((id) => !id.startsWith('demo-'));

  let { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    if (local.length === 0) return; // nothing to keep yet: don't create a session
    const { error } = await supabase.auth.signInAnonymously();
    if (error) return; // anonymous sign-ins disabled: stay local-only
    session = (await supabase.auth.getSession()).data;
  }
  const userId = session.session?.user.id;
  if (!userId) return;

  const { data: rows, error } = await supabase.from('favorites').select('popup_id');
  if (error) return;
  const server = new Set((rows ?? []).map((r: { popup_id: string }) => r.popup_id));

  // Server → this browser (e.g. saved on another device).
  for (const id of server) if (!local.includes(id)) setSaved(id, true);
  // This browser → server.
  const missing = local.filter((id) => !server.has(id));
  if (missing.length) {
    await supabase.from('favorites').upsert(missing.map((popup_id) => ({ user_id: userId, popup_id })), { ignoreDuplicates: true });
  }
}

/** Mirror a single save/unsave right away (best effort). */
export async function pushSavedChange(id: string, saved: boolean) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || id.startsWith('demo-')) return;
  if (saved) return syncSaved();
  const { data } = await supabase.auth.getSession();
  if (data.session) await supabase.from('favorites').delete().eq('popup_id', id);
}
