import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { StudentsClient } from './StudentsClient';
import type { StudentRow } from './StudentsClient';
import type { Student } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .order('last_name', { ascending: true });

  const list = (students as Student[]) ?? [];
  const ids = list.map((s) => s.id);

  // Count theory attempts + practical exams per student in two flat reads.
  const theory = new Map<string, number>();
  const practical = new Map<string, number>();
  if (ids.length) {
    const [{ data: attempts }, { data: exams }] = await Promise.all([
      supabase.from('attempts').select('student_id').in('student_id', ids),
      supabase.from('practical_exams').select('student_id').in('student_id', ids),
    ]);
    for (const a of (attempts as { student_id: string }[]) ?? [])
      theory.set(a.student_id, (theory.get(a.student_id) ?? 0) + 1);
    for (const e of (exams as { student_id: string }[]) ?? [])
      practical.set(e.student_id, (practical.get(e.student_id) ?? 0) + 1);
  }

  const rows: StudentRow[] = list.map((s) => ({
    ...s,
    theory_count: theory.get(s.id) ?? 0,
    practical_count: practical.get(s.id) ?? 0,
  }));

  const canBackfill = Boolean(profile);

  return <StudentsClient rows={rows} canBackfill={canBackfill} />;
}
