import type { createClient } from '@/lib/supabase/server';
import type { TheoryOption } from './PracticalForm';

interface TheoryAttemptRow {
  id: string;
  score: number;
  max_score: number;
  passed: boolean;
  finished_at: string;
  template: { title: string } | null;
}

/** The student's theory attempts, newest first, shaped for the link dropdown. */
export async function fetchTheoryOptions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
): Promise<TheoryOption[]> {
  const { data } = await supabase
    .from('attempts')
    .select('id, score, max_score, passed, finished_at, template:exam_templates(title)')
    .eq('student_id', studentId)
    .order('finished_at', { ascending: false });

  return ((data as unknown as TheoryAttemptRow[]) ?? []).map((a) => ({
    id: a.id,
    title: a.template?.title ?? 'Examen teórico',
    score: a.score,
    max_score: a.max_score,
    passed: a.passed,
    finished_at: a.finished_at,
  }));
}
