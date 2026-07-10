'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { QUESTIONS_BY_ID } from '@/lib/questions';
import { getT } from '@/i18n/server';

export interface CreateTemplateInput {
  title: string;
  description?: string;
  question_uids: string[];
  pass_pct?: number; // pass threshold as a percentage (default 75)
  time_limit_min?: number | null;
  license_level?: string | null;
}

const LEVEL_CODES = new Set(['ALU', 'N3', 'N4', 'N5']);
/** Keep only a valid ladder code; anything else becomes "sin nivel". */
function cleanLevel(value?: string | null): string | null {
  return value && LEVEL_CODES.has(value) ? value : null;
}

export async function createTemplate(input: CreateTemplateInput) {
  const { t } = await getT();
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'instructor') {
    throw new Error(t('act.unauthorized'));
  }

  const title = input.title.trim();
  if (!title) throw new Error(t('act.titleRequired'));

  // Keep only uids that really exist in the bank (don't trust the client).
  const validUids = (input.question_uids ?? []).filter((uid) => uid in QUESTIONS_BY_ID);
  if (validUids.length === 0) throw new Error(t('act.pickQuestion'));

  // Authoritative max score = sum of the selected questions' maxScore.
  const maxScore = validUids.reduce(
    (sum, uid) => sum + QUESTIONS_BY_ID[uid].maxScore,
    0
  );
  const pct = Math.min(100, Math.max(1, input.pass_pct ?? 75));
  const passMark = Math.round((maxScore * pct) / 100);

  const supabase = await createClient();
  const { error } = await supabase.from('exam_templates').insert({
    instructor_id: profile.id,
    title,
    description: input.description?.trim() || null,
    question_uids: validUids,
    pass_mark: passMark,
    max_score: maxScore,
    time_limit_min: input.time_limit_min ?? null,
    license_level: cleanLevel(input.license_level),
  });

  if (error) throw new Error(error.message);

  revalidatePath('/instructor/templates');
  redirect('/instructor/templates');
}

export async function updateTemplate(id: string, input: CreateTemplateInput) {
  const { t } = await getT();
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'instructor') {
    throw new Error(t('act.unauthorized'));
  }

  const title = input.title.trim();
  if (!title) throw new Error(t('act.titleRequired'));

  const validUids = (input.question_uids ?? []).filter((uid) => uid in QUESTIONS_BY_ID);
  if (validUids.length === 0) throw new Error(t('act.pickQuestion'));

  const maxScore = validUids.reduce(
    (sum, uid) => sum + QUESTIONS_BY_ID[uid].maxScore,
    0
  );
  const pct = Math.min(100, Math.max(1, input.pass_pct ?? 75));
  const passMark = Math.round((maxScore * pct) / 100);

  const supabase = await createClient();
  const { error } = await supabase
    .from('exam_templates')
    .update({
      title,
      description: input.description?.trim() || null,
      question_uids: validUids,
      pass_mark: passMark,
      max_score: maxScore,
      time_limit_min: input.time_limit_min ?? null,
      license_level: cleanLevel(input.license_level),
    })
    .eq('id', id)
    .eq('instructor_id', profile.id);

  if (error) throw new Error(error.message);

  revalidatePath('/instructor/templates');
  redirect('/instructor/templates');
}

export async function deleteTemplate(id: string) {
  const { t } = await getT();
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'instructor') {
    throw new Error(t('act.unauthorized'));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('exam_templates')
    .delete()
    .eq('id', id)
    .eq('instructor_id', profile.id);

  if (error) throw new Error(error.message);
  revalidatePath('/instructor/templates');
}
