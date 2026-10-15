import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { DAY, startOfLocalDay, toLocalMs } from '@whats-poppin/shared';
import { t } from '@/lib/i18n';

// Sends "your saved pop-up ends soon" push reminders. Run daily by Vercel Cron (vercel.json).
// Needs: SUPABASE_SERVICE_ROLE_KEY, VAPID_PRIVATE_KEY, NEXT_PUBLIC_VAPID_PUBLIC_KEY, CRON_SECRET.

interface Due {
  user_id: string;
  popup_id: string;
  title: string;
  slug: string;
  ends_at: string;
  timezone: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!url || !serviceKey || !publicKey || !privateKey) return Response.json({ error: 'not configured' }, { status: 500 });

  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? 'mailto:hello@whatspoppin.app', publicKey, privateKey);
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.rpc('due_saved_reminders', { p_window: '36 hours' });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const now = new Date();
  const site = new URL(request.url).origin;
  const sent = new Map<string, { user_id: string; popup_id: string }>();
  const dead: string[] = [];

  for (const r of (data ?? []) as Due[]) {
    const lastDay = startOfLocalDay(toLocalMs(new Date(new Date(r.ends_at).getTime() - 1), r.timezone));
    const today = startOfLocalDay(toLocalMs(now, r.timezone));
    const title = lastDay - today < DAY ? t('notifications.pushTitleToday', { title: r.title }) : t('notifications.pushTitle', { title: r.title });
    try {
      await webpush.sendNotification(
        { endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } },
        JSON.stringify({ title, body: t('notifications.pushBody'), url: `${site}/p/${r.slug}`, tag: r.popup_id }),
        { TTL: 6 * 3600 },
      );
      sent.set(`${r.user_id}:${r.popup_id}`, { user_id: r.user_id, popup_id: r.popup_id });
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) dead.push(r.endpoint);
    }
  }

  const pairs = [...sent.values()];
  if (pairs.length) {
    await supabase.rpc('mark_reminders_sent', { p_user_ids: pairs.map((p) => p.user_id), p_popup_ids: pairs.map((p) => p.popup_id) });
  }
  if (dead.length) await supabase.from('push_subscriptions').delete().in('endpoint', dead);
  return Response.json({ sent: pairs.length, removed: dead.length });
}
