-- Migration : sécurise la position GPS live des utilisateurs.
--
-- Avant cette migration, `profiles.lat/lng` était lisible par n'importe quel
-- utilisateur connecté (policy `using (true)`), y compris la position en
-- temps réel écrite par useLiveGeolocation — alors que l'app n'affiche cette
-- position que pour les amis suivis. On déplace lat/lng dans une table à
-- part avec des policies RLS qui restreignent la lecture au propriétaire et
-- à ses abonnés.
--
-- À exécuter une fois dans : Project > SQL Editor > New query > Run.

create table public.profile_locations (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  updated_at timestamptz not null default now()
);

alter table public.profile_locations enable row level security;

create policy "Voir sa position ou celle de ses amis suivis"
  on public.profile_locations for select
  to authenticated
  using (
    auth.uid() = profile_id
    or exists (
      select 1 from public.follows
      where follower_id = auth.uid() and following_id = profile_id
    )
  );

create policy "Chacun crée uniquement sa propre position"
  on public.profile_locations for insert
  to authenticated
  with check (auth.uid() = profile_id);

create policy "Chacun modifie uniquement sa propre position"
  on public.profile_locations for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

alter publication supabase_realtime add table public.profile_locations;

-- Reprend les positions existantes dans profiles vers la nouvelle table.
insert into public.profile_locations (profile_id, lat, lng)
  select id, lat, lng from public.profiles
  where lat is not null and lng is not null
  on conflict (profile_id) do nothing;

-- Retire les colonnes désormais exposées via profile_locations uniquement.
alter table public.profiles drop column lat;
alter table public.profiles drop column lng;
