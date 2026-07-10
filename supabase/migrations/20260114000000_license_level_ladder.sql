-- ============================================================================
-- Adopt the real FAVL ladder: Alumno → N3 → N4 → N5 (drop the placeholder
-- N1/N2), and backfill the level of pre-existing exams by reading their title /
-- license_type, so historical exams stop showing as "Sin nivel".
-- Idempotent: only touches rows still without a level.
-- ============================================================================

alter table exam_templates  drop constraint if exists exam_templates_license_level_chk;
alter table practical_exams drop constraint if exists practical_exams_license_level_chk;

-- Retire the placeholder rungs: anything set to N1/N2 goes back to null so the
-- new CHECK holds and the title-inference below can re-classify it.
update exam_templates  set license_level = null where license_level in ('N1','N2');
update practical_exams set license_level = null where license_level in ('N1','N2');

alter table exam_templates add constraint exam_templates_license_level_chk
  check (license_level is null or license_level in ('ALU','N3','N4','N5'));
alter table practical_exams add constraint practical_exams_license_level_chk
  check (license_level is null or license_level in ('ALU','N3','N4','N5'));

-- Best-effort inference from the exam's own name. Higher levels first so
-- "Nivel 45" style titles don't misfire; unknown titles stay null.
update exam_templates set license_level = case
    when title ~* 'nivel\s*5|(^|\W)n5(\W|$)' then 'N5'
    when title ~* 'nivel\s*4|(^|\W)n4(\W|$)' then 'N4'
    when title ~* 'nivel\s*3|(^|\W)n3(\W|$)' then 'N3'
    when title ~* 'alumno'                    then 'ALU'
    else license_level
  end
where license_level is null;

-- license_level is metadata classification, not sworn planilla content, so the
-- one-time backfill may set it even on closed exams. The immutability trigger
-- blocks plain UPDATEs, so disable it just for this statement.
alter table practical_exams disable trigger practical_exams_guard;
update practical_exams set license_level = case
    when license_type ~* 'nivel\s*5' then 'N5'
    when license_type ~* 'nivel\s*4' then 'N4'
    when license_type ~* 'nivel\s*3' then 'N3'
    when license_type ~* 'alumno'    then 'ALU'
    else license_level
  end
where license_level is null;
alter table practical_exams enable trigger practical_exams_guard;
