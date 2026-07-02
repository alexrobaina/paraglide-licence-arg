'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { QUESTIONS_BY_ID } from '@/lib/questions';

export interface CreateTemplateInput {
  title: string;
  description?: string;
  question_uids: string[];
  pass_pct?: number; // pass threshold as a percentage (default 75)
  time_limit_min?: number | null;
}

export async function createTemplate(input: CreateTemplateInput) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'instructor') {
    throw new Error('No autorizado.');
  }

  const title = input.title.trim();
  if (!title) throw new Error('El título es obligatorio.');

  // Keep only uids that really exist in the bank (don't trust the client).
  const validUids = (input.question_uids ?? []).filter((uid) => uid in QUESTIONS_BY_ID);
  if (validUids.length === 0) throw new Error('Elige al menos una pregunta.');

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
  });

  if (error) throw new Error(error.message);

  revalidatePath('/instructor/templates');
  redirect('/instructor/templates');
}

export async function updateTemplate(id: string, input: CreateTemplateInput) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'instructor') {
    throw new Error('No autorizado.');
  }

  const title = input.title.trim();
  if (!title) throw new Error('El título es obligatorio.');

  const validUids = (input.question_uids ?? []).filter((uid) => uid in QUESTIONS_BY_ID);
  if (validUids.length === 0) throw new Error('Elige al menos una pregunta.');

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
    })
    .eq('id', id)
    .eq('instructor_id', profile.id);

  if (error) throw new Error(error.message);

  revalidatePath('/instructor/templates');
  redirect('/instructor/templates');
}

export async function deleteTemplate(id: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'instructor') {
    throw new Error('No autorizado.');
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
