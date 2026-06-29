'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, RotateCcw, Home, PartyPopper } from 'lucide-react';
import QuestionCard from '@/components/QuestionCard';
import { Card, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { gradeQuestion } from '@/lib/scoring';
import type { Question, Section } from '@/lib/types';

interface PracticeSessionProps {
  questions: Question[];
  onAnswer: (q: Question, perfect: boolean, section: Section) => void;
  onRestart: () => void;
  emptyLabel?: string;
}

export default function PracticeSession({
  questions,
  onAnswer,
  onRestart,
}: PracticeSessionProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ correct: 0, answered: 0 });

  const q = questions[index];
  const isLast = index === questions.length - 1;
  const finished = index >= questions.length;

  const lastScore = useMemo(
    () => (revealed && q ? gradeQuestion(q, selected) : null),
    [revealed, q, selected]
  );

  function check() {
    if (selected.length === 0 || !q) return;
    const res = gradeQuestion(q, selected);
    setRevealed(true);
    setStats((s) => ({
      correct: s.correct + (res.perfect ? 1 : 0),
      answered: s.answered + 1,
    }));
    onAnswer(q, res.perfect, q.section as Section);
  }

  function next() {
    setRevealed(false);
    setSelected([]);
    setIndex((i) => i + 1);
  }

  if (finished) {
    const pct =
      stats.answered > 0
        ? Math.round((stats.correct / stats.answered) * 100)
        : 0;
    return (
      <Card variant="elevated" size="lg" className="text-center">
        <div className="flex flex-col items-center gap-3">
          <PartyPopper className="h-10 w-10 text-violet-500" />
          <CardTitle size="lg">¡Sesión completada!</CardTitle>
          <p className="text-4xl font-bold tabular-nums">
            {stats.correct}
            <span className="text-2xl text-neutral-400">/{stats.answered}</span>
          </p>
          <Badge variant={pct >= 75 ? 'success' : pct >= 50 ? 'warning' : 'error'}>
            {pct}% de aciertos
          </Badge>
          <div className="mt-2 flex gap-3">
            <Button onClick={onRestart}>
              <RotateCcw className="h-4 w-4" />
              Otra ronda
            </Button>
            <Link href="/">
              <Button variant="ghost">
                <Home className="h-4 w-4" />
                Inicio
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm tabular-nums text-neutral-500">
          {index + 1}/{questions.length}
        </span>
        <div className="flex-1">
          <Progress value={index} max={questions.length} size="sm" />
        </div>
        <Badge variant="success">
          {stats.correct} ✓
        </Badge>
      </div>

      <QuestionCard
        question={q}
        selected={selected}
        onChange={setSelected}
        revealed={revealed}
        index={index}
        total={questions.length}
      />

      {revealed && lastScore && (
        <div
          className={[
            'rounded-lg border p-3 text-sm font-medium',
            lastScore.perfect
              ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400'
              : 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400',
          ].join(' ')}
        >
          {lastScore.perfect
            ? `¡Correcto! +${lastScore.score} puntos.`
            : `Obtuviste ${lastScore.score}/${lastScore.maxScore}. Revisá las opciones correctas (en verde).`}
        </div>
      )}

      <div className="flex gap-3">
        {!revealed ? (
          <Button
            className="ml-auto"
            disabled={selected.length === 0}
            onClick={check}
          >
            <Check className="h-4 w-4" />
            Comprobar
          </Button>
        ) : (
          <Button className="ml-auto" onClick={next}>
            {isLast ? 'Ver resultado' : 'Siguiente'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
