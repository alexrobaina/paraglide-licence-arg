-- ============================================================================
-- Alumnos + Examen práctico (planilla FAVL).
--
-- Until now a student was a loose `student_email` on an invitation. Nothing
-- could hang off a person. This migration introduces `students` as a first
-- class entity — deliberately NOT tied to auth.users, because pilots never log
-- in — and makes it the anchor for the theory attempt and the practical exam.
--
-- `attempts.student_id` used to point at `profiles` (a logged-in account) and
-- has been null for every anonymous attempt. It is renamed to
-- `student_profile_id` so `student_id` can mean what it says: the alumno.
--
-- The planilla itself is a declaración jurada. It is stored as a versioned
-- JSONB snapshot (see src/lib/practical/form.ts) and, once `final`, it is
-- immutable at the database level.
-- Idempotent: safe to re-apply.
-- ============================================================================

-- ---------- students -------------------------------------------------------
create table if not exists students (
  id            uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references profiles (id) on delete cascade,
  last_name     text not null,
  first_name    text not null default '',
  dni           text,
  email         text,
  club          text,
  phone         text,
  notes         text,
  created_at    timestamptz not null default now()
);

-- DNI and email identify a student *within an instructor's roster*: two
-- instructors may legitimately hold a record for the same pilot.
create unique index if not exists students_instructor_dni_idx
  on students (instructor_id, dni) where dni is not null;
create unique index if not exists students_instructor_email_idx
  on students (instructor_id, lower(email)) where email is not null;

-- ---------- attempts: free up `student_id` for the alumno ------------------
do $$ begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'attempts' and column_name = 'student_id')
     and not exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'attempts' and column_name = 'student_profile_id')
  then
    alter table attempts rename column student_id to student_profile_id;
  end if;
end $$;

alter table attempts add column if not exists student_id uuid references students (id) on delete set null;
create index if not exists attempts_student_idx on attempts (student_id);

drop policy if exists attempts_student_read on attempts;
create policy attempts_student_read on attempts
  for select using (student_profile_id = auth.uid());

-- Recreate the token-only submit so it no longer touches the renamed column.
create or replace function submit_exam_attempt(
  p_token text, p_student_name text, p_score int, p_max_score int,
  p_passed boolean, p_answers jsonb
) returns text language plpgsql security definer set search_path = public as $$
declare v_inv invitations;
begin
  select * into v_inv from invitations where token = p_token;
  if not found then raise exception 'invitation_not_found'; end if;
  if v_inv.status <> 'pending' then raise exception 'invitation_already_used'; end if;

  insert into attempts (invitation_id, student_name, template_id,
                        score, max_score, passed, answers, finished_at)
  values (v_inv.id, nullif(trim(p_student_name), ''), v_inv.template_id,
          p_score, p_max_score, p_passed, p_answers, now());

  update invitations set status = 'used', used_at = now() where id = v_inv.id;
  return 'ok';
end; $$;
grant execute on function submit_exam_attempt(text, text, int, int, boolean, jsonb)
  to anon, authenticated;

-- ---------- practical_exams ------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'practical_exam_status') then
    create type practical_exam_status as enum ('draft', 'final');
  end if;
end $$;

create table if not exists practical_exams (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references students (id) on delete cascade,
  created_by   uuid not null references profiles (id) on delete cascade,
  form_version int  not null default 1,
  status       practical_exam_status not null default 'draft',

  -- Datos para el examinador
  license_type     text not null,
  exam_date        date not null,
  place            text not null default '',
  club             text not null default '',
  instructor_name  text not null default '',
  examiner_name    text not null default '',
  previously_taken text,

  -- Condiciones climáticas
  wind_deg      int,
  cloud_base_ft int,
  precipitation boolean,
  temperature_c numeric(4,1),
  start_time    time,
  end_time      time,

  -- Pruebas: snapshot versionado (ver PRACTICAL_FORM_V1)
  sections jsonb not null default '{}'::jsonb,

  -- Resultado final: lo que dicen los ítems vs. lo que declara el examinador
  result_computed     boolean,
  result_declared     boolean,
  result_observations text not null default '',

  -- Declaración jurada
  sworn        boolean not null default false,
  finalized_at timestamptz,
  finalized_by uuid references profiles (id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint practical_exams_previously_taken_chk
    check (previously_taken is null or previously_taken in ('SI', 'NA')),
  constraint practical_exams_sections_is_object_chk
    check (jsonb_typeof(sections) = 'object'),
  constraint practical_exams_clock_chk
    check (start_time is null or end_time is null or end_time >= start_time),
  constraint practical_exams_final_is_sworn_chk
    check (status = 'draft' or (sworn and result_declared is not null and finalized_at is not null))
);

create index if not exists practical_exams_student_idx on practical_exams (student_id);
create index if not exists practical_exams_created_by_idx on practical_exams (created_by);

-- A closed planilla is a signed sworn statement: no edits, no deletes, ever.
create or replace function practical_exams_guard_final()
returns trigger language plpgsql set search_path = public as $$
begin
  if old.status = 'final' then raise exception 'practical_exam_is_final'; end if;
  if tg_op = 'DELETE' then return old; end if;
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists practical_exams_guard on practical_exams;
create trigger practical_exams_guard
  before update or delete on practical_exams
  for each row execute function practical_exams_guard_final();

-- ---------- Row Level Security ---------------------------------------------
alter table students        enable row level security;
alter table practical_exams enable row level security;

drop policy if exists students_owner_all on students;
create policy students_owner_all on students
  for all using (instructor_id = auth.uid() or is_admin())
  with check (instructor_id = auth.uid() or is_admin());

drop policy if exists practical_exams_owner_all on practical_exams;
create policy practical_exams_owner_all on practical_exams
  for all using (created_by = auth.uid() or is_admin())
  with check (created_by = auth.uid() or is_admin());

-- Instructors read the theory attempts of their own students.
drop policy if exists attempts_instructor_read_student on attempts;
create policy attempts_instructor_read_student on attempts
  for select using (
    exists (select 1 from students s where s.id = attempts.student_id and s.instructor_id = auth.uid())
  );

-- ---------- Analytics over the JSONB snapshot ------------------------------
-- Per-item pass rate across closed planillas. `security_invoker` keeps the
-- view honest: it sees exactly the rows its caller's RLS allows.
drop view if exists practical_item_stats;
create view practical_item_stats with (security_invoker = on) as
select
  e.form_version,
  s.key as section_key,
  i.key as item_code,
  count(*)                                        as evaluated,
  count(*) filter (where i.value = 'true'::jsonb) as approved,
  round(avg((i.value = 'true'::jsonb)::int::numeric), 3) as pass_rate
from practical_exams e
cross join lateral jsonb_each(e.sections)      as s
cross join lateral jsonb_each(s.value -> 'items') as i
where e.status = 'final'
  and i.value <> 'null'::jsonb
group by e.form_version, s.key, i.key;

-- ---------- Backfill: give existing theory attempts an alumno --------------
-- Creates one student per distinct email this instructor ever invited, using
-- the name the pilot typed at submit time. Best effort — the instructor edits
-- apellido / nombres / DNI afterwards. Safe to run repeatedly.
create or replace function backfill_students_from_invitations()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_created int := 0;
  v_linked  int := 0;
  r record;
  v_first text;
  v_last  text;
begin
  if not is_instructor() then raise exception 'not_authorized'; end if;

  for r in
    select distinct on (lower(i.student_email))
           lower(i.student_email) as email,
           nullif(trim(a.student_name), '') as student_name
    from invitations i
    left join attempts a on a.invitation_id = i.id
    where i.instructor_id = v_uid
    order by lower(i.student_email), a.finished_at desc nulls last
  loop
    if exists (select 1 from students s
               where s.instructor_id = v_uid and lower(s.email) = r.email) then
      continue;
    end if;

    if r.student_name is null then
      v_first := '';
      v_last  := split_part(r.email, '@', 1);
    elsif position(' ' in r.student_name) > 0 then
      v_first := split_part(r.student_name, ' ', 1);
      v_last  := trim(substr(r.student_name, position(' ' in r.student_name) + 1));
    else
      v_first := '';
      v_last  := r.student_name;
    end if;

    insert into students (instructor_id, first_name, last_name, email)
    values (v_uid, v_first, v_last, r.email);
    v_created := v_created + 1;
  end loop;

  update attempts a
  set student_id = s.id
  from invitations i
  join students s on s.instructor_id = i.instructor_id
                 and lower(s.email) = lower(i.student_email)
  where a.invitation_id = i.id
    and i.instructor_id = v_uid
    and a.student_id is null;
  get diagnostics v_linked = row_count;

  return jsonb_build_object('created', v_created, 'linked', v_linked);
end; $$;
grant execute on function backfill_students_from_invitations() to authenticated;
