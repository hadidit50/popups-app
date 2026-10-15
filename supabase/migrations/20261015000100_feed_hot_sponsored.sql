-- Feed queries: "Hot now" score, sponsored placement, and one card-list function used by every
-- list in the site (discover sections, "see all", search, category pages, map, saved).

-- ---------------------------------------------------------------------------
-- Hot score
--   score = views·w.view + saves·w.save + navigations·w.navigate + shares·w.share   (last window_hours)
--         + ending_soon_boost  (ends within 48h)
--         + new_boost          (opened within the last 72h)
--   Weights live in app_config.hot_score_weights, editable without code changes.
-- ---------------------------------------------------------------------------
create materialized view public.popup_hot_scores as
with cfg as (
  select coalesce((select value from public.app_config where key = 'hot_score_weights'), '{}'::jsonb) as w
),
ev as (
  select
    e.popup_id,
    count(*) filter (where e.event_type = 'view') as views,
    count(*) filter (where e.event_type = 'save') as saves,
    count(*) filter (where e.event_type = 'navigate') as navigations,
    count(*) filter (where e.event_type = 'share') as shares
  from public.popup_events e, cfg
  where e.created_at > now() - make_interval(hours => coalesce((cfg.w ->> 'window_hours')::int, 24))
  group by e.popup_id
)
select
  p.id as popup_id,
  coalesce(ev.views, 0) as views,
  coalesce(ev.saves, 0) as saves,
  coalesce(ev.navigations, 0) as navigations,
  coalesce(ev.shares, 0) as shares,
  (
    coalesce(ev.views, 0) * coalesce((cfg.w ->> 'view')::numeric, 1)
    + coalesce(ev.saves, 0) * coalesce((cfg.w ->> 'save')::numeric, 4)
    + coalesce(ev.navigations, 0) * coalesce((cfg.w ->> 'navigate')::numeric, 6)
    + coalesce(ev.shares, 0) * coalesce((cfg.w ->> 'share')::numeric, 3)
    + case when p.ends_at < now() + interval '48 hours' then coalesce((cfg.w ->> 'ending_soon_boost')::numeric, 15) else 0 end
    + case when p.starts_at between now() - interval '72 hours' and now() then coalesce((cfg.w ->> 'new_boost')::numeric, 10) else 0 end
  ) as score,
  now() as computed_at
from public.popups p
cross join cfg
left join ev on ev.popup_id = p.id
where p.status = 'approved' and p.ends_at > now();

create unique index popup_hot_scores_popup_idx on public.popup_hot_scores (popup_id);
revoke all on public.popup_hot_scores from anon, authenticated;

-- Refreshes the scores if they are older than 10 minutes. Called from feed reads, so the
-- ranking stays fresh without any scheduler; only one caller refreshes at a time.
create or replace function public.maybe_refresh_hot_scores(p_max_age interval default interval '10 minutes')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last timestamptz;
begin
  select max(computed_at) into v_last from public.popup_hot_scores;
  if v_last is not null and v_last > now() - p_max_age then
    return;
  end if;
  if pg_try_advisory_xact_lock(hashtext('popup_hot_scores')) then
    refresh materialized view concurrently public.popup_hot_scores;
  end if;
end;
$$;

-- Optional: if pg_cron is enabled (Supabase → Database → Extensions), refresh every 10 minutes too.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    execute $cron$select cron.schedule('refresh-hot-scores', '*/10 * * * *',
      'select public.maybe_refresh_hot_scores(interval ''0 minutes'')')$cron$;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Sponsored items: at most one per `sponsored_every_n` items, placed first, then every N.
-- ---------------------------------------------------------------------------
create or replace function public.interleave_sponsored(p_organic jsonb, p_sponsored jsonb, p_every_n int, p_limit int)
returns jsonb
language plpgsql
immutable
as $$
declare
  v_out jsonb := '[]'::jsonb;
  v_sponsored_ids jsonb := coalesce((select jsonb_agg(s -> 'id') from jsonb_array_elements(p_sponsored) s), '[]'::jsonb);
  v_item jsonb;
  v_si int := 0;
  v_n int := greatest(coalesce(p_every_n, 5), 2);
begin
  for v_item in select value from jsonb_array_elements(coalesce(p_organic, '[]'::jsonb)) loop
    -- Don't show the same pop-up twice (once sponsored, once organic).
    continue when v_sponsored_ids @> jsonb_build_array(v_item -> 'id');
    if jsonb_array_length(v_out) % v_n = 0 and v_si < jsonb_array_length(p_sponsored) then
      v_out := v_out || jsonb_build_array(p_sponsored -> v_si);
      v_si := v_si + 1;
    end if;
    v_out := v_out || jsonb_build_array(v_item);
  end loop;
  -- Nothing organic at all: still show one sponsored item rather than an empty list.
  if jsonb_array_length(v_out) = 0 and jsonb_array_length(p_sponsored) > 0 then
    v_out := jsonb_build_array(p_sponsored -> 0);
  end if;
  return coalesce((select jsonb_agg(value order by ord) from jsonb_array_elements(v_out) with ordinality as x(value, ord) where ord <= p_limit), '[]'::jsonb);
end;
$$;

-- ---------------------------------------------------------------------------
-- popup_list: THE card list. Every list on the site calls this.
--   p_section: 'hot' | 'nearby' | 'weekend' | 'ending_soon' | 'all' | 'map'
--   p_filters: {"category": "food", "open_now": true, "today": true, "this_weekend": true,
--               "free_only": true, "query": "טאקו", "categories": ["food"], "ids": ["…uuid…"]}
-- Returns a JSON array of cards (same shape as PopupSummary in packages/shared/src/types.ts).
-- Sponsored items carry "is_sponsored": true and "promotion_id".
-- ---------------------------------------------------------------------------
create or replace function public.popup_list(
  p_section text default 'all',
  p_lat double precision default null,
  p_lng double precision default null,
  p_radius_km double precision default 10,
  p_filters jsonb default '{}'::jsonb,
  p_limit int default 20,
  p_country text default null,
  p_locale text default 'he'
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_limit int := least(greatest(coalesce(p_limit, 20), 1), 300);
  v_every int := coalesce((select (value #>> '{}')::int from public.app_config where key = 'sponsored_every_n'), 5);
  v_placement public.promotion_placement := case p_section
    when 'hot' then 'hot_now'::public.promotion_placement
    when 'nearby' then 'nearby_top'::public.promotion_placement
    when 'map' then 'map_highlight'::public.promotion_placement
  end;
  v_origin extensions.geography := case when p_lat is not null and p_lng is not null
    then extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography end;
  v_radius_m double precision := least(greatest(coalesce(p_radius_km, 10), 0.1), 500) * 1000;
  v_f jsonb := coalesce(p_filters, '{}'::jsonb);
  v_query text := nullif(trim(v_f ->> 'query'), '');
  v_categories text[] := case when jsonb_typeof(v_f -> 'categories') = 'array'
    then array(select jsonb_array_elements_text(v_f -> 'categories')) end;
  v_ids uuid[] := case when jsonb_typeof(v_f -> 'ids') = 'array'
    then array(select jsonb_array_elements_text(v_f -> 'ids')::uuid) end;
  v_organic jsonb;
  v_sponsored jsonb;
begin
  if p_section not in ('hot', 'nearby', 'weekend', 'ending_soon', 'all', 'map') then
    raise exception 'unknown section %', p_section;
  end if;
  if p_section = 'nearby' and v_origin is null then
    return '[]'::jsonb;
  end if;

  perform public.maybe_refresh_hot_scores();

  with base as (
    select
      pc.*,
      case when v_origin is not null then extensions.st_distance(pc.location, v_origin) / 1000 end as dist_km,
      coalesce(hs.score, 0) as score,
      (select pr.id from public.promotions pr
        where v_placement is not null and pr.popup_id = pc.id and pr.placement = v_placement
          and pr.status = 'active' and now() >= pr.starts_at and now() < pr.ends_at
        order by pr.budget_amount desc limit 1) as promo_id
    from public.popup_cards pc
    left join public.popup_hot_scores hs on hs.popup_id = pc.id
    where pc.status = 'approved'
      and pc.ends_at > now()
      and (p_country is null or pc.country_code = p_country)
      and (v_ids is null or pc.id = any (v_ids))
      and (v_f ->> 'category' is null or pc.category = v_f ->> 'category')
      and (
        v_query is null and v_categories is null
        or (v_categories is not null and pc.category = any (v_categories))
        or (v_query is not null and (
          pc.title ilike '%' || v_query || '%'
          or pc.short_description ilike '%' || v_query || '%'
          or pc.address ilike '%' || v_query || '%'
          or pc.city_name_he ilike '%' || v_query || '%'
          or pc.city_name_en ilike '%' || v_query || '%'
        ))
      )
      and (coalesce((v_f ->> 'free_only')::boolean, false) = false or pc.price_range = 'free')
      and (coalesce((v_f ->> 'open_now')::boolean, false) = false or public.popup_is_open_at(pc.id))
      and (coalesce((v_f ->> 'today')::boolean, false) = false or public.popup_is_open_today(pc.id))
      and (coalesce((v_f ->> 'this_weekend')::boolean, false) = false or public.popup_is_on_weekend(pc.id))
      and (p_section not in ('nearby', 'map') or v_origin is null or extensions.st_dwithin(pc.location, v_origin, v_radius_m))
      and (p_section <> 'weekend' or public.popup_is_on_weekend(pc.id))
      and (p_section <> 'ending_soon' or (pc.ends_at <= now() + interval '72 hours' and pc.starts_at <= now()))
  ),
  cards as (
    select
      b.*,
      jsonb_build_object(
        'id', b.id,
        'slug', b.slug,
        'title', b.title,
        'short_description', b.short_description,
        'category', b.category,
        'country_code', b.country_code,
        'city_slug', b.city_slug,
        'city_name', case when p_locale = 'he' then b.city_name_he else b.city_name_en end,
        'address', b.address,
        'lat', b.lat,
        'lng', b.lng,
        'timezone', b.timezone,
        'starts_at', b.starts_at,
        'ends_at', b.ends_at,
        'price_range', b.price_range,
        'cover_image_url', b.cover_image_url,
        'hours', b.hours,
        'distance_km', round(b.dist_km::numeric, 2)
      ) as card
    from base b
  )
  select
    (select coalesce(jsonb_agg(o.card || jsonb_build_object(
              'is_sponsored', p_section = 'map' and o.promo_id is not null,
              'promotion_id', case when p_section = 'map' then o.promo_id end)
            order by o.ord), '[]'::jsonb)
       from (
         select c.card, c.promo_id,
           row_number() over (order by
             case when p_section = 'hot' then c.score end desc nulls last,
             case when p_section = 'ending_soon' then c.ends_at end asc nulls last,
             c.dist_km asc nulls last,
             case when p_section = 'weekend' then c.starts_at end asc nulls last,
             c.score desc,
             c.ends_at asc) as ord
         from cards c
       ) o
       where o.ord <= v_limit + 5),
    (select coalesce(jsonb_agg(s.card || jsonb_build_object('is_sponsored', true, 'promotion_id', s.promo_id)), '[]'::jsonb)
       from (
         select c.card, c.promo_id from cards c
         where p_section in ('hot', 'nearby') and c.promo_id is not null
         order by random()
         limit greatest(1, ceil(v_limit::numeric / greatest(v_every, 2))::int)
       ) s)
  into v_organic, v_sponsored;

  if p_section in ('hot', 'nearby') then
    return public.interleave_sponsored(v_organic, v_sponsored, v_every, v_limit);
  end if;
  return coalesce((select jsonb_agg(value order by ord) from jsonb_array_elements(v_organic) with ordinality x(value, ord) where ord <= v_limit), '[]'::jsonb);
end;
$$;

-- ---------------------------------------------------------------------------
-- discover_feed: everything the home page needs in one round trip.
-- "nearby" widens 10 → 25 → 50 km until it finds something; nearby_radius_km says which was used.
-- ---------------------------------------------------------------------------
create or replace function public.discover_feed(
  p_lat double precision default null,
  p_lng double precision default null,
  p_country text default 'IL',
  p_locale text default 'he'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nearby jsonb := '[]'::jsonb;
  v_radius int;
begin
  if p_lat is not null and p_lng is not null then
    foreach v_radius in array array[10, 25, 50] loop
      v_nearby := public.popup_list('nearby', p_lat, p_lng, v_radius, '{}', 10, p_country, p_locale);
      exit when jsonb_array_length(v_nearby) > 0;
    end loop;
  end if;
  return jsonb_build_object(
    'hot', public.popup_list('hot', p_lat, p_lng, null, '{}', 10, p_country, p_locale),
    'nearby', v_nearby,
    'nearby_radius_km', case when jsonb_array_length(v_nearby) > 0 then v_radius end,
    'weekend', public.popup_list('weekend', p_lat, p_lng, null, '{}', 12, p_country, p_locale),
    'ending_soon', public.popup_list('ending_soon', p_lat, p_lng, null, '{}', 12, p_country, p_locale)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- popup_details: the full pop-up page. Ended pop-ups stay viewable (shared links shouldn't break);
-- pending/rejected ones only for their organizer and admins.
-- ---------------------------------------------------------------------------
create or replace function public.popup_details(p_slug text, p_locale text default 'he')
returns jsonb
language sql
stable
security definer
set search_path = public, extensions
as $$
  select jsonb_build_object(
    'id', p.id,
    'slug', p.slug,
    'title', p.title,
    'short_description', p.short_description,
    'description', p.description,
    'category', p.category,
    'country_code', p.country_code,
    'city_slug', c.slug,
    'city_name', case when p_locale = 'he' then c.name_he else c.name_en end,
    'address', p.address,
    'lat', extensions.st_y(p.location::extensions.geometry),
    'lng', extensions.st_x(p.location::extensions.geometry),
    'timezone', p.timezone,
    'starts_at', p.starts_at,
    'ends_at', p.ends_at,
    'price_range', p.price_range,
    'website_url', p.website_url,
    'instagram_url', p.instagram_url,
    'wheelchair_accessible', p.wheelchair_accessible,
    'parking_available', p.parking_available,
    'kid_friendly', p.kid_friendly,
    'accessibility_notes', p.accessibility_notes,
    'status', p.status,
    'organizer_name', o.name,
    'cover_image_url', (select i.url from public.popup_images i where i.popup_id = p.id order by i.sort_order, i.id limit 1),
    'images', coalesce((select jsonb_agg(jsonb_build_object('url', i.url, 'alt', i.alt) order by i.sort_order, i.id)
                        from public.popup_images i where i.popup_id = p.id), '[]'::jsonb),
    'hours', coalesce((select jsonb_agg(jsonb_build_object('weekday', h.weekday, 'opens', to_char(h.opens, 'HH24:MI'),
                                                           'closes', to_char(h.closes, 'HH24:MI')) order by h.weekday, h.opens)
                       from public.popup_hours h where h.popup_id = p.id), '[]'::jsonb)
  )
  from public.popups p
  join public.cities c on c.id = p.city_id
  left join public.organizers o on o.id = p.organizer_id
  where p.slug = p_slug
    and (p.status = 'approved' or public.can_edit_popup(p.id));
$$;

grant execute on function public.popup_list(text, double precision, double precision, double precision, jsonb, int, text, text) to anon, authenticated;
grant execute on function public.discover_feed(double precision, double precision, text, text) to anon, authenticated;
grant execute on function public.popup_details(text, text) to anon, authenticated;
grant execute on function public.maybe_refresh_hot_scores(interval) to anon, authenticated;
