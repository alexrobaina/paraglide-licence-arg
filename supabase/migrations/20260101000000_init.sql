-- ============================================================================
-- Paraglide Exam — baseline schema (idempotent).
-- Safe to apply to a fresh DB or an existing one: creates only what's missing,
-- never drops data. Applied automatically via `supabase db push`.
-- ============================================================================

-- ---------- Enums ----------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('instructor', 'student');
  end if;
  if not exists (select 1 from pg_type where typname = 'invitation_status') then
    create type invitation_status as enum ('pending', 'used', 'expired');
  end if;
end $$;

-- ---------- Instructor bootstrap whitelist ---------------------------------
create table if not exists instructor_whitelist (
  email text primary key
);
insert into instructor_whitelist (email) values ('alexrobainaph@gmail.com')
  on conflict (email) do nothing;
alter table instructor_whitelist enable row level security;

-- ---------- profiles -------------------------------------------------------
create table if not exists profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text unique not null,
  full_name  text,
  role       user_role not null default 'student',
  created_at timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, role)
  values (
    new.id, new.email,
    case when exists (select 1 from instructor_whitelist w where w.email = new.email)
         then 'instructor'::user_role else 'student'::user_role end
  );
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

-- ---------- exam_templates -------------------------------------------------
create table if not exists exam_templates (
  id             uuid primary key default gen_random_uuid(),
  instructor_id  uuid not null references profiles (id) on delete cascade,
  title          text not null,
  description    text,
  question_uids  jsonb not null default '[]'::jsonb,
  pass_mark      int  not null default 270,
  max_score      int  not null default 360,
  time_limit_min int,
  created_at     timestamptz not null default now()
);

-- ---------- invitations ----------------------------------------------------
create table if not exists invitations (
  id            uuid primary key default gen_random_uuid(),
  token         text unique not null,
  template_id   uuid not null references exam_templates (id) on delete cascade,
  instructor_id uuid not null references profiles (id) on delete cascade,
  student_email text not null,
  status        invitation_status not null default 'pending',
  expires_at    timestamptz,
  used_at       timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists invitations_student_email_idx on invitations (student_email);

-- ---------- attempts (unique(invitation_id) = one-attempt rule) -------------
create table if not exists attempts (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique references invitations (id) on delete cascade,
  student_id    uuid not null references profiles (id) on delete cascade,
  template_id   uuid not null references exam_templates (id) on delete cascade,
  score         int  not null,
  max_score     int  not null,
  passed        boolean not null,
  answers       jsonb not null default '{}'::jsonb,
  started_at    timestamptz,
  finished_at   timestamptz not null default now()
);

-- ---------- Row Level Security ---------------------------------------------
alter table profiles       enable row level security;
alter table exam_templates enable row level security;
alter table invitations    enable row level security;
alter table attempts       enable row level security;

create or replace function is_instructor()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'instructor');
$$;

drop policy if exists profiles_select_own on profiles;
create policy profiles_select_own on profiles
  for select using (id = auth.uid() or is_instructor());

drop policy if exists templates_instructor_all on exam_templates;
create policy templates_instructor_all on exam_templates
  for all using (instructor_id = auth.uid()) with check (instructor_id = auth.uid());
drop policy if exists templates_student_read on exam_templates;
create policy templates_student_read on exam_templates
  for select using (
    exists (select 1 from invitations i join profiles p on p.id = auth.uid()
            where i.template_id = exam_templates.id and i.student_email = p.email)
  );

drop policy if exists invitations_instructor_all on invitations;
create policy invitations_instructor_all on invitations
  for all using (instructor_id = auth.uid()) with check (instructor_id = auth.uid());
drop policy if exists invitations_student_read on invitations;
create policy invitations_student_read on invitations
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.email = invitations.student_email)
  );

drop policy if exists attempts_student_read on attempts;
create policy attempts_student_read on attempts
  for select using (student_id = auth.uid());
drop policy if exists attempts_instructor_read on attempts;
create policy attempts_instructor_read on attempts
  for select using (
    exists (select 1 from exam_templates t where t.id = attempts.template_id and t.instructor_id = auth.uid())
  );

-- ---------- RPCs (SECURITY DEFINER — no service-role key needed) -----------
create or replace function claim_instructor()
returns text language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_email text; v_role user_role;
begin
  if v_uid is null then return 'not_authenticated'; end if;
  select email into v_email from auth.users where id = v_uid;
  v_role := case when exists (select 1 from instructor_whitelist w where w.email = v_email)
                 then 'instructor'::user_role else 'student'::user_role end;
  insert into profiles (id, email, role) values (v_uid, v_email, v_role)
  on conflict (id) do update set role = v_role, email = excluded.email;
  return v_role::text;
end; $$;
grant execute on function claim_instructor() to authenticated;

create or replace function get_exam_invitation(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_inv invitations; v_tpl exam_templates; v_attempt attempts;
begin
  select * into v_inv from invitations where token = p_token;
  if not found then return jsonb_build_object('found', false); end if;
  select * into v_tpl from exam_templates where id = v_inv.template_id;
  select * into v_attempt from attempts where invitation_id = v_inv.id;
  return jsonb_build_object(
    'found', true, 'status', v_inv.status, 'student_email', v_inv.student_email,
    'template_id', v_tpl.id, 'template_title', v_tpl.title,
    'question_uids', v_tpl.question_uids, 'pass_mark', v_tpl.pass_mark,
    'max_score', v_tpl.max_score, 'time_limit_min', v_tpl.time_limit_min,
    'attempt', case when v_attempt.id is not null then jsonb_build_object(
        'score', v_attempt.score, 'max_score', v_attempt.max_score, 'passed', v_attempt.passed
      ) else null end);
end; $$;
grant execute on function get_exam_invitation(text) to anon, authenticated;

create or replace function submit_exam_attempt(
  p_token text, p_score int, p_max_score int, p_passed boolean, p_answers jsonb
) returns text language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_email text; v_inv invitations;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select email into v_email from auth.users where id = v_uid;
  select * into v_inv from invitations where token = p_token;
  if not found then raise exception 'invitation_not_found'; end if;
  if v_inv.status <> 'pending' then raise exception 'invitation_already_used'; end if;
  if lower(v_inv.student_email) <> lower(v_email) then raise exception 'wrong_email'; end if;
  insert into profiles (id, email, role) values (v_uid, v_email, 'student') on conflict (id) do nothing;
  insert into attempts (invitation_id, student_id, template_id, score, max_score, passed, answers, finished_at)
  values (v_inv.id, v_uid, v_inv.template_id, p_score, p_max_score, p_passed, p_answers, now());
  update invitations set status = 'used', used_at = now() where id = v_inv.id;
  return 'ok';
end; $$;
grant execute on function submit_exam_attempt(text, int, int, boolean, jsonb) to authenticated;

create or replace function list_instructors()
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not is_instructor() then raise exception 'not_authorized'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'email', w.email, 'signed_up', p.id is not null, 'full_name', p.full_name
    ) order by w.email)
    from instructor_whitelist w
    left join profiles p on lower(p.email) = lower(w.email)
  ), '[]'::jsonb);
end; $$;
grant execute on function list_instructors() to authenticated;

create or replace function add_instructor(p_email text)
returns text language plpgsql security definer set search_path = public as $$
declare v_email text := lower(trim(p_email));
begin
  if not is_instructor() then raise exception 'not_authorized'; end if;
  if v_email = '' or position('@' in v_email) = 0 then raise exception 'invalid_email'; end if;
  insert into instructor_whitelist (email) values (v_email) on conflict (email) do nothing;
  update profiles set role = 'instructor' where lower(email) = v_email;
  return 'ok';
end; $$;
grant execute on function add_instructor(text) to authenticated;

create or replace function remove_instructor(p_email text)
returns text language plpgsql security definer set search_path = public as $$
declare v_email text := lower(trim(p_email)); v_me text;
begin
  if not is_instructor() then raise exception 'not_authorized'; end if;
  select lower(email) into v_me from profiles where id = auth.uid();
  if v_email = v_me then raise exception 'cannot_remove_self'; end if;
  delete from instructor_whitelist where lower(email) = v_email;
  update profiles set role = 'student' where lower(email) = v_email;
  return 'ok';
end; $$;
grant execute on function remove_instructor(text) to authenticated;
