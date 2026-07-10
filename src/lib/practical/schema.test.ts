import { describe, expect, it } from 'vitest';
import { emptySections, sectionDef } from './form';
import { practicalDraftSchema, practicalFinalSchema } from './schema';
import type { SectionKey, SectionsValue } from './form';

const STUDENT_ID = '3f1c2f4e-9a1b-4c1d-8e2f-0a1b2c3d4e5f';

function fill(sections: SectionsValue, key: SectionKey, value: boolean): SectionsValue {
  const items = { ...sections[key].items };
  for (const code of sectionDef(key).items) items[code] = value;
  return { ...sections, [key]: { ...sections[key], items } };
}

function passedSections(): SectionsValue {
  let s = emptySections();
  for (const key of ['t1-llanura', 't1-montana', 't2', 't3'] as const) s = fill(s, key, true);
  return s;
}

/** A planilla filled exactly as an examiner would hand it in. */
function validFinal() {
  return {
    student_id: STUDENT_ID,
    attempt_id: null,
    license_level: 'N3',
    license_type: 'Piloto Básico Nivel 3',
    exam_date: '2025-05-28',
    place: 'Cuchi Corral',
    club: 'Club Andino',
    instructor_name: 'Ana Pérez',
    examiner_name: 'Luis Gómez',
    previously_taken: null,
    weather: {
      wind_deg: 270,
      cloud_base_ft: 4500,
      precipitation: false,
      temperature_c: 18.5,
      start_time: '09:30',
      end_time: '11:05',
    },
    sections: passedSections(),
    result_declared: true,
    result_observations: '',
    sworn: true,
  };
}

describe('practicalDraftSchema', () => {
  it('accepts an all-blank planilla — a draft is a work in progress', () => {
    const draft = {
      student_id: STUDENT_ID,
      attempt_id: null,
      license_level: null,
      license_type: 'Piloto Básico Nivel 3',
      exam_date: '2025-05-28',
      place: '',
      club: '',
      instructor_name: '',
      examiner_name: '',
      previously_taken: null,
      weather: {
        wind_deg: null, cloud_base_ft: null, precipitation: null,
        temperature_c: null, start_time: '', end_time: '',
      },
      sections: emptySections(),
      result_declared: null,
      result_observations: '',
      sworn: false,
    };
    expect(practicalDraftSchema.safeParse(draft).success).toBe(true);
  });

  it('always needs a student — the planilla hangs off a person', () => {
    const draft = { ...validFinal(), student_id: 'not-a-uuid' };
    expect(practicalDraftSchema.safeParse(draft).success).toBe(false);
  });

  it('rejects a section key the form definition does not know', () => {
    const draft = validFinal();
    (draft.sections as Record<string, unknown>)['t9-luna'] = { items: {}, observations: '' };
    expect(practicalDraftSchema.safeParse(draft).success).toBe(false);
  });

  it('rejects an item the section does not evaluate', () => {
    const draft = validFinal();
    (draft.sections['t1-montana'].items as Record<string, unknown>).CONOS = true;
    expect(practicalDraftSchema.safeParse(draft).success).toBe(false);
  });

  it('rejects a missing section', () => {
    const draft = validFinal();
    delete (draft.sections as Record<string, unknown>)['t3r'];
    expect(practicalDraftSchema.safeParse(draft).success).toBe(false);
  });
});

describe('practicalDraftSchema — weather bounds', () => {
  it.each([
    ['wind_deg', 361],
    ['wind_deg', -1],
    ['cloud_base_ft', -1],
    ['temperature_c', -60],
    ['temperature_c', 70],
  ])('rejects %s = %s', (field, value) => {
    const draft = validFinal();
    (draft.weather as Record<string, unknown>)[field] = value;
    expect(practicalDraftSchema.safeParse(draft).success).toBe(false);
  });

  it('accepts the bounds themselves', () => {
    const draft = validFinal();
    draft.weather.wind_deg = 360;
    draft.weather.cloud_base_ft = 0;
    draft.weather.temperature_c = -50;
    expect(practicalDraftSchema.safeParse(draft).success).toBe(true);
  });

  it.each(['9:30', '25:00', '09:60', 'mediodía'])('rejects the malformed time %s', (t) => {
    const draft = validFinal();
    draft.weather.start_time = t;
    expect(practicalDraftSchema.safeParse(draft).success).toBe(false);
  });

  it('rejects an exam that ends before it starts', () => {
    const draft = validFinal();
    draft.weather.start_time = '11:05';
    draft.weather.end_time = '09:30';
    expect(practicalDraftSchema.safeParse(draft).success).toBe(false);
  });
});

describe('practicalFinalSchema', () => {
  it('accepts a fully filled planilla', () => {
    const parsed = practicalFinalSchema.safeParse(validFinal());
    expect(parsed.success).toBe(true);
  });

  it('refuses to close without the sworn declaration', () => {
    expect(practicalFinalSchema.safeParse({ ...validFinal(), sworn: false }).success).toBe(false);
  });

  it.each(['license_type', 'place', 'instructor_name', 'examiner_name'])('refuses to close without %s', (field) => {
    const exam = { ...validFinal(), [field]: '' };
    expect(practicalFinalSchema.safeParse(exam).success).toBe(false);
  });

  it('refuses to close without the exam clock', () => {
    const exam = validFinal();
    exam.weather.end_time = '';
    expect(practicalFinalSchema.safeParse(exam).success).toBe(false);
  });

  it('refuses to close without a declared result', () => {
    expect(practicalFinalSchema.safeParse({ ...validFinal(), result_declared: null }).success).toBe(false);
  });

  it('refuses to close while a prueba has a blank item', () => {
    const exam = validFinal();
    exam.sections['t2'].items.CIRC_APROX = null;
    expect(practicalFinalSchema.safeParse(exam).success).toBe(false);
  });

  it('refuses to close when a failed prueba has no repetition filled in', () => {
    const exam = { ...validFinal(), sections: fill(passedSections(), 't3', false), result_declared: false };
    expect(practicalFinalSchema.safeParse(exam).success).toBe(false);
  });

  it('accepts a failed prueba once its repetition is fully filled in', () => {
    let sections = fill(passedSections(), 't3', false);
    sections = fill(sections, 't3r', true);
    expect(practicalFinalSchema.safeParse({ ...validFinal(), sections }).success).toBe(true);
  });

  it('accepts a disapproved exam — a failed repetition is still a valid planilla', () => {
    let sections = fill(passedSections(), 't3', false);
    sections = fill(sections, 't3r', false);
    const exam = { ...validFinal(), sections, result_declared: false };
    expect(practicalFinalSchema.safeParse(exam).success).toBe(true);
  });

  it('lets the examiner override the computed result, but never silently', () => {
    // Every prueba passed, yet the examiner declares NO. Allowed only with a reason.
    const exam = { ...validFinal(), result_declared: false, result_observations: '' };
    expect(practicalFinalSchema.safeParse(exam).success).toBe(false);

    const justified = { ...exam, result_observations: 'Actitud insegura en el aterrizaje final.' };
    expect(practicalFinalSchema.safeParse(justified).success).toBe(true);
  });
});
