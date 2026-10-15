'use client';

import { syncSaved } from './saved-sync';
import { getSupabaseBrowserClient } from './supabase/client';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

export type PushSupport =
  | 'unconfigured' // the site owner hasn't set up push keys / Supabase yet
  | 'unsupported' // this browser can't do web push
  | 'ios-needs-install' // iPhone/iPad: works only after "Add to Home Screen"
  | 'denied' // the visitor blocked notifications
  | 'available';

export function pushSupport(): PushSupport {
  if (!VAPID_PUBLIC_KEY || !getSupabaseBrowserClient()) return 'unconfigured';
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
  if (ios && !standalone) return 'ios-needs-install';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  return 'available';
}

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export async function isPushEnabled(): Promise<boolean> {
  if (pushSupport() !== 'available' || Notification.permission !== 'granted') return false;
  const reg = await navigator.serviceWorker.getRegistration();
  return !!(await reg?.pushManager.getSubscription());
}

/** Asks for permission (only after the visitor tapped "turn on") and stores the subscription. */
export async function enablePush(): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || pushSupport() !== 'available') return false;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  // Reminders are tied to a (possibly anonymous) Supabase user who owns the saved list.
  let { data } = await supabase.auth.getSession();
  if (!data.session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) return false;
    data = (await supabase.auth.getSession()).data;
  }
  const userId = data.session?.user.id;
  if (!userId) return false;

  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) }));
  const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
  const { error } = await supabase.from('push_subscriptions').upsert(
    { user_id: userId, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth, user_agent: navigator.userAgent.slice(0, 200) },
    { onConflict: 'endpoint' },
  );
  if (error) return false;
  await supabase.from('profiles').update({ notify_saved_ending: true }).eq('id', userId);
  await syncSaved();
  return true;
}

export async function disablePush(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await supabase?.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
    await sub.unsubscribe();
  }
}
