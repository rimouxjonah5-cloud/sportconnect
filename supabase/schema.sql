-- Sport Connect — schéma Supabase
-- À exécuter une fois dans : Project > SQL Editor > New query > Run

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  pseudo text not null,
  first_name text default '',
  last_name text default '',
  age integer,
  radius_km integer not null default 10,
  sports text[] not null default '{}',
  photo_url text,
  bio text default '',
  city text default '',
  lat double precision,
  lng double precision,
  onboarded boolean not null default false,
  certified boolean not null default false,
  profile_boost_until timestamptz,
  notifications_enabled boolean not null default true,
  sessions_count integer not null default 0,
  tournaments_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Les profils sont visibles par tous les utilisateurs connectés"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Chacun modifie uniquement son propre profil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Crée automatiquement un profil (non onboardé) à l'inscription
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, pseudo)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'pseudo', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============ SPORT EVENTS ============
create table public.sport_events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  host_pseudo text not null,
  title text not null,
  sport text not null,
  event_date date not null,
  event_time time not null,
  kind text not null default 'seance' check (kind in ('seance', 'match', 'tournoi', 'sortie')),
  status text not null default 'prevu' check (status in ('prevu', 'en_cours', 'urgent', 'termine')),
  location_name text default '',
  address text default '',
  description text default '',
  max_players integer,
  teams text default '',
  participants uuid[] not null default '{}',
  boosted boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.sport_events enable row level security;

create policy "Les évènements sont visibles par tous les utilisateurs connectés"
  on public.sport_events for select
  to authenticated
  using (true);

create policy "Créer un évènement en son propre nom"
  on public.sport_events for insert
  to authenticated
  with check (auth.uid() = host_id);

create policy "Modifier uniquement ses propres évènements"
  on public.sport_events for update
  to authenticated
  using (auth.uid() = host_id);

create policy "Supprimer uniquement ses propres évènements"
  on public.sport_events for delete
  to authenticated
  using (auth.uid() = host_id);

alter publication supabase_realtime add table public.sport_events;

-- Rejoindre un évènement (ajoute le participant + incrémente les compteurs de trophées)
create function public.join_event(target_event_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  ev record;
begin
  select * into ev from public.sport_events where id = target_event_id;
  if ev is null then
    raise exception 'Évènement introuvable';
  end if;
  if ev.max_players is not null and array_length(ev.participants, 1) >= ev.max_players then
    raise exception 'Évènement complet';
  end if;
  if not (auth.uid() = any(ev.participants)) then
    update public.sport_events
      set participants = array_append(participants, auth.uid())
      where id = target_event_id;
    update public.profiles
      set sessions_count = sessions_count + 1,
          tournaments_count = tournaments_count + case when ev.kind = 'tournoi' then 1 else 0 end
      where id = auth.uid();
  end if;
end;
$$;

-- ============ VENUES (complexes sportifs) ============
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  photo_url text,
  lat double precision not null,
  lng double precision not null,
  sports text[] not null default '{}',
  is_private boolean not null default false,
  is_open boolean not null default true,
  hours text default ''
);

alter table public.venues enable row level security;

create policy "Les complexes sont visibles par tous les utilisateurs connectés"
  on public.venues for select
  to authenticated
  using (true);

-- ============ VENUE REVIEWS ============
create table public.venue_reviews (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references public.venues(id) on delete cascade,
  venue_name text not null,
  rating integer not null check (rating between 1 and 5),
  pros text default '',
  cons text default '',
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_pseudo text not null,
  created_at timestamptz not null default now()
);

alter table public.venue_reviews enable row level security;

create policy "Les avis sont visibles par tous les utilisateurs connectés"
  on public.venue_reviews for select
  to authenticated
  using (true);

create policy "Publier un avis en son propre nom"
  on public.venue_reviews for insert
  to authenticated
  with check (auth.uid() = author_id);

-- ============ FOLLOWS (abonnements type TikTok) ============
create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

alter table public.follows enable row level security;

create policy "Les abonnements sont visibles par tous les utilisateurs connectés"
  on public.follows for select
  to authenticated
  using (true);

create policy "Chacun gère ses propres abonnements"
  on public.follows for all
  to authenticated
  using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);

-- ============ MESSAGES ============
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_key text not null,
  from_id uuid not null references public.profiles(id) on delete cascade,
  to_id uuid not null references public.profiles(id) on delete cascade,
  from_pseudo text not null,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Voir les messages envoyés ou reçus"
  on public.messages for select
  to authenticated
  using (auth.uid() = from_id or auth.uid() = to_id);

create policy "Envoyer un message en son propre nom"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = from_id);

alter publication supabase_realtime add table public.messages;

-- ============ PURCHASES (boutique) ============
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item text not null check (item in ('profile_boost', 'certification', 'event_boost')),
  price numeric not null,
  event_id uuid references public.sport_events(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.purchases enable row level security;

create policy "Chacun voit ses propres achats"
  on public.purchases for select
  to authenticated
  using (auth.uid() = user_id);

-- Achat boutique : enregistre l'achat et applique l'effet directement (paiement non connecté)
create function public.apply_purchase(target_item text, target_price numeric)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  target_event_id uuid;
begin
  if target_item = 'profile_boost' then
    update public.profiles set profile_boost_until = now() + interval '24 hours' where id = auth.uid();
  elsif target_item = 'certification' then
    update public.profiles set certified = true where id = auth.uid();
  elsif target_item = 'event_boost' then
    select id into target_event_id from public.sport_events
      where host_id = auth.uid() order by created_at desc limit 1;
    if target_event_id is not null then
      update public.sport_events set boosted = true where id = target_event_id;
    end if;
  else
    raise exception 'Article inconnu';
  end if;

  insert into public.purchases (user_id, item, price, event_id)
    values (auth.uid(), target_item, target_price, target_event_id);
end;
$$;

-- ============ STORAGE (photos de profil / avatars) ============
insert into storage.buckets (id, name, public)
  values ('photos', 'photos', true)
  on conflict (id) do nothing;

create policy "Les photos sont publiques en lecture"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "Chacun envoie ses propres photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos' and owner = auth.uid());

create policy "Chacun met à jour ses propres photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'photos' and owner = auth.uid());

-- ============ DONNÉES DE DÉMO ============

-- 4 complexes sportifs (Paris)
insert into public.venues (id, name, address, photo_url, lat, lng, sports, is_private, is_open, hours) values
  ('11111111-1111-1111-1111-111111111111', 'Stade Municipal Voltaire', '12 rue Voltaire, 75011 Paris',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600', 48.858, 2.380,
    array['football', 'athletisme'], false, true, '8h - 22h'),
  ('22222222-2222-2222-2222-222222222222', 'Complexe Sportif Bercy', '8 boulevard de Bercy, 75012 Paris',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600', 48.838, 2.382,
    array['basketball', 'volleyball'], false, true, '9h - 23h'),
  ('33333333-3333-3333-3333-333333333333', 'Tennis Club du Bois', '2 route de la Reine, 75016 Paris',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600', 48.856, 2.253,
    array['tennis', 'padel'], true, true, '7h - 21h'),
  ('44444444-4444-4444-4444-444444444444', 'Piscine et Salle de Sport Nation', '15 place de la Nation, 75011 Paris',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600', 48.848, 2.396,
    array['natation', 'musculation'], false, false, '6h - 20h');

-- 4 profils de démo (non liés à des comptes auth réels)
insert into public.profiles (id, pseudo, first_name, last_name, age, radius_km, sports, photo_url, bio, city, lat, lng, onboarded, certified, sessions_count, tournaments_count) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'LéaSprint', 'Léa', 'Martin', 26, 15,
    array['football', 'athletisme'], 'https://i.pravatar.cc/150?u=leasprint', 'Toujours partante pour un match !', 'Paris', 48.860, 2.370, true, true, 18, 2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'MaxHoops', 'Maxime', 'Dubois', 29, 20,
    array['basketball'], 'https://i.pravatar.cc/150?u=maxhoops', 'Basketteur du dimanche devenu accro.', 'Paris', 48.840, 2.385, true, false, 7, 0),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'SofiaSmash', 'Sofia', 'Nasri', 31, 10,
    array['tennis', 'padel'], 'https://i.pravatar.cc/150?u=sofiasmash', 'Tennis tous les week-ends, niveau intermédiaire.', 'Paris', 48.855, 2.260, true, true, 24, 5),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'TomFit', 'Thomas', 'Bernard', 24, 25,
    array['musculation', 'natation'], 'https://i.pravatar.cc/150?u=tomfit', 'Préparation physique et natation.', 'Paris', 48.850, 2.400, true, false, 3, 0);

-- 4 évènements de démo
insert into public.sport_events (id, host_id, host_pseudo, title, sport, event_date, event_time, kind, status, location_name, address, description, max_players, teams, participants, boosted) values
  ('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'LéaSprint',
    'Match amical 5v5', 'football', current_date, '18:30', 'match', 'en_cours',
    'Stade Municipal Voltaire', '12 rue Voltaire, 75011 Paris', 'On cherche 4 joueurs pour compléter les équipes.',
    10, '2 équipes de 5', array['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa']::uuid[], true),
  ('66666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'MaxHoops',
    'Session basket urgente', 'basketball', current_date, '20:00', 'seance', 'urgent',
    'Complexe Sportif Bercy', '8 boulevard de Bercy, 75012 Paris', 'Il manque 1 joueur pour le 3v3, ce soir !',
    6, '3v3', array['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb']::uuid[], false),
  ('77777777-7777-7777-7777-777777777777', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'SofiaSmash',
    'Tournoi de tennis printemps', 'tennis', current_date + interval '3 days', '09:00', 'tournoi', 'prevu',
    'Tennis Club du Bois', '2 route de la Reine, 75016 Paris', 'Tournoi amical simple messieurs/dames, niveau intermédiaire.',
    16, 'Élimination directe', array['cccccccc-cccc-cccc-cccc-cccccccccccc']::uuid[], false),
  ('88888888-8888-8888-8888-888888888888', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'TomFit',
    'Sortie natation détente', 'natation', current_date + interval '1 day', '12:00', 'sortie', 'prevu',
    'Piscine et Salle de Sport Nation', '15 place de la Nation, 75011 Paris', 'Quelques longueurs entre midi et deux, tous niveaux.',
    8, '', array['dddddddd-dddd-dddd-dddd-dddddddddddd']::uuid[], false);

-- 2 avis de démo
insert into public.venue_reviews (venue_id, venue_name, rating, pros, cons, author_id, author_pseudo) values
  ('11111111-1111-1111-1111-111111111111', 'Stade Municipal Voltaire', 5,
    'Terrain bien entretenu, vestiaires propres.', 'Un peu bruyant en soirée.',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'LéaSprint'),
  ('33333333-3333-3333-3333-333333333333', 'Tennis Club du Bois', 4,
    'Courts en terre battue excellents.', 'Réservation parfois compliquée le week-end.',
    'cccccccc-cccc-cccc-cccc-cccccccccccc', 'SofiaSmash');
