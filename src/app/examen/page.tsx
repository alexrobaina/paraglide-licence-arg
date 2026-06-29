'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Timer,
  ChevronLeft,
  ChevronRight,
  Flag,
  AlertTriangle,
  Home,
} from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import QuestionCard from '@/components/QuestionCard';
import ExamResults from '@/components/ExamResults';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { sampleQuestions } from '@/lib/questions';
import { gradeExam, formatTime } from '@/lib/scoring';
import { useProgress } from '@/lib/storage';
import {
  EXAM_QUESTION_COUNT,
  EXAM_PASS_MARK,
  EXAM_MAX_SCORE,
} from '@/lib/constants';
import type { ExamResult, Question, Section } from '@/lib/types';

type Phase = 'intro' | 'running' | 'done';

export default function ExamPage() {
  const { recordExam } = useProgress();
  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [current, setCurrent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);
  const [result, setResult] = useState<ExamResult | null>(null);

  // Cronómetro
  useEffect(() => {
    if (phase !== 'running') return;
    const id = setInterval(() => setElapsed(Date.now() - startRef.current), 500);
    return () => clearInterval(id);
  }, [phase]);

  function start() {
    setQuestions(sampleQuestions(EXAM_QUESTION_COUNT));
    setAnswers({});
    setCurrent(0);
    setElapsed(0);
    startRef.current = Date.now();
    setResult(null);
    setPhase('running');
  }

  function finish() {
    const elapsedMs = Date.now() - startRef.current;
    const res = gradeExam(questions, answers, elapsedMs);
    recordExam(
      res.total,
      res.details.map((d) => ({
        section: d.question.section as Section,
        perfect: d.perfect,
        id: d.questionId,
      }))
    );
    setResult(res);
    setPhase('done');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const answeredCount = useMemo(
    () => Object.values(answers).filter((a) => a.length > 0).length,
    [answers]
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
        {phase === 'intro' && (
          <IntroScreen onStart={start} />
        )}

        {phase === 'running' && questions.length > 0 && (
          <RunningScreen
            questions={questions}
            current={current}
            setCurrent={setCurrent}
            answers={answers}
            setAnswers={setAnswers}
            elapsed={elapsed}
            answeredCount={answeredCount}
            onFinish={finish}
          />
        )}

        {phase === 'done' && result && (
          <ExamResults result={result} onRetry={start} />
        )}
      </main>
    </>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <Card variant="elevated" size="lg" className="text-center" spacing="normal">
      <div className="flex flex-col items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg">
          <Timer className="h-8 w-8" />
        </span>
        <h1 className="text-2xl font-bold">Simulacro de examen</h1>
        <p className="max-w-md text-neutral-600 dark:text-neutral-400">
          {EXAM_QUESTION_COUNT} preguntas al azar de todos los temas. Tenés
          cronómetro y podés navegar entre preguntas. Aprobás con{' '}
          <strong>
            {EXAM_PASS_MARK}/{EXAM_MAX_SCORE}
          </strong>{' '}
          puntos (75%).
        </p>
        <Alert variant="info" className="text-left">
          Ojo: muchas preguntas tienen <strong>más de una</strong> respuesta
          correcta. Sumás los puntos de las opciones correctas que marques.
        </Alert>
        <div className="flex gap-3">
          <Button size="lg" onClick={onStart}>
            Comenzar simulacro
          </Button>
          <Link href="/">
            <Button size="lg" variant="ghost">
              <Home className="h-4 w-4" />
              Inicio
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

function RunningScreen({
  questions,
  current,
  setCurrent,
  answers,
  setAnswers,
  elapsed,
  answeredCount,
  onFinish,
}: {
  questions: Question[];
  current: number;
  setCurrent: (n: number) => void;
  answers: Record<string, string[]>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  elapsed: number;
  answeredCount: number;
  onFinish: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const q = questions[current];
  const total = questions.length;
  const isLast = current === total - 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Barra superior: timer + progreso */}
      <div className="flex items-center gap-3">
        <Badge variant="default" className="gap-1.5 text-sm tabular-nums">
          <Timer className="h-3.5 w-3.5" />
          {formatTime(elapsed)}
        </Badge>
        <div className="flex-1">
          <Progress value={answeredCount} max={total} size="sm" />
        </div>
        <span className="text-sm tabular-nums text-neutral-500">
          {answeredCount}/{total}
        </span>
      </div>

      <QuestionCard
        question={q}
        index={current}
        total={total}
        selected={answers[q.uid] ?? []}
        onChange={(letters) =>
          setAnswers((prev) => ({ ...prev, [q.uid]: letters }))
        }
      />

      {/* Navegación */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          disabled={current === 0}
          onClick={() => setCurrent(Math.max(0, current - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        {!isLast ? (
          <Button
            variant="primary"
            className="ml-auto"
            onClick={() => setCurrent(Math.min(total - 1, current + 1))}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="primary"
            className="ml-auto"
            onClick={() => setConfirming(true)}
          >
            <Flag className="h-4 w-4" />
            Finalizar
          </Button>
        )}
      </div>

      {/* Grilla de navegación rápida */}
      <Card variant="minimal" size="md">
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
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700',
                ].join(' ')}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </Card>

      <Button
        variant="ghost"
        className="self-center text-neutral-500"
        onClick={() => setConfirming(true)}
      >
        Finalizar y ver resultado
      </Button>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card variant="elevated" size="lg" className="max-w-sm">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <h3 className="text-lg font-semibold">¿Finalizar simulacro?</h3>
              <p className="text-sm text-neutral-500">
                Respondiste {answeredCount} de {total}. Las no respondidas cuentan
                como 0.
              </p>
              <div className="mt-2 flex gap-3">
                <Button variant="outline" onClick={() => setConfirming(false)}>
                  Seguir
                </Button>
                <Button variant="primary" onClick={onFinish}>
                  Finalizar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
