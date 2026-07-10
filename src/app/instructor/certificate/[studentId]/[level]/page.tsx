import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { levelLabel, levelPassPct, isLicenseLevel } from '@/lib/practical/levels';
import { Certificate, type CertificateData } from './Certificate';
import type { Student } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

interface TheoryRow {
  id: string;
  score: number;
  max_score: number;
  passed: boolean;
  finished_at: string;
  answers: Record<string, string[]> | null;
  template: { license_level: string | null; question_uids: string[] } | null;
}
interface PracticalRow {
  id: string;
  license_level: string | null;
  status: 'draft' | 'final';
  result_declared: boolean | null;
  exam_date: string;
  finalized_at: string | null;
  place: string;
  club: string;
  instructor_name: string;
  examiner_name: string;
}

function fmt(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-AR');
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ studentId: string; level: string }>;
}) {
  const { studentId, level } = await params;
  if (!isLicenseLevel(level)) notFound();
  const supabase = await createClient();

  const { data: studentData } = await supabase.from('students').select('*').eq('id', studentId).maybeSingle();
  if (!studentData) notFound();
  const s = studentData as Student;

  const [{ data: theoryData }, { data: practicalData }] = await Promise.all([
    supabase
      .from('attempts')
      .select('id, score, max_score, passed, finished_at, answers, template:exam_templates(license_level, question_uids)')
      .eq('student_id', studentId)
      .eq('passed', true)
      .order('finished_at', { ascending: false }),
    supabase
      .from('practical_exams')
      .select('id, license_level, status, result_declared, exam_date, finalized_at, place, club, instructor_name, examiner_name')
      .eq('student_id', studentId)
      .eq('license_level', level)
      .eq('status', 'final')
      .order('exam_date', { ascending: false }),
  ]);

  const theory = ((theoryData as unknown as TheoryRow[]) ?? [])
    .find((a) => (a.template?.license_level ?? null) === level) ?? null;
  const practical = ((practicalData as PracticalRow[]) ?? [])
    .find((p) => p.result_declared === true) ?? null;

  // The certificate exists only for a GRANTED licence: both legs passed.
  if (!theory || !practical) notFound();

  const answers = theory.answers ?? {};
  const questionsAsked = theory.template?.question_uids?.length ?? 0;
  const questionsAnswered = Object.values(answers).filter((a) => a.length > 0).length;
  const passPct = levelPassPct(level);

  const data: CertificateData = {
    clubHeader: practical.club ? `CLUB ${practical.club.toUpperCase()}` : '',
    levelLabel: levelLabel(level),
    lastName: s.last_name,
    firstName: s.first_name,
    dni: s.dni ?? '',
    examDate: fmt(theory.finished_at),
    place: practical.place,
    club: practical.club,
    instructor: practical.instructor_name,
    examiner: practical.examiner_name,
    questionsAsked,
    questionsAnswered,
    score: theory.score,
    maxScore: theory.max_score,
    passPoints: Math.round((theory.max_score * passPct) / 100),
    passPct,
    practicalApprovedOn: fmt(practical.finalized_at ?? practical.exam_date),
  };

  return <Certificate data={data} />;
}
