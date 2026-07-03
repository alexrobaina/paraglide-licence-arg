-- ============================================================================
-- Admin user management (super-admin only) — no service-role key needed.
-- SECURITY DEFINER functions owned by postgres can touch auth.users safely.
-- ============================================================================
create extension if not exists pgcrypto;

-- Who is an app admin (super-admin). Seeded with the owner.
create table if not exists app_admins (email text primary key);
insert into app_admins (email) values ('alexrobainaph@gmail.com')
  on conflict (email) do nothing;
alter table app_admins enable row level security;

create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from app_admins a
    join auth.users u on lower(u.email) = lower(a.email)
    where u.id = auth.uid()
  );
$$;
grant execute on function is_admin() to authenticated;

-- List every user with role + password status + data counts.
create or replace function admin_list_users()
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'not_authorized'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'email', u.email,
      'role', coalesce(p.role::text, 'sin perfil'),
      'has_password', (u.encrypted_password is not null and u.encrypted_password <> ''),
      'is_admin', exists (select 1 from app_admins a where lower(a.email) = lower(u.email)),
      'exams_created', (select count(*) from exam_templates t where t.instructor_id = u.id),
      'last_sign_in_at', u.last_sign_in_at,
      'created_at', u.created_at
    ) order by u.created_at)
    from auth.users u
    left join profiles p on p.id = u.id
  ), '[]'::jsonb);
end; $$;
grant execute on function admin_list_users() to authenticated;

-- Set (reset) any user's password.
create or replace function admin_set_password(p_email text, p_password text)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'not_authorized'; end if;
  if length(p_password) < 6 then raise exception 'password_too_short'; end if;
  update auth.users
  set encrypted_password = crypt(p_password, gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now())
  where lower(email) = lower(trim(p_email));
  if not found then raise exception 'user_not_found'; end if;
  return 'ok';
end; $$;
grant execute on function admin_set_password(text, text) to authenticated;

-- Delete a user (cascades to their profile + created data). Not yourself.
create or replace function admin_delete_user(p_email text)
returns text language plpgsql security definer set search_path = public as $$
declare v_me text;
begin
  if not is_admin() then raise exception 'not_authorized'; end if;
  select lower(email) into v_me from auth.users where id = auth.uid();
  if lower(trim(p_email)) = v_me then raise exception 'cannot_delete_self'; end if;
  delete from auth.users where lower(email) = lower(trim(p_email));
  if not found then raise exception 'user_not_found'; end if;
  return 'ok';
end; $$;
grant execute on function admin_delete_user(text) to authenticated;
