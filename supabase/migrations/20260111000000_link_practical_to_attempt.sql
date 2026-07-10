-- ============================================================================
-- Link a practical exam to the theory attempt of the same licence process.
--
-- A licence (FAVL) is granted when a student passes BOTH the theory Q&A exam
-- and the practical checklist. Until now the two only shared the `student`;
-- this optional FK pins a planilla to the exact theory attempt it pairs with,
-- so "which theory goes with which practical" is unambiguous even when a
-- student has several attempts.
--
-- Nullable on purpose: the theory may have been taken elsewhere / anonymously.
-- ON DELETE SET NULL: deleting a theory attempt must not erase a signed,
-- immutable planilla — it just loses the back-reference.
-- Idempotent.
-- ============================================================================

alter table practical_exams
  add column if not exists attempt_id uuid references attempts (id) on delete set null;

create index if not exists practical_exams_attempt_idx on practical_exams (attempt_id);
