-- ============================================================================
-- Structured licence level (N1..N5) on theory templates and practical exams.
--
-- A student climbs the FAVL ladder — Nivel 3, then 4, then 5 — and each level is
-- its own licence: its own theory exam + practical checklist + verdict. Until
-- now the level only lived in a template's title / the practical's free-text
-- license_type, so nothing could be grouped per level. This adds a structured
-- code (kept in sync with src/lib/practical/levels.ts) to both.
--
-- Nullable: existing exams keep working as "sin nivel" until an instructor sets
-- one. CHECK mirrors LICENSE_LEVEL_CODES.
-- Idempotent.
-- ============================================================================

alter table exam_templates  add column if not exists license_level text;
alter table practical_exams add column if not exists license_level text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'exam_templates_license_level_chk') then
    alter table exam_templates add constraint exam_templates_license_level_chk
      check (license_level is null or license_level in ('N1','N2','N3','N4','N5'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'practical_exams_license_level_chk') then
    alter table practical_exams add constraint practical_exams_license_level_chk
      check (license_level is null or license_level in ('N1','N2','N3','N4','N5'));
  end if;
end $$;
