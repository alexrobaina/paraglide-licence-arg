-- ============================================================================
-- Pilots take the exam anonymously via the invitation token (no login).
-- The unique token is the credential; the one-attempt rule still holds.
-- ============================================================================

-- Attempts no longer require a logged-in student; capture the pilot's name.
alter table attempts alter column student_id drop not null;
alter table attempts add column if not exists student_name text;

-- Replace the old (auth-required) submit with a token-only version.
drop function if exists submit_exam_attempt(text, int, int, boolean, jsonb);

create or replace function submit_exam_attempt(
  p_token text, p_student_name text, p_score int, p_max_score int,
  p_passed boolean, p_answers jsonb
) returns text language plpgsql security definer set search_path = public as $$
declare v_inv invitations;
begin
  select * into v_inv from invitations where token = p_token;
  if not found then raise exception 'invitation_not_found'; end if;
  if v_inv.status <> 'pending' then raise exception 'invitation_already_used'; end if;

  insert into attempts (invitation_id, student_id, student_name, template_id,
                        score, max_score, passed, answers, finished_at)
  values (v_inv.id, null, nullif(trim(p_student_name), ''), v_inv.template_id,
          p_score, p_max_score, p_passed, p_answers, now());

  update invitations set status = 'used', used_at = now() where id = v_inv.id;
  return 'ok';
end; $$;
grant execute on function submit_exam_attempt(text, text, int, int, boolean, jsonb)
  to anon, authenticated;
