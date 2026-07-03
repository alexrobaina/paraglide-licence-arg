import { createClient } from '@/lib/supabase/server';
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
        <p className="text-neutral-500">Diploma no encontrado o sin permiso.</p>
      </main>
    );
  }

  if (!attempt.passed) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-neutral-500">
          Este examen no fue aprobado, por lo que no hay diploma.
        </p>
      </main>
    );
  }

  const date = new Date(attempt.finished_at).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Diploma
      attemptId={attempt.id}
      initialName={attempt.student_name ?? ''}
      fallbackEmail={attempt.invitation?.student_email ?? 'Piloto'}
      examTitle={attempt.template?.title ?? 'de piloto'}
      score={attempt.score}
      maxScore={attempt.max_score}
      date={date}
    />
  );
}
