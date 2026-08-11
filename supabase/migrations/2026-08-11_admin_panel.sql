-- Migration : ajoute un panneau admin réservé au propriétaire du site,
-- avec le nombre total d'utilisateurs inscrits.
--
-- À exécuter une fois dans : Project > SQL Editor > New query > Run.

create table public.app_admins (
  id uuid primary key references public.profiles(id) on delete cascade
);

alter table public.app_admins enable row level security;

create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (select 1 from public.app_admins where id = auth.uid());
$$;

create function public.admin_user_count()
returns bigint
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès refusé';
  end if;
  return (select count(*) from public.profiles);
end;
$$;

-- Désigne rimouxjonah5@gmail.com comme seul admin.
insert into public.app_admins (id)
  select id from auth.users where email = 'rimouxjonah5@gmail.com'
  on conflict (id) do nothing;
