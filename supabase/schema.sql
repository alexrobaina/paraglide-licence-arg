-- ============================================================================
-- Paraglide Exam — Roles, Invitations & Attempts schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Safe to run multiple times: it drops any previous version first.
-- ============================================================================

-- ---------- Clean slate (drops previous partial runs) ----------------------
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user() cascade;
drop function if exists is_instructor() cascade;
drop table if exists attempts cascade;
drop table if exists invitations cascade;
drop table if exists exam_templates cascade;
drop table if exists profiles cascade;
drop table if exists instructor_whitelist cascade;
drop type if exists user_role cascade;
drop type if exists invitation_status cascade;

-- ---------- Enums ----------------------------------------------------------
create type user_role as enum ('instructor', 'student');
create type invitation_status as enum ('pending', 'used', 'expired');

-- ---------- Instructor bootstrap whitelist ---------------------------------
-- Emails listed here become instructors automatically on first login.
create table instructor_whitelist (
  email text primary key
);
insert into instructor_whitelist (email) values ('alexrobainaph@gmail.com');

-- Lock the whitelist: only the service role (server actions) may read/write it.
-- RLS enabled with NO policies => denied to anon/authenticated keys.
alter table instructor_whitelist enable row level security;

-- ---------- profiles -------------------------------------------------------
create table profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text unique not null,
  full_name  text,
  role       user_role not null default 'student',
  created_at timestamptz not null default now()
);

-- Create a profile automatically when a new auth user signs up.
-- Role = 'instructor' if the email is whitelisted, else 'student'.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when exists (select 1 from instructor_whitelist w where w.email = new.email)
         then 'instructor'::user_role
         else 'student'::user_role
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- exam_templates -------------------------------------------------
create table exam_templates (
  id             uuid primary key default gen_random_uuid(),
  instructor_id  uuid not null references profiles (id) on delete cascade,
  title          text not null,
  description    text,
  question_uids  jsonb not null default '[]'::jsonb, -- array of Question.uid strings
  pass_mark      int  not null default 270,
  max_score      int  not null default 360,
  time_limit_min int,                                -- null = no limit
  created_at     timestamptz not null default now()
);

-- ---------- invitations ----------------------------------------------------
create table invitations (
  id            uuid primary key default gen_random_uuid(),
  token         text unique not null,               -- random, used in /exam/[token]
  template_id   uuid not null references exam_templates (id) on delete cascade,
  instructor_id uuid not null references profiles (id) on delete cascade,
  student_email text not null,
  status        invitation_status not null default 'pending',
  expires_at    timestamptz,
  used_at       timestamptz,
  created_at    timestamptz not null default now()
);
create index invitations_student_email_idx on invitations (student_email);

-- ---------- attempts -------------------------------------------------------
-- unique(invitation_id) enforces the ONE-ATTEMPT rule at the DB level.
create table attempts (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique references invitations (id) on delete cascade,
  student_id    uuid not null references profiles (id) on delete cascade,
  template_id   uuid not null references exam_templates (id) on delete cascade,
  score         int  not null,
  max_score     int  not null,
  passed        boolean not null,
  answers       jsonb not null default '{}'::jsonb, -- { questionUid: ["A","B"] }
  started_at    timestamptz,
  finished_at   timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security (defense-in-depth; sensitive writes use the service role)
-- ============================================================================
alter table profiles        enable row level security;
alter table exam_templates  enable row level security;
alter table invitations     enable row level security;
alter table attempts        enable row level security;

-- Helper: is the current user an instructor?
create or replace function is_instructor()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'instructor'
  );
$$;

-- profiles: read own; instructors read all
create policy profiles_select_own on profiles
  for select using (id = auth.uid() or is_instructor());

-- exam_templates: instructor manages own; a student may read a template they are invited to
create policy templates_instructor_all on exam_templates
  for all using (instructor_id = auth.uid()) with check (instructor_id = auth.uid());
create policy templates_student_read on exam_templates
  for select using (
    exists (
      select 1 from invitations i
      join profiles p on p.id = auth.uid()
      where i.template_id = exam_templates.id and i.student_email = p.email
    )
  );

-- invitations: instructor manages own; student reads invitations sent to their email
create policy invitations_instructor_all on invitations
  for all using (instructor_id = auth.uid()) with check (instructor_id = auth.uid());
create policy invitations_student_read on invitations
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.email = invitations.student_email)
  );

-- attempts: student reads own; instructor reads attempts on their templates
create policy attempts_student_read on attempts
  for select using (student_id = auth.uid());
create policy attempts_instructor_read on attempts
  for select using (
    exists (select 1 from exam_templates t where t.id = attempts.template_id and t.instructor_id = auth.uid())
  );

-- ============================================================================
-- claim_instructor(): lets a signed-in user self-provision their profile from
-- the /setup page WITHOUT the service-role key. SECURITY DEFINER = runs as owner
-- (bypasses RLS), but only grants 'instructor' if the email is truly whitelisted.
-- ============================================================================
create or replace function claim_instructor()
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_email text;
  v_role  user_role;
begin
  if v_uid is null then
    return 'not_authenticated';
  end if;

  select email into v_email from auth.users where id = v_uid;

  v_role := case
    when exists (select 1 from instructor_whitelist w where w.email = v_email)
    then 'instructor'::user_role
    else 'student'::user_role
  end;

  insert into profiles (id, email, role)
  values (v_uid, v_email, v_role)
  on conflict (id) do update set role = v_role, email = excluded.email;

  return v_role::text;
end;
$$;

grant execute on function claim_instructor() to authenticated;

-- ============================================================================
-- Student exam RPCs (SECURITY DEFINER — safe reads/writes without service key)
-- ============================================================================

-- Read an invitation + its template by token (works before login, so the exam
-- page can show context / prompt for the right email).
create or replace function get_exam_invitation(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_inv     invitations;
  v_tpl     exam_templates;
  v_attempt attempts;
begin
  select * into v_inv from invitations where token = p_token;
  if not found then
    return jsonb_build_object('found', false);
  end if;

  select * into v_tpl from exam_templates where id = v_inv.template_id;
  select * into v_attempt from attempts where invitation_id = v_inv.id;

  return jsonb_build_object(
    'found', true,
    'status', v_inv.status,
    'student_email', v_inv.student_email,
    'template_id', v_tpl.id,
    'template_title', v_tpl.title,
    'question_uids', v_tpl.question_uids,
    'pass_mark', v_tpl.pass_mark,
    'max_score', v_tpl.max_score,
    'time_limit_min', v_tpl.time_limit_min,
    'attempt', case when v_attempt.id is not null then jsonb_build_object(
        'score', v_attempt.score, 'max_score', v_attempt.max_score, 'passed', v_attempt.passed
      ) else null end
  );
end; $$;
grant execute on function get_exam_invitation(text) to anon, authenticated;

-- Submit a graded attempt. Enforces: logged in, email matches, still pending.
-- The unique(invitation_id) constraint on attempts enforces the one-attempt rule.
create or replace function submit_exam_attempt(
  p_token text, p_score int, p_max_score int, p_passed boolean, p_answers jsonb
) returns text language plpgsql security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_email text;
  v_inv   invitations;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select email into v_email from auth.users where id = v_uid;

  select * into v_inv from invitations where token = p_token;
  if not found then raise exception 'invitation_not_found'; end if;
  if v_inv.status <> 'pending' then raise exception 'invitation_already_used'; end if;
  if lower(v_inv.student_email) <> lower(v_email) then raise exception 'wrong_email'; end if;

  -- Make sure the student has a profile row (FK target).
  insert into profiles (id, email, role) values (v_uid, v_email, 'student')
  on conflict (id) do nothing;

  insert into attempts (invitation_id, student_id, template_id, score, max_score, passed, answers, finished_at)
  values (v_inv.id, v_uid, v_inv.template_id, p_score, p_max_score, p_passed, p_answers, now());

  update invitations set status = 'used', used_at = now() where id = v_inv.id;
  return 'ok';
end; $$;
grant execute on function submit_exam_attempt(text, int, int, boolean, jsonb) to authenticated;
