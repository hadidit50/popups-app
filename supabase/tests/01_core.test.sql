-- Core database checks. Each block raises an exception (and fails the run) if a check fails.
-- Runs as the seeded data: ~25 approved pop-ups + 1 pending.

-- Helpers to impersonate API callers.
create function pg_temp.as_anon() returns void language sql as $$
  select set_config('request.jwt.claims', '{"role":"anon"}', false);
  set role anon;
$$;
create function pg_temp.as_user(p_id uuid, p_anonymous boolean default false) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_id, 'role', 'authenticated', 'is_anonymous', p_anonymous)::text, false);
  set role authenticated;
$$;
create function pg_temp.as_postgres() returns void language sql as $$
  reset role;
  select set_config('request.jwt.claims', '', false);
$$;

-- Test users
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'admin@test'),
  ('00000000-0000-0000-0000-00000000000b', 'org@test'),
  ('00000000-0000-0000-0000-00000000000c', null);
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-00000000000a';

do $$
begin
  assert (select count(*) from public.profiles) = 3, 'profiles are created for new auth users';
  assert (select count(*) from public.popups where status = 'approved') >= 25, 'seed has 25+ approved pop-ups';
  assert (select count(distinct category) from public.popups) = 7, 'seed covers all 7 categories';
  assert (select count(distinct city_id) from public.popups) = 6, 'seed covers all 6 cities';
end $$;

-- ---------------------------------------------------------------------------
-- Open-now logic (mirrors packages/shared/src/status.ts tests)
-- ---------------------------------------------------------------------------
insert into public.popups (slug, title, category, country_code, city_id, address, location, starts_at, ends_at, status, source)
values ('t-hours', 'בדיקה', 'food', 'IL', 1, 'x', 'SRID=4326;POINT(34.78 32.08)',
        '2026-10-01 00:00+03', '2026-10-31 23:59+03', 'approved', 'manual');
insert into public.popup_hours (popup_id, weekday, opens, closes)
select id, w, '20:00', '02:00' from public.popups, generate_series(0, 6) w where slug = 't-hours';

do $$
declare v uuid := (select id from public.popups where slug = 't-hours');
begin
  assert public.popup_is_open_at(v, '2026-10-14 21:00+03'), 'open in the evening';
  assert public.popup_is_open_at(v, '2026-10-14 01:30+03'), 'open after midnight (from previous day)';
  assert not public.popup_is_open_at(v, '2026-10-14 12:00+03'), 'closed at noon';
  assert not public.popup_is_open_at(v, '2026-11-01 21:00+02'), 'closed after the event ended';
  assert public.popup_is_open_today(v, '2026-10-14 12:00+03'), 'opens later today counts as today';
end $$;

-- Weekend window: Wednesday → next Thursday 00:00 until Sunday 00:00 (Israel time)
do $$
declare r tstzrange := public.weekend_range('Asia/Jerusalem', '2026-10-14 12:00+03');
begin
  assert lower(r) = '2026-10-15 00:00+03'::timestamptz, 'weekend starts Thursday 00:00, got ' || lower(r);
  assert upper(r) = '2026-10-18 00:00+03'::timestamptz, 'weekend ends Sunday 00:00, got ' || upper(r);
  r := public.weekend_range('Asia/Jerusalem', '2026-10-16 12:00+03');
  assert lower(r) = '2026-10-16 12:00+03'::timestamptz, 'on Friday the window starts now';
end $$;
delete from public.popups where slug = 't-hours';

-- ---------------------------------------------------------------------------
-- nearby_popups
-- ---------------------------------------------------------------------------
select pg_temp.as_anon();
do $$
declare
  r record;
  prev double precision := 0;
  n int := 0;
begin
  for r in select * from public.nearby_popups(32.0853, 34.7818, 5) loop
    assert r.distance_km >= prev, 'results are sorted by distance';
    assert r.distance_km <= 5, 'results are within the radius';
    assert r.city_name = 'תל אביב-יפו', 'city name in Hebrew';
    prev := r.distance_km;
    n := n + 1;
  end loop;
  assert n >= 6, 'Tel Aviv center has 6+ pop-ups within 5 km, got ' || n;

  assert (select count(*) from public.nearby_popups(29.5577, 34.9519, 5)) = 2, 'Eilat has 2 pop-ups';
  assert (select count(*) from public.nearby_popups(32.0853, 34.7818, 25, '{"category":"food"}'))
       = (select count(*) from public.nearby_popups(32.0853, 34.7818, 25) where category = 'food'),
         'category filter';
  assert not exists (select 1 from public.nearby_popups(32.0853, 34.7818, 25, '{"free_only":true}') where price_range <> 'free'),
         'free filter';
  assert not exists (select 1 from public.nearby_popups(32.0853, 34.7818, 25) where slug = 'pending-candle-workshop'),
         'pending pop-ups are hidden';
  -- Jaffa street art has no hours: always open while running.
  assert exists (select 1 from public.nearby_popups(32.0853, 34.7818, 25, '{"open_now":true}') where slug = 'jaffa-street-walls'),
         '24/7 pop-up is open now';
  assert (select hours::text from public.nearby_popups(32.0853, 34.7818, 25) where slug = 'sneaker-drop-dizengoff') like '%"opens" : "10:00"%',
         'hours are returned as HH:MM';
end $$;
select pg_temp.as_postgres();

-- Expired pop-ups disappear automatically.
update public.popups set ends_at = now() - interval '1 minute', starts_at = now() - interval '2 days'
where slug = 'rothschild-taco-truck';
select pg_temp.as_anon();
do $$ begin
  assert not exists (select 1 from public.popups where slug = 'rothschild-taco-truck'), 'expired pop-up hidden from table reads';
  assert not exists (select 1 from public.nearby_popups(32.0853, 34.7818, 25) where slug = 'rothschild-taco-truck'), 'expired pop-up hidden from nearby';
end $$;
select pg_temp.as_postgres();

-- ---------------------------------------------------------------------------
-- RLS: anonymous visitors
-- ---------------------------------------------------------------------------
select pg_temp.as_anon();
do $$ begin
  assert not exists (select 1 from public.popups where status <> 'approved'), 'anon sees only approved';
  -- Either no grant (locally) or RLS returns nothing (Supabase grants tables to anon by default).
  begin
    assert (select count(*) from public.promotions) = 0, 'anon cannot read promotions';
  exception when insufficient_privilege then null;
  end;
  begin
    assert (select count(*) from public.popup_events) = 0, 'anon cannot read events';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.favorites (user_id, popup_id) values ('00000000-0000-0000-0000-00000000000c', (select id from public.popups limit 1));
    raise exception 'anon should not insert favorites';
  exception when insufficient_privilege then null;
  end;
end $$;
-- Tracking works without login
select public.track_popup_event((select id from public.popups where slug = 'florentin-food-market'), 'view', 'sess-1', 'test');
select public.track_popup_event((select id from public.popups where slug = 'florentin-food-market'), 'view', 'sess-1', 'test');
select pg_temp.as_postgres();
do $$ begin
  assert (select count(*) from public.popup_events where session_id = 'sess-1') = 1, 'views are de-duplicated per session';
end $$;

-- ---------------------------------------------------------------------------
-- RLS: anonymous-session user (saving without sign-up) + organizer + admin
-- ---------------------------------------------------------------------------
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c', true);
insert into public.favorites (user_id, popup_id) select '00000000-0000-0000-0000-00000000000c', id from public.popups where slug = 'jaffa-street-walls';
do $$ begin
  assert (select count(*) from public.favorites) = 1, 'anonymous session can save';
  begin
    insert into public.organizers (owner_id, name) values ('00000000-0000-0000-0000-00000000000c', 'Anon Biz');
    raise exception 'anonymous session should not create an organizer';
  exception when insufficient_privilege then null;
  end;
end $$;
select pg_temp.as_postgres();

select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
insert into public.organizers (owner_id, name) values ('00000000-0000-0000-0000-00000000000b', 'עסק בדיקה');
insert into public.popups (slug, title, category, country_code, city_id, address, location, starts_at, ends_at, organizer_id, status)
select 'org-test', 'פופ-אפ של מארגן', 'art', 'IL', 1, 'x', 'SRID=4326;POINT(34.78 32.08)',
       now(), now() + interval '5 days', id, 'approved'  -- tries to self-approve
from public.organizers;
do $$ begin
  assert (select status from public.popups where slug = 'org-test') = 'pending', 'organizer submissions are forced to pending';
  assert (select count(*) from public.favorites) = 0, 'cannot see other users favorites';
  begin
    update public.profiles set role = 'admin' where id = auth.uid();
    raise exception 'should not be able to change own role';
  exception when raise_exception then
    if sqlerrm <> 'Only admins can change roles' then raise; end if;
  end;
  update public.popups set title = 'שם מעודכן' where slug = 'florentin-food-market';
  assert (select title from public.popups where slug = 'florentin-food-market') = 'שוק האוכל של פלורנטין', 'organizer cannot edit others pop-ups';
end $$;
select pg_temp.as_postgres();

select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
update public.popups set status = 'approved' where slug = 'org-test';
do $$ begin
  assert (select approved_by from public.popups where slug = 'org-test') = '00000000-0000-0000-0000-00000000000a', 'admin approval is recorded';
  assert (select count(*) from public.promotions) = 5, 'admin sees promotions';
end $$;
select pg_temp.as_postgres();

-- Organizer edits an approved pop-up → stays live but is flagged for review.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
update public.popups set short_description = 'עודכן' where slug = 'org-test';
select pg_temp.as_postgres();
do $$ begin
  assert (select status = 'approved' and needs_review from public.popups where slug = 'org-test'), 'edit keeps it live and flags review';
end $$;

-- Stats are visible to the owner only.
select public.track_popup_event((select id from public.popups where slug = 'org-test'), 'navigate', 'sess-2');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
do $$ begin
  assert (select navigations from public.popup_stats((select id from public.popups where slug = 'org-test'))) = 1, 'owner sees stats';
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin
  assert (select navigations from public.popup_stats((select id from public.popups where slug = 'org-test'))) = 0, 'others see zero stats';
end $$;
select pg_temp.as_postgres();
