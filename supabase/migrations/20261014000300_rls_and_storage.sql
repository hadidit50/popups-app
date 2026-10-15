-- Row Level Security
--   * Everyone (even logged out): read approved, not-yet-ended pop-ups + reference data.
--   * Organizers: create pop-ups (always pending), read/edit their own.
--   * Admins: everything.

alter table public.countries enable row level security;
alter table public.cities enable row level security;
alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.organizers enable row level security;
alter table public.popups enable row level security;
alter table public.popup_hours enable row level security;
alter table public.popup_images enable row level security;
alter table public.favorites enable row level security;
alter table public.popup_events enable row level security;
alter table public.promotions enable row level security;
alter table public.app_config enable row level security;

-- Explicit grants (RLS still decides which rows).
grant usage on schema public to anon, authenticated;
grant select on public.countries, public.cities, public.categories to anon, authenticated;
grant select on public.popups, public.popup_hours, public.popup_images, public.popup_cards to anon, authenticated;
grant insert, update, delete on public.popups, public.popup_hours, public.popup_images to authenticated;
grant select, insert, update, delete on public.profiles, public.organizers, public.favorites to authenticated;
grant select, insert, update, delete on public.promotions, public.app_config to authenticated;
grant select on public.popup_events to authenticated;
grant execute on function public.nearby_popups(double precision, double precision, double precision, jsonb, int, text) to anon, authenticated;
grant execute on function public.track_popup_event(uuid, public.popup_event_type, text, text, uuid) to anon, authenticated;
grant execute on function public.popup_stats(uuid, int) to authenticated;
grant execute on function public.popup_is_open_at(uuid, timestamptz) to anon, authenticated;
grant execute on function public.popup_is_open_today(uuid, timestamptz) to anon, authenticated;
grant execute on function public.popup_is_on_weekend(uuid, timestamptz) to anon, authenticated;
grant execute on function public.weekend_range(text, timestamptz) to anon, authenticated;

-- Reference data: public read, admin write.
create policy "countries are public" on public.countries for select using (true);
create policy "admins manage countries" on public.countries for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "cities are public" on public.cities for select using (true);
create policy "admins manage cities" on public.cities for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "categories are public" on public.categories for select using (true);
create policy "admins manage categories" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Profiles: you see and edit your own. Role changes are blocked by a trigger below.
create policy "read own profile" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy "update own profile" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$;
create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_profile_role();

-- Organizers: owner + admins.
create policy "read own organizer" on public.organizers for select to authenticated
  using (owner_id = auth.uid() or public.is_admin());
-- Anonymous sessions (used for saving without sign-up) cannot become organizers.
create policy "create own organizer" on public.organizers for insert to authenticated
  with check (owner_id = auth.uid() and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);
create policy "update own organizer" on public.organizers for update to authenticated
  using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
create policy "admins delete organizers" on public.organizers for delete to authenticated
  using (public.is_admin());

-- Pop-ups
create policy "public reads live approved popups" on public.popups for select
  using (status = 'approved' and ends_at > now());
create policy "organizers read own popups" on public.popups for select to authenticated
  using (organizer_id is not null and public.owns_organizer(organizer_id));
create policy "admins read all popups" on public.popups for select to authenticated
  using (public.is_admin());
create policy "organizers create popups" on public.popups for insert to authenticated
  with check (organizer_id is not null and public.owns_organizer(organizer_id));
create policy "admins create popups" on public.popups for insert to authenticated
  with check (public.is_admin());
create policy "organizers edit own popups" on public.popups for update to authenticated
  using (organizer_id is not null and public.owns_organizer(organizer_id))
  with check (organizer_id is not null and public.owns_organizer(organizer_id));
create policy "admins edit popups" on public.popups for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admins delete popups" on public.popups for delete to authenticated
  using (public.is_admin());

-- Child rows (hours, images) follow their pop-up.
create or replace function public.can_edit_popup(p_popup_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1 from public.popups p
    where p.id = p_popup_id and p.organizer_id is not null and public.owns_organizer(p.organizer_id)
  );
$$;

create policy "hours readable with popup" on public.popup_hours for select
  using (exists (select 1 from public.popups p where p.id = popup_id));
create policy "editors manage hours" on public.popup_hours for all to authenticated
  using (public.can_edit_popup(popup_id)) with check (public.can_edit_popup(popup_id));

create policy "images readable with popup" on public.popup_images for select
  using (exists (select 1 from public.popups p where p.id = popup_id));
create policy "editors manage images" on public.popup_images for all to authenticated
  using (public.can_edit_popup(popup_id)) with check (public.can_edit_popup(popup_id));

-- Favorites: strictly your own (anonymous sessions included).
create policy "own favorites" on public.favorites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Events: written only via track_popup_event(); readable by admins (organizers use popup_stats()).
create policy "admins read events" on public.popup_events for select to authenticated
  using (public.is_admin());

-- Promotions: admins manage; organizers can see promotions on their own pop-ups.
create policy "admins manage promotions" on public.promotions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "organizers read own promotions" on public.promotions for select to authenticated
  using (public.can_edit_popup(popup_id));

-- Config: admins only (feed functions read it with definer rights).
create policy "admins manage config" on public.app_config for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: public bucket for pop-up images.
-- Uploads go to "<user id>/<file>" so each uploader owns their folder.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('popup-images', 'popup-images', true, 8 * 1024 * 1024, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

create policy "popup images are public" on storage.objects for select
  using (bucket_id = 'popup-images');
create policy "upload into own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'popup-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "manage own uploads" on storage.objects for update to authenticated
  using (bucket_id = 'popup-images' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "delete own uploads" on storage.objects for delete to authenticated
  using (bucket_id = 'popup-images' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
