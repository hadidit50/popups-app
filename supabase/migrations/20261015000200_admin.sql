-- Admin dashboard numbers. Admins only (returns null for everyone else).
create or replace function public.admin_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case when not public.is_admin() then null else jsonb_build_object(
    'live', (select count(*) from public.popups where status = 'approved' and ends_at > now()),
    'pending', (select count(*) from public.popups where (status = 'pending' or needs_review) and ends_at > now()),
    'organizers', (select count(*) from public.organizers),
    'views_7d', (select count(*) from public.popup_events where event_type = 'view' and created_at > now() - interval '7 days'),
    'saves_7d', (select count(*) from public.popup_events where event_type = 'save' and created_at > now() - interval '7 days'),
    'navigations_7d', (select count(*) from public.popup_events where event_type = 'navigate' and created_at > now() - interval '7 days'),
    'top', coalesce((
      select jsonb_agg(t order by t.views desc)
      from (
        select p.id, p.slug, p.title, count(*) as views
        from public.popup_events e join public.popups p on p.id = e.popup_id
        where e.event_type = 'view' and e.created_at > now() - interval '7 days'
        group by p.id, p.slug, p.title
        order by count(*) desc
        limit 10
      ) t
    ), '[]'::jsonb)
  ) end;
$$;

grant execute on function public.admin_stats() to authenticated;
