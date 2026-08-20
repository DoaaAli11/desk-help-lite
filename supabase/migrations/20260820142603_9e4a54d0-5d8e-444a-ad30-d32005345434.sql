create or replace function public.ensure_profile()
returns text language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_name text := coalesce(nullif(trim(auth.jwt() -> 'user_metadata' ->> 'full_name'), ''), split_part(v_email, '@', 1));
  v_user public.app_users;
  v_role public.app_role;
begin
  if auth.uid() is null or v_email = '' then
    return null;
  end if;

  select * into v_user from public.app_users where lower(email) = v_email;

  if v_user.id is null then
    insert into public.app_users (id, name, email, role_id, team_id)
    values ('usr-' || replace(gen_random_uuid()::text, '-', ''), v_name, v_email, 'role-employee', null)
    returning * into v_user;
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