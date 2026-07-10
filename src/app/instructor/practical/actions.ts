'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { getT } from '@/i18n/server';
import { computeResult } from '@/lib/practical/evaluate';
import { practicalDraftSchema, practicalFinalSchema, fieldErrors } from '@/lib/practical/schema';
import { inputToRow } from '@/lib/practical/serialize';
import type { PracticalExamInput } from '@/lib/practical/schema';

export interface SaveResult {
  ok: boolean;
  id?: string;
  /** Zod field errors, keyed `weather.end_time` etc., for the form to surface. */
  errors?: Record<string, string>;
}

async function requireInstructor() {
  const { t } = await getT();
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'instructor') throw new Error(t('act.unauthorized'));
  return profile;
}

/** Confirms the alumno belongs to this instructor before we hang an exam off them. */
async function assertOwnsStudent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  instructorId: string,
  studentId: string,
) {
  const { data } = await supabase
    .from('students')
    .select('id')
    .eq('id', studentId)
    .eq('instructor_id', instructorId)
    .maybeSingle();
  if (!data) throw new Error('student_not_found');
}

/** Refuses to touch an exam that is already a sworn, closed planilla. */
async function assertDraft(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
): Promise<void> {
  const { data } = await supabase
    .from('practical_exams')
    .select('status')
    .eq('id', id)
    .maybeSingle();
  if (data?.status === 'final') throw new Error('practical_exam_is_final');
}

export async function savePracticalDraft(
  input: PracticalExamInput,
  examId?: string,
): Promise<SaveResult> {
  const profile = await requireInstructor();

  // A draft tolerates blanks, but never a bad shape or a foreign student.
  const parsed = practicalDraftSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  await assertOwnsStudent(supabase, profile.id, input.student_id);

  const row = {
    ...inputToRow(parsed.data as PracticalExamInput),
    result_computed: computeResult(input.sections),
  };

  if (examId) {
    await assertDraft(supabase, examId);
    const { error } = await supabase
      .from('practical_exams')
      .update(row)
      .eq('id', examId)
      .eq('created_by', profile.id);
    if (error) throw new Error(error.message);
    revalidatePath(`/instructor/practical/${examId}`);
    return { ok: true, id: examId };
  }

  const { data, error } = await supabase
    .from('practical_exams')
    .insert({ ...row, created_by: profile.id, status: 'draft' })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/instructor/students');
  return { ok: true, id: data.id as string };
}

/**
 * Closes the planilla: the full sworn validation must pass, and from here the
 * DB makes the row immutable. Persist first, then flip to `final`.
 */
export async function finalizePracticalExam(
  input: PracticalExamInput,
  examId: string,
): Promise<SaveResult> {
  const profile = await requireInstructor();

  const parsed = practicalFinalSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  await assertOwnsStudent(supabase, profile.id, input.student_id);
  await assertDraft(supabase, examId);

  const { error } = await supabase
    .from('practical_exams')
    .update({
      ...inputToRow(parsed.data as PracticalExamInput),
      result_computed: computeResult(input.sections),
      status: 'final',
      finalized_at: new Date().toISOString(),
      finalized_by: profile.id,
    })
    .eq('id', examId)
    .eq('created_by', profile.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/instructor/practical/${examId}`);
  revalidatePath('/instructor/students');
  return { ok: true, id: examId };
}

export async function deletePracticalDraft(examId: string) {
  const profile = await requireInstructor();
  const supabase = await createClient();
  await assertDraft(supabase, examId); // the DB trigger also blocks finals
  const { error } = await supabase
    .from('practical_exams')
    .delete()
    .eq('id', examId)
    .eq('created_by', profile.id);
  if (error) throw new Error(error.message);
  revalidatePath('/instructor/students');
}
