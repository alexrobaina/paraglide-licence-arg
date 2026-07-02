import { createClient } from '@/lib/supabase/server';
import Diploma from './Diploma';

export const dynamic = 'force-dynamic';

interface AttemptDetail {
  id: string;
  score: number;
  max_score: number;
  passed: boolean;
  finished_at: string;
  template: { title: string } | null;
  student: { email: string; full_name: string | null } | null;
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
      `id, score, max_score, passed, finished_at,
       template:exam_templates(title),
       student:profiles(email, full_name)`
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
      initialName={attempt.student?.full_name ?? ''}
      fallbackEmail={attempt.student?.email ?? 'Piloto'}
      examTitle={attempt.template?.title ?? 'de piloto'}
      score={attempt.score}
      maxScore={attempt.max_score}
      date={date}
    />
  );
}
