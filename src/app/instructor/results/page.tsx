import { createClient } from '@/lib/supabase/server';
import { ResultsClient } from './ResultsClient';
import type { ResultRow } from './ResultsClient';

export const dynamic = 'force-dynamic';

interface AttemptRow {
  id: string;
  score: number;
  max_score: number;
  passed: boolean;
  finished_at: string;
  student_name: string | null;
  student_id: string | null;
  template: { title: string; license_level: string | null } | null;
  invitation: { student_email: string } | null;
}

export default async function ResultsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('attempts')
    .select(
      `id, score, max_score, passed, finished_at, student_name, student_id,
       template:exam_templates(title, license_level),
       invitation:invitations(student_email)`
    )
    .order('finished_at', { ascending: false });

  const rows: ResultRow[] = ((data as unknown as AttemptRow[]) ?? []).map((a) => ({
    id: a.id,
    pilot: a.student_name ?? a.invitation?.student_email ?? '—',
    student_id: a.student_id,
    exam: a.template?.title ?? '—',
    level: a.template?.license_level ?? null,
    score: a.score,
    max_score: a.max_score,
    passed: a.passed,
    finished_at: a.finished_at,
  }));

  return <ResultsClient rows={rows} />;
}
