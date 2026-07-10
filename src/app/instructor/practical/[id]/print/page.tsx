import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { rowToInput } from '@/lib/practical/serialize';
import { PracticalPrint } from './PracticalPrint';
import type { PracticalExamRow } from '@/lib/practical/serialize';
import type { Student } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function PracticalPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase.from('practical_exams').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  const row = data as PracticalExamRow;

  const { data: studentData } = await supabase
    .from('students').select('*').eq('id', row.student_id).maybeSingle();
  const s = studentData as Student | null;
  const studentName = s ? `${s.last_name}${s.first_name ? `, ${s.first_name}` : ''}` : '—';

  return <PracticalPrint input={rowToInput(row)} studentName={studentName} dni={s?.dni ?? null} />;
}
