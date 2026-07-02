'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Timer,
  ChevronLeft,
  ChevronRight,
  Flag,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import QuestionCard from '@/components/QuestionCard';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import Alert from '@/components/ui/Alert';
import { QUESTIONS_BY_ID } from '@/lib/questions';
import { gradeQuestion, formatTime } from '@/lib/scoring';
import { createClient } from '@/lib/supabase/client';
import type { Question } from '@/lib/types';

type Phase = 'intro' | 'running' | 'submitting' | 'done';

const ERRORS: Record<string, string> = {
  invitation_already_used: 'Ya rendiste este examen. Pide una invitación nueva.',
  wrong_email: 'Esta invitación es para otro email.',
  not_authenticated: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  invitation_not_found: 'La invitación ya no existe.',
};

export default function ExamRunner({
  token,
  templateTitle,
  questionUids,
  passMark,
  maxScore,
  timeLimitMin,
}: {
  token: string;
  templateTitle: string;
  questionUids: string[];
  passMark: number;
  maxScore: number;
  timeLimitMin: number | null;
}) {
  const questions = useMemo<Question[]>(
    () => questionUids.map((uid) => QUESTIONS_BY_ID[uid]).filter(Boolean),
    [questionUids]
  );

  const [phase, setPhase] = useState<Phase>('intro');
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [current, setCurrent] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [remaining, setRemaining] = useState<number | null>(
    timeLimitMin != null ? timeLimitMin * 60 : null
  );
  const finishRef = useRef<() => void>(() => {});

  const answeredCount = useMemo(
    () => Object.values(answers).filter((a) => a.length > 0).length,
    [answers]
  );

  async function finish() {
    setConfirming(false);
    setPhase('submitting');
    setError(null);

    let score = 0;
    for (const q of questions) {
      score += gradeQuestion(q, answers[q.uid] ?? []).score;
    }
    const passed = score >= passMark;

    const { error: rpcError } = await createClient().rpc('submit_exam_attempt', {
      p_token: token,
      p_score: score,
      p_max_score: maxScore,
      p_passed: passed,
      p_answers: answers,
    });

    if (rpcError) {
      const key = rpcError.message.replace(/^.*?:\s*/, '').trim();
      setError(ERRORS[key] ?? rpcError.message);
      setPhase('running');
      return;
    }

    setResult({ score, passed });
    setPhase('done');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  finishRef.current = finish;

  // Countdown timer (auto-submits at 0).
  useEffect(() => {
    if (phase !== 'running' || remaining == null) return;
    if (remaining <= 0) {
      finishRef.current();
      return;
    }
    const id = setInterval(() => setRemaining((r) => (r == null ? r : r - 1)), 1000);
    return () => clearInterval(id);
  }, [phase, remaining]);

  if (questions.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <Alert variant="error" title="Examen vacío">
          Este examen no tiene preguntas válidas. Avisa a tu instructor.
        </Alert>
      </main>
    );
  }

  // ---- Intro ----
  if (phase === 'intro') {
    return (
      <main className="mx-auto max-w-md px-4 py-12">
        <Card variant="modern" size="lg" className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white">
            <Flag className="h-7 w-7" />
          </span>
          <CardTitle size="lg" className="mt-3">
            {templateTitle}
          </CardTitle>
          <CardDescription className="mt-1">
            {questions.length} preguntas · aprobás con {passMark}/{maxScore}
            {timeLimitMin != null && ` · ${timeLimitMin} min`}
          </CardDescription>
          <Alert variant="warning" className="mt-4 text-left">
            Tienes <strong>un solo intento</strong>. Al terminar se guarda y no puedes
            repetir.
          </Alert>
          <Button
            variant="primary"
            size="lg"
            className="mt-5 w-full"
            onClick={() => setPhase('running')}
          >
            Comenzar examen
          </Button>
        </Card>
      </main>
    );
  }

  // ---- Done ----
  if (phase === 'done' && result) {
    return (
      <main className="mx-auto max-w-md px-4 py-12">
        <Card variant="modern" size="lg" className="text-center">
          {result.passed ? (
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          ) : (
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
          )}
          <CardTitle size="lg" className="mt-3">
            {result.passed ? '¡Aprobado!' : 'No aprobado'}
          </CardTitle>
          <div className="mt-2 text-4xl font-bold tabular-nums">
            {result.score}
            <span className="text-lg text-neutral-400">/{maxScore}</span>
          </div>
          <CardDescription className="mt-2">
            Tu resultado fue enviado a tu instructor. Ya puedes cerrar esta página.
          </CardDescription>
        </Card>
      </main>
    );
  }

  // ---- Running / submitting ----
  const q = questions[current];
  const total = questions.length;
  const isLast = current === total - 1;
  const submitting = phase === 'submitting';

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <div className="mb-4 flex items-center gap-3">
        <Badge variant={remaining != null && remaining < 60 ? 'error' : 'default'} className="gap-1.5 tabular-nums">
          <Timer className="h-3.5 w-3.5" />
          {remaining != null ? formatTime(remaining * 1000) : '∞'}
        </Badge>
        <div className="flex-1">
          <Progress value={answeredCount} max={total} size="sm" />
        </div>
        <span className="text-sm tabular-nums text-neutral-500">
          {answeredCount}/{total}
        </span>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <QuestionCard
        question={q}
        index={current}
        total={total}
        selected={answers[q.uid] ?? []}
        onChange={(letters) => setAnswers((prev) => ({ ...prev, [q.uid]: letters }))}
      />

      <div className="mt-4 flex items-center gap-3">
        <Button
          variant="outline"
          disabled={current === 0 || submitting}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        {!isLast ? (
          <Button
            variant="primary"
            className="ml-auto"
            disabled={submitting}
            onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="primary"
            className="ml-auto"
            disabled={submitting}
            onClick={() => setConfirming(true)}
          >
            <Flag className="h-4 w-4" />
            {submitting ? 'Enviando…' : 'Terminar'}
          </Button>
        )}
      </div>

      <Card variant="minimal" size="md" className="mt-4">
        <div className="flex flex-wrap gap-1.5">
          {questions.map((qq, i) => {
            const done = (answers[qq.uid]?.length ?? 0) > 0;
            return (
              <button
                key={qq.uid}
                onClick={() => setCurrent(i)}
                className={[
                  'h-8 w-8 rounded-md text-xs font-medium tabular-nums transition-colors',
                  i === current
                    ? 'bg-sky-500 text-white'
                    : done
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800',
                ].join(' ')}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </Card>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card variant="elevated" size="lg" className="max-w-sm text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
            <h3 className="mt-2 text-lg font-semibold">¿Terminar examen?</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Respondiste {answeredCount} de {total}. No podrás volver a rendir.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Button variant="outline" onClick={() => setConfirming(false)}>
                Seguir
              </Button>
              <Button variant="primary" onClick={finish}>
                Terminar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
