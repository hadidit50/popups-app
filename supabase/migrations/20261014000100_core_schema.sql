-- WHATS POPPIN — core schema
-- Countries/cities from day one so expansion beyond Israel is data, not code.

create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('user', 'organizer', 'admin');
create type public.popup_status as enum ('pending', 'approved', 'rejected');
create type public.popup_source as enum ('manual', 'organizer');
create type public.price_range as enum ('free', 'low', 'medium', 'high');
create type public.popup_event_type as enum ('view', 'save', 'unsave', 'navigate', 'share', 'impression', 'click');
create type public.promotion_placement as enum ('hot_now', 'nearby_top', 'map_highlight');
create type public.promotion_status as enum ('draft', 'active', 'paused', 'ended');
create type public.payment_status as enum ('not_required', 'pending', 'paid', 'refunded', 'failed');
create type public.organizer_plan as enum ('free', 'pro');

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Geography
-- ---------------------------------------------------------------------------
create table public.countries (
  code text primary key check (code ~ '^[A-Z]{2}$'),
  name_he text not null,
  name_en text not null,
  timezone text not null,
  currency text not null,
  default_locale text not null default 'he',
  is_active boolean not null default true
);

create table public.cities (
  id bigint generated always as identity primary key,
  slug text not null unique,
  country_code text not null references public.countries (code),
  name_he text not null,
  name_en text not null,
  center extensions.geography(point, 4326) not null,
  -- Null = use the country's timezone.
  timezone text,
  is_launch_city boolean not null default false,
  sort_order int not null default 100
);
create index cities_country_idx on public.cities (country_code);

-- ---------------------------------------------------------------------------
-- Categories (names live in the app's i18n files under categories.<slug>)
-- ---------------------------------------------------------------------------
create table public.categories (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  icon text not null,
  sort_order int not null default 100,
  is_active boolean not null default true
);

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'user',
  display_name text,
  locale text not null default 'he',
  home_city_id bigint references public.cities (id) on delete set null,
  favorite_categories text[] not null default '{}',
  notify_saved_ending boolean not null default true,
  notify_new_nearby boolean not null default false,
  expo_push_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Every auth user (including anonymous ones) gets a profile row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create table public.organizers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  description text,
  contact_email text,
  contact_phone text,
  website_url text,
  instagram_url text,
  country_code text not null default 'IL' references public.countries (code),
  -- Ready for a paid tier (advanced analytics, area push). Billing hooks go on this row.
  plan public.organizer_plan not null default 'free',
  plan_expires_at timestamptz,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index organizers_owner_idx on public.organizers (owner_id);
create trigger organizers_updated_at before update on public.organizers
  for each row execute function public.set_updated_at();

create or replace function public.owns_organizer(p_organizer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.organizers where id = p_organizer_id and owner_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Pop-ups
-- ---------------------------------------------------------------------------
create table public.popups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null check (char_length(title) between 2 and 80),
  -- One line shown on cards.
  short_description text check (char_length(short_description) <= 140),
  description text,
  category text not null references public.categories (slug),
  organizer_id uuid references public.organizers (id) on delete set null,

  country_code text not null references public.countries (code),
  city_id bigint not null references public.cities (id),
  address text not null,
  location extensions.geography(point, 4326) not null,
  timezone text not null default 'Asia/Jerusalem',

  starts_at timestamptz not null,
  ends_at timestamptz not null,
  price_range public.price_range not null default 'free',

  wheelchair_accessible boolean,
  parking_available boolean,
  kid_friendly boolean,
  accessibility_notes text,

  website_url text,
  instagram_url text,
  -- Language the content was written in (UI strings are translated separately).
  content_locale text not null default 'he',

  status public.popup_status not null default 'pending',
  -- True when an organizer edited an approved pop-up; shows up in the admin review queue.
  needs_review boolean not null default false,
  rejection_reason text,
  source public.popup_source not null default 'organizer',
  created_by uuid references auth.users (id) on delete set null,
  approved_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint popups_dates_valid check (ends_at > starts_at)
);
create index popups_location_idx on public.popups using gist (location);
create index popups_live_idx on public.popups (status, ends_at);
create index popups_category_idx on public.popups (category);
create index popups_city_idx on public.popups (city_id);
create index popups_organizer_idx on public.popups (organizer_id);
create trigger popups_updated_at before update on public.popups
  for each row execute function public.set_updated_at();

-- Non-admins can never approve their own pop-up or change moderation fields.
create or replace function public.guard_popup_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or auth.uid() is null then
    -- Admins, and server-side code (service role / migrations), may set anything.
    if new.status = 'approved' and (tg_op = 'INSERT' or old.status is distinct from 'approved') then
      new.approved_at := coalesce(new.approved_at, now());
      new.approved_by := coalesce(new.approved_by, auth.uid());
      new.needs_review := false;
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.source := 'organizer';
    new.created_by := auth.uid();
    new.approved_at := null;
    new.approved_by := null;
    new.needs_review := false;
  else
    new.status := old.status;
    new.source := old.source;
    new.created_by := old.created_by;
    new.approved_at := old.approved_at;
    new.approved_by := old.approved_by;
    new.rejection_reason := old.rejection_reason;
    new.needs_review := old.status = 'approved' or old.needs_review;
  end if;
  return new;
end;
$$;
create trigger popups_guard_moderation before insert or update on public.popups
  for each row execute function public.guard_popup_moderation();

create table public.popup_hours (
  id bigint generated always as identity primary key,
  popup_id uuid not null references public.popups (id) on delete cascade,
  -- 0 = Sunday ... 6 = Saturday
  weekday smallint not null check (weekday between 0 and 6),
  opens time not null,
  -- closes <= opens means it closes after midnight (e.g. 20:00–02:00).
  closes time not null,
  unique (popup_id, weekday, opens)
);
create index popup_hours_popup_idx on public.popup_hours (popup_id);

create table public.popup_images (
  id bigint generated always as identity primary key,
  popup_id uuid not null references public.popups (id) on delete cascade,
  url text not null,
  -- Set when the image lives in our Storage bucket (so it can be deleted with the pop-up).
  storage_path text,
  alt text,
  sort_order int not null default 0
);
create index popup_images_popup_idx on public.popup_images (popup_id, sort_order);

-- ---------------------------------------------------------------------------
-- Engagement
-- ---------------------------------------------------------------------------
create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  popup_id uuid not null references public.popups (id) on delete cascade,
  remind_before_end boolean not null default true,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, popup_id)
);
create index favorites_popup_idx on public.favorites (popup_id);

-- Analytics + input for the "Hot now" score. Written only through track_popup_event().
create table public.popup_events (
  id bigint generated always as identity primary key,
  popup_id uuid not null references public.popups (id) on delete cascade,
  event_type public.popup_event_type not null,
  user_id uuid references auth.users (id) on delete set null,
  -- Random id per app install, so we can de-duplicate without requiring login.
  session_id text,
  -- Where it happened: 'hot_now', 'nearby', 'weekend', 'ending_soon', 'map', 'search', 'details', ...
  surface text,
  promotion_id uuid,
  created_at timestamptz not null default now()
);
create index popup_events_popup_time_idx on public.popup_events (popup_id, created_at desc);
create index popup_events_time_idx on public.popup_events (created_at desc);

-- ---------------------------------------------------------------------------
-- Promotions (sponsored placement). Payment integration plugs into payment_* columns.
-- ---------------------------------------------------------------------------
create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  popup_id uuid not null references public.popups (id) on delete cascade,
  placement public.promotion_placement not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  budget_amount numeric(10, 2) not null default 0,
  currency text not null default 'ILS',
  impressions int not null default 0,
  clicks int not null default 0,
  status public.promotion_status not null default 'draft',
  payment_status public.payment_status not null default 'not_required',
  payment_provider text,
  payment_reference text,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotions_dates_valid check (ends_at > starts_at)
);
create index promotions_active_idx on public.promotions (placement, status, starts_at, ends_at);
create index promotions_popup_idx on public.promotions (popup_id);
create trigger promotions_updated_at before update on public.promotions
  for each row execute function public.set_updated_at();

alter table public.popup_events
  add constraint popup_events_promotion_fk foreign key (promotion_id) references public.promotions (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Configurable knobs (hot score weights, sponsored frequency, ...)
-- ---------------------------------------------------------------------------
create table public.app_config (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);
create trigger app_config_updated_at before update on public.app_config
  for each row execute function public.set_updated_at();

insert into public.app_config (key, value, description) values
  ('hot_score_weights',
   '{"view": 1, "save": 4, "navigate": 6, "share": 3, "ending_soon_boost": 15, "new_boost": 10, "window_hours": 24}',
   'Weights for the Hot now score (events in the last window_hours, plus boosts).'),
  ('sponsored_every_n',
   '5',
   'At most one sponsored item per this many items in any list.');
