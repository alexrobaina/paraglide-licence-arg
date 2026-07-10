import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getT } from '@/i18n/server';
import { rowToInput } from '@/lib/practical/serialize';
import { PracticalForm } from '../PracticalForm';
import { fetchTheoryOptions } from '../theory';
import type { PracticalExamRow } from '@/lib/practical/serialize';
import type { Student } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function PracticalExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getT();
  const supabase = await createClient();

  const { data } = await supabase.from('practical_exams').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  const row = data as PracticalExamRow;

  const { data: studentData } = await supabase
    .from('students').select('*').eq('id', row.student_id).maybeSingle();
  const s = studentData as Student | null;
  const studentName = s ? `${s.last_name}${s.first_name ? `, ${s.first_name}` : ''}` : '—';
  const theoryAttempts = await fetchTheoryOptions(supabase, row.student_id);

  return (
    <>
      <Link href={`/instructor/students/${row.student_id}`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
        <ArrowLeft className="h-4 w-4" />
        {studentName}
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t('pr.title')}</h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('pr.subtitle')}</p>
      </div>
      <PracticalForm
        studentName={studentName}
        initial={rowToInput(row)}
        examId={row.id}
        status={row.status}
        theoryAttempts={theoryAttempts}
      />
    </>
  );
}
