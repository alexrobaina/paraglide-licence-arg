import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, Inbox } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { QUESTIONS_BY_ID } from '@/lib/questions';
import { gradeQuestion } from '@/lib/scoring';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import AttemptQuestionList, { type AttemptEntry } from './AttemptQuestionList';
import AttemptStats from './AttemptStats';
import type { Question } from '@/lib/types';

interface AttemptDetail {
  id: string;
  score: number;
  max_score: number;
  passed: boolean;
  finished_at: string;
  student_name: string | null;
  answers: Record<string, string[]> | null;
  template: { title: string; question_uids: string[] } | null;
  invitation: { student_email: string } | null;
}

export default async function AttemptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('attempts')
    .select(
      `id, score, max_score, passed, finished_at, student_name, answers,
       template:exam_templates(title, question_uids),
       invitation:invitations(student_email)`
    )
    .eq('id', id)
    .single();

  const attempt = data as unknown as AttemptDetail | null;
  if (!attempt) notFound();

  const answers = attempt.answers ?? {};
  const entries: AttemptEntry[] = (attempt.template?.question_uids ?? [])
    .map((uid) => QUESTIONS_BY_ID[uid])
    .filter((q): q is Question => Boolean(q))
    .map((q) => {
      const selected = answers[q.uid] ?? [];
      return { question: q, selected, result: gradeQuestion(q, selected) };
    });

  const correctCount = entries.filter((e) => e.result.perfect).length;
  const pilot = attempt.student_name ?? attempt.invitation?.student_email ?? '—';

  return (
    <>
      <Link
        href="/instructor/results"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Resultados
      </Link>

      <Card variant="modern" size="lg" className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{pilot}</h1>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
              {attempt.template?.title ?? '—'} ·{' '}
              {new Date(attempt.finished_at).toLocaleDateString('es-AR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-3xl font-bold tabular-nums">
                {attempt.score}
                <span className="text-lg text-neutral-400">/{attempt.max_score}</span>
              </div>
              <div className="text-xs text-neutral-500">
                {correctCount}/{entries.length} preguntas correctas
              </div>
            </div>
            <Badge
              variant={attempt.passed ? 'success' : 'error'}
              className="gap-1.5 px-3 py-1 text-sm"
            >
              {attempt.passed ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {attempt.passed ? 'Aprobado' : 'No aprobado'}
            </Badge>
          </div>
        </div>
      </Card>

      {entries.length === 0 ? (
        <Card variant="modern" size="lg" className="text-center">
          <Inbox className="mx-auto h-10 w-10 text-neutral-300 dark:text-neutral-700" />
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Este intento no tiene preguntas para mostrar.
          </p>
        </Card>
      ) : (
        <>
          <AttemptStats entries={entries} />
          <AttemptQuestionList entries={entries} />
        </>
      )}
    </>
  );
}
