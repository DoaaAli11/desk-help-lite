create table public.roles (id text primary key, name text not null unique);
create table public.teams (id text primary key, name text not null, description text not null default '', is_active boolean not null default true);
create table public.categories (id text primary key, name text not null, description text not null default '', is_active boolean not null default true);
create table public.priorities (id text primary key, name text not null, level int not null, description text not null default '', is_active boolean not null default true);
create table public.statuses (id text primary key, name text not null, sort_order int not null, description text not null default '', is_active boolean not null default true);

create table public.app_users (
  id text primary key,
  name text not null,
  email text not null unique,
  role_id text not null references public.roles(id),
  team_id text references public.teams(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key,
  app_user_id text not null references public.app_users(id),
  email text not null,
  created_at timestamptz not null default now()
);

create type public.app_role as enum ('employee','support','manager','operations','engineer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  unique (user_id, role)
);

create table public.tickets (
  id text primary key,
  ticket_number text not null unique,
  title text not null,
  description text not null,
  category_id text not null references public.categories(id),
  priority_id text not null references public.priorities(id),
  status_id text not null references public.statuses(id),
  created_by text not null references public.app_users(id),
  assigned_team_id text references public.teams(id),
  assigned_user_id text references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  closed_at timestamptz
);

create table public.ticket_status_history (
  id text primary key,
  ticket_id text not null references public.tickets(id) on delete cascade,
  old_status_id text references public.statuses(id),
  new_status_id text not null references public.statuses(id),
  changed_by text not null references public.app_users(id),
  created_at timestamptz not null default now()
);

create index on public.tickets (created_by);
create index on public.tickets (assigned_user_id);
create index on public.ticket_status_history (ticket_id);

create or replace function public.current_app_user_id()
returns text language sql stable security definer set search_path = public as $$
  select app_user_id from public.profiles where id = auth.uid()
$$;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('support','manager','operations','engineer')
  )
$$;

create or replace function public.ensure_profile()
returns text language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_user public.app_users;
  v_role public.app_role;
begin
  if auth.uid() is null or v_email = '' then
    return null;
  end if;
  select * into v_user from public.app_users where lower(email) = v_email;
  if v_user.id is null then
    return null;
  end if;
  insert into public.profiles (id, app_user_id, email)
  values (auth.uid(), v_user.id, v_email)
  on conflict (id) do update set app_user_id = excluded.app_user_id;

  v_role := case v_user.role_id
    when 'role-support' then 'support'
    when 'role-manager' then 'manager'
    when 'role-operations' then 'operations'
    when 'role-engineer' then 'engineer'
    else 'employee' end;
  insert into public.user_roles (user_id, role) values (auth.uid(), v_role)
  on conflict (user_id, role) do nothing;
  return v_user.id;
end;
$$;

grant select on public.roles, public.teams, public.categories, public.priorities, public.statuses, public.app_users to authenticated;
grant select on public.profiles, public.user_roles to authenticated;
grant select, insert, update on public.tickets to authenticated;
grant select, insert on public.ticket_status_history to authenticated;
grant all on public.roles, public.teams, public.categories, public.priorities, public.statuses, public.app_users, public.profiles, public.user_roles, public.tickets, public.ticket_status_history to service_role;
grant execute on function public.ensure_profile() to authenticated;

alter table public.roles enable row level security;
alter table public.teams enable row level security;
alter table public.categories enable row level security;
alter table public.priorities enable row level security;
alter table public.statuses enable row level security;
alter table public.app_users enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_status_history enable row level security;

create policy "roles readable" on public.roles for select to authenticated using (true);
create policy "teams readable" on public.teams for select to authenticated using (true);
create policy "categories readable" on public.categories for select to authenticated using (true);
create policy "priorities readable" on public.priorities for select to authenticated using (true);
create policy "statuses readable" on public.statuses for select to authenticated using (true);
create policy "directory readable" on public.app_users for select to authenticated using (true);

create policy "own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create policy "tickets visible to owner or staff" on public.tickets for select to authenticated
  using (created_by = public.current_app_user_id() or public.is_staff());
create policy "tickets created by self" on public.tickets for insert to authenticated
  with check (created_by = public.current_app_user_id());
create policy "tickets updated by staff" on public.tickets for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "history visible with ticket" on public.ticket_status_history for select to authenticated
  using (exists (select 1 from public.tickets t where t.id = ticket_id
    and (t.created_by = public.current_app_user_id() or public.is_staff())));
create policy "history insert" on public.ticket_status_history for insert to authenticated
  with check (changed_by = public.current_app_user_id());