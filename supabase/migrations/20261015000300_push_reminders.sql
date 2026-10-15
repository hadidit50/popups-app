-- Web push subscriptions + "your saved pop-up ends soon" reminders.

create table public.push_subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;
grant select, insert, update, delete on public.push_subscriptions to authenticated;
create policy "own push subscriptions" on public.push_subscriptions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Saved pop-ups ending within the window, for people who want reminders and haven't had one.
-- Called by the server job with the service role key only.
create or replace function public.due_saved_reminders(p_window interval default interval '36 hours')
returns table (
  user_id uuid,
  popup_id uuid,
  title text,
  slug text,
  ends_at timestamptz,
  timezone text,
  endpoint text,
  p256dh text,
  auth text
)
language sql
stable
security definer
set search_path = public
as $$
  select f.user_id, p.id, p.title, p.slug, p.ends_at, p.timezone, s.endpoint, s.p256dh, s.auth
  from public.favorites f
  join public.popups p on p.id = f.popup_id
  join public.profiles pr on pr.id = f.user_id
  join public.push_subscriptions s on s.user_id = f.user_id
  where f.remind_before_end
    and f.reminder_sent_at is null
    and pr.notify_saved_ending
    and p.status = 'approved'
    and p.ends_at > now()
    and p.ends_at <= now() + p_window;
$$;

create or replace function public.mark_reminders_sent(p_user_ids uuid[], p_popup_ids uuid[])
returns void
language sql
security definer
set search_path = public
as $$
  update public.favorites f
     set reminder_sent_at = now()
    from unnest(p_user_ids, p_popup_ids) as x(user_id, popup_id)
   where f.user_id = x.user_id and f.popup_id = x.popup_id;
$$;

revoke all on function public.due_saved_reminders(interval) from public, anon, authenticated;
revoke all on function public.mark_reminders_sent(uuid[], uuid[]) from public, anon, authenticated;
grant execute on function public.due_saved_reminders(interval) to service_role;
grant execute on function public.mark_reminders_sent(uuid[], uuid[]) to service_role;
