// ============================================================================
// Validation for the practical planilla. One schema pair, shared by the client
// form and the server action — the browser never gets the last word.
//
//   practicalDraftSchema  — an examiner mid-mountain: blanks everywhere are fine.
//   practicalFinalSchema  — a declaración jurada: no blanks, no unsworn closes.
//
// Both are derived from PRACTICAL_FORM_V1, so adding an item to the form is a
// one-line change here: none.
// ============================================================================

import { z } from 'zod';
import { PRACTICAL_FORM_V1, baseSectionsOf, repetitionOf, sectionDef } from './form';
import type { SectionKey, SectionsValue, TestNo } from './form';
import { computeResult, diffMinutes, isSectionApproved, isSectionComplete } from './evaluate';

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** A 24 h clock reading, or blank while the exam is still a draft. */
const timeOrBlank = z.union([z.literal(''), z.string().regex(HHMM, 'Formato 24:00 (HH:MM)')]);

const sectionsSchema = z.strictObject(
  Object.fromEntries(
    PRACTICAL_FORM_V1.map((def) => [
      def.key,
      z.strictObject({
        items: z.strictObject(
          Object.fromEntries(def.items.map((code) => [code, z.boolean().nullable()])),
        ),
        observations: z.string().max(2000),
      }),
    ]),
  ),
);

const weatherSchema = z
  .strictObject({
    wind_deg: z.int().min(0).max(360).nullable(),
    cloud_base_ft: z.int().min(0).max(30_000).nullable(),
    precipitation: z.boolean().nullable(),
    temperature_c: z.number().min(-50).max(60).nullable(),
    start_time: timeOrBlank,
    end_time: timeOrBlank,
  })
  .refine(
    (w) => !(w.start_time && w.end_time) || diffMinutes(w.start_time, w.end_time) != null,
    { message: 'El examen no puede terminar antes de empezar.', path: ['end_time'] },
  );

const baseSchema = z.strictObject({
  student_id: z.uuid(),
  /** The theory attempt this planilla pairs with; null if taken elsewhere. */
  attempt_id: z.uuid().nullable(),
  /** FAVL ladder level (Alumno, N3..N5); null = sin nivel. Groups the licence. */
  license_level: z.enum(['ALU', 'N3', 'N4', 'N5']).nullable(),
  // Blank while a draft; required to close (see REQUIRED_TO_CLOSE).
  license_type: z.string().trim().max(120),
  exam_date: z.string().regex(ISO_DATE, 'Formato AAAA-MM-DD'),
  place: z.string().trim().max(200),
  club: z.string().trim().max(200),
  instructor_name: z.string().trim().max(200),
  examiner_name: z.string().trim().max(200),
  /** "Rendido antes s/Reg?" — SI, N/A, o vacío. */
  previously_taken: z.enum(['SI', 'NA']).nullable(),
  weather: weatherSchema,
  sections: sectionsSchema,
  result_declared: z.boolean().nullable(),
  result_observations: z.string().max(4000),
  /** "Lo completado aquí […] posee condición de declaración jurada." */
  sworn: z.boolean(),
});

export const practicalDraftSchema = baseSchema;

const REQUIRED_TO_CLOSE = ['license_type', 'place', 'instructor_name', 'examiner_name'] as const;
const TESTS: readonly TestNo[] = [1, 2, 3];

export const practicalFinalSchema = baseSchema.superRefine((exam, ctx) => {
  const fail = (message: string, path: (string | number)[]) =>
    ctx.addIssue({ code: 'custom', message, path });

  for (const field of REQUIRED_TO_CLOSE) {
    if (!exam[field]) fail('Requerido para cerrar la planilla.', [field]);
  }

  const { weather } = exam;
  for (const field of ['wind_deg', 'cloud_base_ft', 'precipitation', 'temperature_c'] as const) {
    if (weather[field] == null) fail('Requerido para cerrar la planilla.', ['weather', field]);
  }
  if (!weather.start_time) fail('Requerido para cerrar la planilla.', ['weather', 'start_time']);
  if (!weather.end_time) fail('Requerido para cerrar la planilla.', ['weather', 'end_time']);

  const sections = exam.sections as unknown as SectionsValue;

  // Every prueba must be fully decided; a failed one must have been repeated.
  for (const testNo of TESTS) {
    for (const key of baseSectionsOf(testNo)) {
      if (!isSectionComplete(sections, key)) {
        fail('Falta completar SI/NO en todos los ítems.', ['sections', key]);
        continue;
      }
      if (isSectionApproved(sections, key)) continue;

      const rep = repetitionOf(key);
      if (rep && !isSectionComplete(sections, rep)) {
        fail(
          `${sectionDef(key).repetition ? '' : 'Prueba desaprobada: '}completá la repetición.`,
          ['sections', rep],
        );
      }
    }
  }

  if (exam.result_declared == null) fail('Declará el resultado final.', ['result_declared']);
  if (!exam.sworn) fail('Debés aceptar la declaración jurada.', ['sworn']);

  // The examiner outranks the checklist, but an override must be justified.
  if (exam.result_declared != null && exam.result_declared !== computeResult(sections)) {
    if (!exam.result_observations.trim()) {
      fail(
        'El resultado declarado no coincide con las pruebas: fundamentá el motivo.',
        ['result_observations'],
      );
    }
  }
});

type BaseInput = z.infer<typeof baseSchema>;

/** The planilla as the form holds it and the DB stores it. */
export type PracticalExamInput = Omit<BaseInput, 'sections'> & { sections: SectionsValue };

/** Flattens zod issues into `{ 'weather.end_time': 'message' }` for the form. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!(path in out)) out[path] = issue.message;
  }
  return out;
}

export type { SectionKey, SectionsValue };
