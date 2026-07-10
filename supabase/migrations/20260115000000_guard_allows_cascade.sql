-- ============================================================================
-- Fix: the immutability guard on practical_exams was blocking legitimate
-- FK-driven cleanup. `practical_exams_guard_final` raised on ANY update/delete
-- of a 'final' row, so:
--   • deleting a theory attempt (attempt_id → SET NULL fires an UPDATE) failed,
--   • deleting a student / user (→ CASCADE fires a DELETE) failed with a cryptic
--     `practical_exam_is_final`.
--
-- New behaviour:
--   • DELETE is allowed at the DB level (cascade purge must work). Direct deletion
--     of a signed planilla from the app is still prevented by assertDraft().
--   • UPDATE of a 'final' row is allowed ONLY when the sole change is attempt_id
--     (the theory back-reference lost on attempt deletion). Any other edit to a
--     sworn planilla is still rejected — the declaración jurada stays immutable.
-- Idempotent (create or replace).
-- ============================================================================

create or replace function practical_exams_guard_final()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    -- Cascade cleanup (student/instructor purge) must be able to remove the row.
    return old;
  end if;

  if old.status = 'final' then
    -- Tolerate only losing the theory back-reference (attempt_id → NULL);
    -- ignore updated_at churn; reject every other mutation of the sworn record.
    new.updated_at := old.updated_at;
    if (to_jsonb(new) - 'attempt_id') is distinct from (to_jsonb(old) - 'attempt_id') then
      raise exception 'practical_exam_is_final';
    end if;
    return new;
  end if;

  new.updated_at := now();
  return new;
end; $$;
