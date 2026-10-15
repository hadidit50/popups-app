-- Feed, hot score and sponsored placement checks (runs on the seeded data).

create function pg_temp.as_anon() returns void language sql as $$
  select set_config('request.jwt.claims', '{"role":"anon"}', false);
  set role anon;
$$;

select pg_temp.as_anon();

do $$
declare
  v jsonb;
  v_hot jsonb;
  v_item jsonb;
  v_idx int := 0;
  v_last_sponsored int := -100;
  v_prev double precision := -1;
begin
  -- Shape of a card
  v := public.popup_list('all', 32.0853, 34.7818, null, '{}', 5);
  assert jsonb_array_length(v) = 5, 'limit respected';
  assert v -> 0 ?& array['id','slug','title','category','city_name','lat','lng','timezone','starts_at','ends_at',
                          'price_range','cover_image_url','hours','distance_km','is_sponsored'],
    'card has all PopupSummary fields: ' || (v -> 0)::text;
  assert (v -> 0 ->> 'city_name') is not null, 'city name present';

  -- "all" with a location is sorted by distance
  for v_item in select value from jsonb_array_elements(public.popup_list('all', 32.0853, 34.7818, null, '{}', 30)) loop
    assert (v_item ->> 'distance_km')::float >= v_prev, 'all: sorted by distance';
    v_prev := (v_item ->> 'distance_km')::float;
  end loop;

  -- Hot: sponsored first, never two sponsored within 5 items, no duplicates
  v_hot := public.popup_list('hot', null, null, null, '{}', 10);
  assert jsonb_array_length(v_hot) = 10, 'hot has 10 items, got ' || jsonb_array_length(v_hot);
  assert (v_hot -> 0 ->> 'is_sponsored')::boolean, 'hot starts with a sponsored item';
  assert (v_hot -> 0 ->> 'promotion_id') is not null, 'sponsored item carries its promotion id';
  for v_item in select value from jsonb_array_elements(v_hot) loop
    if (v_item ->> 'is_sponsored')::boolean then
      assert v_idx - v_last_sponsored >= 5, 'at most one sponsored per 5 items';
      v_last_sponsored := v_idx;
    end if;
    v_idx := v_idx + 1;
  end loop;
  assert (select count(distinct value ->> 'id') from jsonb_array_elements(v_hot)) = 10, 'no duplicates in hot';
  -- The most active organic pop-up ranks high
  assert exists (select 1 from jsonb_array_elements(v_hot) where value ->> 'slug' = 'florentin-food-market'), 'busiest pop-up is hot';

  -- Nearby needs a location; within radius; sponsored "nearby_top" first when it's close
  assert public.popup_list('nearby', null, null, 10, '{}', 10) = '[]'::jsonb, 'nearby without location is empty';
  v := public.popup_list('nearby', 32.0754, 34.7752, 2, '{}', 10);
  assert v -> 0 ->> 'slug' = 'sneaker-drop-dizengoff' and (v -> 0 ->> 'is_sponsored')::boolean, 'nearby_top promotion on top';
  assert not exists (select 1 from jsonb_array_elements(v) where (value ->> 'distance_km')::float > 2), 'nearby within radius';
  -- Patisserie promotion has no nearby_top placement, so it is never sponsored in Jerusalem nearby
  assert not exists (select 1 from jsonb_array_elements(public.popup_list('nearby', 31.7608, 35.2195, 5, '{}', 10))
                     where (value ->> 'is_sponsored')::boolean), 'no sponsored without a nearby_top promotion';

  -- Sections
  assert not exists (select 1 from jsonb_array_elements(public.popup_list('ending_soon', null, null, null, '{}', 20))
                     where (value ->> 'ends_at')::timestamptz > now() + interval '72 hours'), 'ending soon = within 72h';
  assert exists (select 1 from jsonb_array_elements(public.popup_list('ending_soon', null, null, null, '{}', 20))
                 where value ->> 'slug' = 'port-designers-fair'), 'pop-up ending tomorrow is ending soon';
  assert jsonb_array_length(public.popup_list('weekend', null, null, null, '{}', 50)) > 0, 'weekend has items';

  -- Filters
  assert not exists (select 1 from jsonb_array_elements(public.popup_list('all', null, null, null, '{"category":"food"}', 50))
                     where value ->> 'category' <> 'food'), 'category filter';
  assert not exists (select 1 from jsonb_array_elements(public.popup_list('all', null, null, null, '{"free_only":true}', 50))
                     where value ->> 'price_range' <> 'free'), 'free filter';
  assert exists (select 1 from jsonb_array_elements(public.popup_list('all', null, null, null, '{"query":"קונדיטוריה"}', 50))
                 where value ->> 'slug' = 'emek-refaim-patisserie'), 'text search';
  assert exists (select 1 from jsonb_array_elements(public.popup_list('all', null, null, null, '{"query":"חיפה"}', 50))
                 where value ->> 'city_slug' = 'haifa'), 'search by city name';
  assert (select count(*) from jsonb_array_elements(public.popup_list('all', null, null, null, '{"query":"zzz","categories":["kids"]}', 50))) =
         (select count(*) from public.popups where category = 'kids' and status = 'approved' and ends_at > now()), 'search by category';
  assert jsonb_array_length(public.popup_list('all', null, null, null,
           jsonb_build_object('ids', (select jsonb_agg(id) from public.popups where slug in ('eilat-beach-cinema', 'pending-candle-workshop'))), 50)) = 1,
         'ids filter returns only live, approved pop-ups';

  -- Map marks map_highlight promotions without reordering
  assert exists (select 1 from jsonb_array_elements(public.popup_list('map', 31.7683, 35.2137, 25, '{}', 300))
                 where value ->> 'slug' = 'emek-refaim-patisserie' and (value ->> 'is_sponsored')::boolean), 'map highlight';

  -- Discover feed bundles everything
  v := public.discover_feed(32.0853, 34.7818);
  assert v ?& array['hot', 'nearby', 'weekend', 'ending_soon', 'nearby_radius_km'], 'discover keys';
  assert (v ->> 'nearby_radius_km')::int = 10, 'Tel Aviv finds pop-ups within 10 km';
  v := public.discover_feed(30.6, 34.8); -- Mitzpe Ramon: nothing within 50 km
  assert v -> 'nearby' = '[]'::jsonb and v -> 'nearby_radius_km' = 'null'::jsonb, 'empty nearby far from everything';

  -- Details
  v := public.popup_details('emek-refaim-patisserie');
  assert v ->> 'title' = 'קונדיטוריה בפופ-אפ – עמק רפאים', 'details title';
  assert jsonb_array_length(v -> 'hours') = 6, 'details hours';
  assert public.popup_details('pending-candle-workshop') is null, 'pending pop-up is not public';
end $$;

reset role;
select set_config('request.jwt.claims', '', false);

-- Weights are configurable: make views worthless and saves huge → ranking follows saves.
update public.app_config set value = '{"view":0,"save":100,"navigate":0,"share":0,"ending_soon_boost":0,"new_boost":0,"window_hours":24}'
where key = 'hot_score_weights';
select public.maybe_refresh_hot_scores(interval '0 minutes');
do $$
declare v jsonb := public.popup_list('hot', null, null, null, '{}', 10);
begin
  assert (select value ->> 'slug' from jsonb_array_elements(v) where not (value ->> 'is_sponsored')::boolean limit 1) = 'port-designers-fair',
    'most-saved pop-up ranks first organically with save-heavy weights';
end $$;
