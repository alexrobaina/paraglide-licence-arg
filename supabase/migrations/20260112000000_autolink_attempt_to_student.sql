-- ============================================================================
-- Auto-link a submitted theory attempt to its alumno.
--
-- Pilots take the exam anonymously, so `attempts.student_id` was always null and
-- the exam never surfaced on the student's ficha until a manual backfill. Now,
-- at submit time, we resolve the alumno from the invitation's email (within the
-- inviting instructor's roster) and stamp it on the attempt. Falls back to null
-- when there is no matching student — the "Importar de invitaciones" backfill
-- still covers those later.
-- Idempotent.
-- ============================================================================

create or replace function submit_exam_attempt(
  p_token text, p_student_name text, p_score int, p_max_score int,
  p_passed boolean, p_answers jsonb
) returns text language plpgsql security definer set search_path = public as $$
declare v_inv invitations; v_student_id uuid;
begin
  select * into v_inv from invitations where token = p_token;
  if not found then raise exception 'invitation_not_found'; end if;
  if v_inv.status <> 'pending' then raise exception 'invitation_already_used'; end if;

  -- Which alumno does this invitation's email belong to? (This instructor's roster.)
  select s.id into v_student_id
  from students s
  where s.instructor_id = v_inv.instructor_id
    and lower(s.email) = lower(v_inv.student_email)
  limit 1;

  insert into attempts (invitation_id, student_id, student_name, template_id,
                        score, max_score, passed, answers, finished_at)
  values (v_inv.id, v_student_id, nullif(trim(p_student_name), ''), v_inv.template_id,
          p_score, p_max_score, p_passed, p_answers, now());

  update invitations set status = 'used', used_at = now() where id = v_inv.id;
  return 'ok';
end; $$;
grant execute on function submit_exam_attempt(text, text, int, int, boolean, jsonb)
  to anon, authenticated;

-- One-time: link the attempts that already have a matching student. Only touches
-- rows still unlinked, so it is safe to re-run.
update attempts a
set student_id = s.id
from invitations i
join students s on s.instructor_id = i.instructor_id
                and lower(s.email) = lower(i.student_email)
where a.invitation_id = i.id
  and a.student_id is null;
