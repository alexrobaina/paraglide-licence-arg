// ============================================================================
// The practical exam lives two ways: a nested `PracticalExamInput` the form and
// zod speak, and a flat `practical_exams` row Postgres stores (weather columns,
// jsonb sections). This module is the only place that bridges them.
// ============================================================================

import { PRACTICAL_FORM_VERSION, emptySections } from './form';
import type { PracticalExamInput } from './schema';
import type { SectionsValue } from './form';

export type PracticalExamStatus = 'draft' | 'final';

/** A `practical_exams` row as Supabase returns it. */
export interface PracticalExamRow {
  id: string;
  student_id: string;
  created_by: string;
  form_version: number;
  status: PracticalExamStatus;
  license_type: string;
  exam_date: string;
  place: string;
  club: string;
  instructor_name: string;
  examiner_name: string;
  previously_taken: 'SI' | 'NA' | null;
  wind_deg: number | null;
  cloud_base_ft: number | null;
  precipitation: boolean | null;
  temperature_c: number | null;
  start_time: string | null;
  end_time: string | null;
  sections: SectionsValue;
  result_computed: boolean | null;
  result_declared: boolean | null;
  result_observations: string;
  sworn: boolean;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
}

/** The persisted columns of an exam, minus what the DB owns (id, timestamps…). */
export type PracticalExamWrite = Omit<
  PracticalExamRow,
  'id' | 'created_by' | 'status' | 'result_computed' | 'finalized_at' | 'created_at' | 'updated_at'
>;

/** Postgres `time` wants NULL for "unknown", not the form's empty string. */
function timeColumn(value: string): string | null {
  return value.trim() === '' ? null : value;
}

export function inputToRow(input: PracticalExamInput): PracticalExamWrite {
  const { weather, ...rest } = input;
  return {
    ...rest,
    form_version: PRACTICAL_FORM_VERSION,
    wind_deg: weather.wind_deg,
    cloud_base_ft: weather.cloud_base_ft,
    precipitation: weather.precipitation,
    temperature_c: weather.temperature_c,
    start_time: timeColumn(weather.start_time),
    end_time: timeColumn(weather.end_time),
  };
}

export function rowToInput(row: PracticalExamRow): PracticalExamInput {
  const stored = row.sections ?? {};
  // An exam stored under an older/partial shape is healed to the current form.
  const sections = { ...emptySections() } as SectionsValue;
  for (const key of Object.keys(sections) as (keyof SectionsValue)[]) {
    if (stored[key]) sections[key] = stored[key];
  }

  return {
    student_id: row.student_id,
    license_type: row.license_type,
    exam_date: row.exam_date,
    place: row.place,
    club: row.club,
    instructor_name: row.instructor_name,
    examiner_name: row.examiner_name,
    previously_taken: row.previously_taken,
    weather: {
      wind_deg: row.wind_deg,
      cloud_base_ft: row.cloud_base_ft,
      precipitation: row.precipitation,
      temperature_c: row.temperature_c,
      start_time: row.start_time ?? '',
      end_time: row.end_time ?? '',
    },
    sections,
    result_declared: row.result_declared,
    result_observations: row.result_observations,
    sworn: row.sworn,
  };
}
