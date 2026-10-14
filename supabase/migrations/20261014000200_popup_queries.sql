-- Read paths: "open now" logic, card view, nearby search, event tracking.

-- ---------------------------------------------------------------------------
-- Opening hours logic (mirrors packages/shared/src/status.ts)
-- ---------------------------------------------------------------------------

-- Is the pop-up open at the given instant, in its own timezone?
create or replace function public.popup_is_open_at(p_popup_id uuid, p_at timestamptz default now())
returns boolean
language sql
stable
set search_path = public
as $$
  with p as (
    select id, timezone, starts_at, ends_at,
           (p_at at time zone timezone) as local_ts
    from public.popups
    where id = p_popup_id
  )
  select coalesce((
    select p_at >= p.starts_at and p_at < p.ends_at and (
      not exists (select 1 from public.popup_hours h where h.popup_id = p.id)
      or exists (
        select 1
        from public.popup_hours h
        where h.popup_id = p.id
          and (
            -- Opened today and still before closing (or closes after midnight).
            (h.weekday = extract(dow from p.local_ts)
              and p.local_ts::time >= h.opens
              and (h.closes <= h.opens or p.local_ts::time < h.closes))
            -- Opened yesterday and runs past midnight.
            or (h.weekday = (extract(dow from p.local_ts)::int + 6) % 7
              and h.closes <= h.opens
              and p.local_ts::time < h.closes)
          )
      )
    )
    from p
  ), false);
$$;

-- Open now, or opens later today.
create or replace function public.popup_is_open_today(p_popup_id uuid, p_at timestamptz default now())
returns boolean
language sql
stable
set search_path = public
as $$
  select public.popup_is_open_at(p_popup_id, p_at) or coalesce((
    select
      p.starts_at < ((p_at at time zone p.timezone)::date + 1)::timestamp at time zone p.timezone
      and p.ends_at > p_at
      and (
        not exists (select 1 from public.popup_hours h where h.popup_id = p.id)
        or exists (
          select 1 from public.popup_hours h
          where h.popup_id = p.id
            and h.weekday = extract(dow from p_at at time zone p.timezone)
            and h.opens > (p_at at time zone p.timezone)::time
            and ((p_at at time zone p.timezone)::date + h.opens) at time zone p.timezone < p.ends_at
        )
      )
    from public.popups p
    where p.id = p_popup_id
  ), false);
$$;

-- Israeli weekend window: Thursday 00:00 → Sunday 00:00 (local). From Thursday on, it starts "now".
create or replace function public.weekend_range(p_tz text default 'Asia/Jerusalem', p_at timestamptz default now())
returns tstzrange
language sql
stable
as $$
  with d as (
    select (p_at at time zone p_tz)::date as today,
           extract(dow from p_at at time zone p_tz)::int as dow
  )
  select tstzrange(
    case when dow >= 4 then p_at else (today + (4 - dow))::timestamp at time zone p_tz end,
    (today + (7 - dow))::timestamp at time zone p_tz
  )
  from d;
$$;

create or replace function public.popup_is_on_weekend(p_popup_id uuid, p_at timestamptz default now())
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce((
    select tstzrange(p.starts_at, p.ends_at) && public.weekend_range(p.timezone, p_at)
      and (
        not exists (select 1 from public.popup_hours h where h.popup_id = p.id)
        or exists (select 1 from public.popup_hours h where h.popup_id = p.id and h.weekday in (4, 5, 6))
      )
    from public.popups p
    where p.id = p_popup_id
  ), false);
$$;

-- ---------------------------------------------------------------------------
-- Card view: everything a pop-up card needs, in one row.
-- security_invoker = RLS of the caller applies (public sees only live, approved pop-ups).
-- ---------------------------------------------------------------------------
create or replace view public.popup_cards
with (security_invoker = true)
as
select
  p.id,
  p.slug,
  p.title,
  p.short_description,
  p.category,
  p.country_code,
  c.slug as city_slug,
  c.name_he as city_name_he,
  c.name_en as city_name_en,
  p.address,
  extensions.st_y(p.location::extensions.geometry) as lat,
  extensions.st_x(p.location::extensions.geometry) as lng,
  p.location,
  p.timezone,
  p.starts_at,
  p.ends_at,
  p.price_range,
  p.status,
  p.created_at,
  p.approved_at,
  (select i.url from public.popup_images i where i.popup_id = p.id order by i.sort_order, i.id limit 1) as cover_image_url,
  coalesce((
    select json_agg(json_build_object(
             'weekday', h.weekday,
             'opens', to_char(h.opens, 'HH24:MI'),
             'closes', to_char(h.closes, 'HH24:MI'))
           order by h.weekday, h.opens)
    from public.popup_hours h where h.popup_id = p.id
  ), '[]'::json) as hours
from public.popups p
join public.cities c on c.id = p.city_id;

-- ---------------------------------------------------------------------------
-- nearby_popups: live pop-ups around a point, nearest first, with distance in km.
-- filters (all optional): {"category": "food", "open_now": true, "today": true,
--                          "this_weekend": true, "free_only": true}
-- ---------------------------------------------------------------------------
create or replace function public.nearby_popups(
  lat double precision,
  lng double precision,
  radius_km double precision default 10,
  filters jsonb default '{}'::jsonb,
  max_results int default 100,
  locale text default 'he'
)
returns table (
  id uuid,
  slug text,
  title text,
  short_description text,
  category text,
  country_code text,
  city_slug text,
  city_name text,
  address text,
  lat double precision,
  lng double precision,
  timezone text,
  starts_at timestamptz,
  ends_at timestamptz,
  price_range public.price_range,
  cover_image_url text,
  hours json,
  distance_km double precision
)
language sql
stable
set search_path = public, extensions
as $$
  with origin as (
    select extensions.st_setsrid(extensions.st_makepoint(nearby_popups.lng, nearby_popups.lat), 4326)::extensions.geography as g,
           least(greatest(coalesce(nearby_popups.radius_km, 10), 0.1), 200) * 1000 as radius_m
  )
  select
    pc.id, pc.slug, pc.title, pc.short_description, pc.category, pc.country_code, pc.city_slug,
    case when nearby_popups.locale = 'he' then pc.city_name_he else pc.city_name_en end,
    pc.address, pc.lat, pc.lng, pc.timezone, pc.starts_at, pc.ends_at, pc.price_range,
    pc.cover_image_url, pc.hours,
    round((extensions.st_distance(pc.location, origin.g) / 1000)::numeric, 2)::double precision as distance_km
  from public.popup_cards pc, origin
  where pc.status = 'approved'
    and pc.ends_at > now()
    and extensions.st_dwithin(pc.location, origin.g, origin.radius_m)
    and (filters ->> 'category' is null or pc.category = filters ->> 'category')
    and (coalesce((filters ->> 'free_only')::boolean, false) = false or pc.price_range = 'free')
    and (coalesce((filters ->> 'open_now')::boolean, false) = false or public.popup_is_open_at(pc.id))
    and (coalesce((filters ->> 'today')::boolean, false) = false or public.popup_is_open_today(pc.id))
    and (coalesce((filters ->> 'this_weekend')::boolean, false) = false or public.popup_is_on_weekend(pc.id))
  order by extensions.st_distance(pc.location, origin.g)
  limit least(greatest(coalesce(nearby_popups.max_results, 100), 1), 300);
$$;

-- ---------------------------------------------------------------------------
-- Event tracking. Anyone (even logged-out) can record events for live pop-ups.
-- Views are de-duplicated per session per pop-up per hour so refreshes don't inflate scores.
-- ---------------------------------------------------------------------------
create or replace function public.track_popup_event(
  p_popup_id uuid,
  p_event_type public.popup_event_type,
  p_session_id text default null,
  p_surface text default null,
  p_promotion_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.popups where id = p_popup_id and status = 'approved') then
    return;
  end if;

  if p_event_type in ('view', 'impression') and p_session_id is not null and exists (
    select 1 from public.popup_events
    where popup_id = p_popup_id
      and event_type = p_event_type
      and session_id = p_session_id
      and created_at > now() - interval '1 hour'
  ) then
    return;
  end if;

  insert into public.popup_events (popup_id, event_type, user_id, session_id, surface, promotion_id)
  values (p_popup_id, p_event_type, auth.uid(), left(p_session_id, 64), left(p_surface, 32), p_promotion_id);

  if p_promotion_id is not null then
    update public.promotions
       set impressions = impressions + (p_event_type = 'impression')::int,
           clicks = clicks + (p_event_type in ('click', 'navigate'))::int
     where id = p_promotion_id and popup_id = p_popup_id;
  end if;
end;
$$;

-- Per pop-up stats for its organizer (and admins).
create or replace function public.popup_stats(p_popup_id uuid, p_days int default 30)
returns table (views bigint, saves bigint, navigations bigint, shares bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*) filter (where e.event_type = 'view'),
    count(*) filter (where e.event_type = 'save'),
    count(*) filter (where e.event_type = 'navigate'),
    count(*) filter (where e.event_type = 'share')
  from public.popup_events e
  where e.popup_id = p_popup_id
    and e.created_at > now() - make_interval(days => least(greatest(p_days, 1), 365))
    and (
      public.is_admin()
      or exists (
        select 1 from public.popups p
        where p.id = p_popup_id and p.organizer_id is not null and public.owns_organizer(p.organizer_id)
      )
    );
$$;
