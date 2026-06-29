'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Home, Sparkles } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import PracticeSession from '@/components/PracticeSession';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getQuestionsBySection, sampleQuestions, countBySection } from '@/lib/questions';
import { useProgress } from '@/lib/storage';
import { SECTIONS } from '@/lib/constants';
import type { Question, Section } from '@/lib/types';

const SESSION_SIZE = 15;

export default function PracticaPage() {
  const { recordAnswer } = useProgress();
  const counts = countBySection();
  const [selectedSections, setSelectedSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[] | null>(null);

  function toggleSection(s: Section) {
    setSelectedSections((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function start() {
    const pool = getQuestionsBySection(selectedSections);
    setQuestions(sampleQuestions(SESSION_SIZE, pool));
  }

  if (questions) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
          <PracticeSession
            questions={questions}
            onAnswer={(q, perfect) => recordAnswer(q.uid, q.section, perfect)}
            onRestart={() => setQuestions(null)}
          />
        </main>
      </>
    );
  }

  const totalSelected =
    selectedSections.length === 0
      ? Object.values(counts).reduce((a, b) => a + b, 0)
      : selectedSections.reduce((a, s) => a + (counts[s] ?? 0), 0);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
        <Card variant="elevated" size="lg" spacing="normal">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
              <BookOpen className="h-6 w-6" />
            </span>
            <div>
              <CardTitle size="lg">Práctica por tema</CardTitle>
              <CardDescription>
                Elegí los temas (o ninguno = todos). Feedback inmediato.
              </CardDescription>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {SECTIONS.map((s) => {
              const active = selectedSections.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSection(s)}
                  className={[
                    'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                    active
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-800 dark:text-neutral-400',
                  ].join(' ')}
                >
                  {s}
                  <Badge variant={active ? 'success' : 'default'}>
                    {counts[s] ?? 0}
                  </Badge>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={start}>
              <Sparkles className="h-4 w-4" />
              Practicar {Math.min(SESSION_SIZE, totalSelected)} preguntas
            </Button>
            <span className="text-sm text-neutral-500">
              {selectedSections.length === 0
                ? 'Todos los temas'
                : `${selectedSections.length} tema(s)`}{' '}
              · {totalSelected} disponibles
            </span>
            <Link href="/" className="ml-auto">
              <Button variant="ghost">
                <Home className="h-4 w-4" />
                Inicio
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </>
  );
}
