import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { getT } from '@/i18n/server';
import { emptySections } from '@/lib/practical/form';
import { PracticalForm } from '../PracticalForm';
import { fetchTheoryOptions } from '../theory';
import type { PracticalExamInput } from '@/lib/practical/schema';
import type { Student } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function NewPracticalPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const { student: studentId } = await searchParams;
  if (!studentId) redirect('/instructor/students');

  const { t } = await getT();
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data } = await supabase.from('students').select('*').eq('id', studentId).maybeSingle();
  if (!data) notFound();
  const s = data as Student;
  const studentName = `${s.last_name}${s.first_name ? `, ${s.first_name}` : ''}`;

  const theoryAttempts = await fetchTheoryOptions(supabase, s.id);

  const initial: PracticalExamInput = {
    student_id: s.id,
    attempt_id: null,
    license_level: 'N3',
    license_type: 'Piloto Básico Nivel 3',
    exam_date: new Date().toISOString().slice(0, 10),
    place: '',
    club: s.club ?? '',
    instructor_name: profile?.full_name ?? '',
    examiner_name: '',
    previously_taken: null,
    weather: {
      wind_deg: null, cloud_base_ft: null, precipitation: null,
      temperature_c: null, start_time: '', end_time: '',
    },
    sections: emptySections(),
    result_declared: null,
    result_observations: '',
    sworn: false,
  };

  return (
    <>
      <Link href={`/instructor/students/${s.id}`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
        <ArrowLeft className="h-4 w-4" />
        {studentName}
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t('pr.title')}</h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('pr.subtitle')}</p>
      </div>
      <PracticalForm studentName={studentName} initial={initial} status="draft" theoryAttempts={theoryAttempts} />
    </>
  );
}
