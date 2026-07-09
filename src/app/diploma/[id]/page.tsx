import { createClient } from '@/lib/supabase/server';
import { getT } from '@/i18n/server';
import { DATE_LOCALE } from '@/i18n/messages';
import Diploma from './Diploma';

export const dynamic = 'force-dynamic';

interface AttemptDetail {
  id: string;
  score: number;
  max_score: number;
  passed: boolean;
  finished_at: string;
  student_name: string | null;
  template: { title: string } | null;
  invitation: { student_email: string } | null;
}

export default async function DiplomaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t, locale } = await getT();
  const supabase = await createClient();

  const { data } = await supabase
    .from('attempts')
    .select(
      `id, score, max_score, passed, finished_at, student_name,
       template:exam_templates(title),
       invitation:invitations(student_email)`
    )
    .eq('id', id)
    .single();

  const attempt = data as unknown as AttemptDetail | null;

  if (!attempt) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-neutral-500">{t('dip.notFound')}</p>
      </main>
    );
  }

  if (!attempt.passed) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-neutral-500">{t('dip.notPassed')}</p>
      </main>
    );
  }

  const date = new Date(attempt.finished_at).toLocaleDateString(DATE_LOCALE[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Diploma
      attemptId={attempt.id}
      initialName={attempt.student_name ?? ''}
      fallbackEmail={attempt.invitation?.student_email ?? t('dip.fallbackPilot')}
      examTitle={attempt.template?.title ?? t('dip.fallbackExam')}
      score={attempt.score}
      maxScore={attempt.max_score}
      date={date}
    />
  );
}
