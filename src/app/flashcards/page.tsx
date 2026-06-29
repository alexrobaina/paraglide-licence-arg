'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Home,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  PartyPopper,
  RotateCcw,
} from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import {
  getQuestionsBySection,
  sampleQuestions,
  countBySection,
} from '@/lib/questions';
import { useProgress } from '@/lib/storage';
import { SECTIONS } from '@/lib/constants';
import type { Question, Section } from '@/lib/types';

const DECK_SIZE = 20;

export default function FlashcardsPage() {
  const { markFlashcard } = useProgress();
  const counts = countBySection();
  const [selected, setSelected] = useState<Section[]>([]);
  const [deck, setDeck] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ known: 0, unknown: 0 });

  function toggle(s: Section) {
    setSelected((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  }

  function start() {
    const pool = getQuestionsBySection(selected);
    setDeck(sampleQuestions(DECK_SIZE, pool));
    setIndex(0);
    setFlipped(false);
    setStats({ known: 0, unknown: 0 });
  }

  function mark(known: boolean) {
    const q = deck![index];
    markFlashcard(q.uid, known);
    setStats((s) => ({
      known: s.known + (known ? 1 : 0),
      unknown: s.unknown + (known ? 0 : 1),
    }));
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  // Selector
  if (!deck) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
          <Card variant="elevated" size="lg" spacing="normal">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                <Layers className="h-6 w-6" />
              </span>
              <div>
                <CardTitle size="lg">Flashcards</CardTitle>
                <CardDescription>
                  Volteá la tarjeta y marcá si la sabías. Memorización rápida.
                </CardDescription>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {SECTIONS.map((s) => {
                const active = selected.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggle(s)}
                    className={[
                      'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                      active
                        ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-800 dark:text-neutral-400',
                    ].join(' ')}
                  >
                    {s}
                    <Badge variant={active ? 'primary' : 'default'}>
                      {counts[s] ?? 0}
                    </Badge>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Button size="lg" onClick={start}>
                Empezar mazo de {DECK_SIZE}
              </Button>
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

  // Fin del mazo
  if (index >= deck.length) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
          <Card variant="elevated" size="lg" className="text-center">
            <div className="flex flex-col items-center gap-3">
              <PartyPopper className="h-10 w-10 text-violet-500" />
              <CardTitle size="lg">¡Mazo terminado!</CardTitle>
              <p className="text-sm text-neutral-500">
                Sabías {stats.known} de {deck.length}.
              </p>
              <div className="mt-2 flex gap-3">
                <Button onClick={() => setDeck(null)}>
                  <RotateCcw className="h-4 w-4" />
                  Otro mazo
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
        </main>
      </>
    );
  }

  const q = deck[index];
  const correct = q.options.filter((o) => o.correct);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm tabular-nums text-neutral-500">
            {index + 1}/{deck.length}
          </span>
          <div className="flex-1">
            <Progress value={index} max={deck.length} size="sm" variant="primary" />
          </div>
          <Badge variant="success">{stats.known} ✓</Badge>
        </div>

        {/* Tarjeta */}
        <button
          onClick={() => setFlipped((f) => !f)}
          className="block w-full text-left"
        >
          <Card
            variant="modern"
            size="xl"
            interactive
            className="flex min-h-[20rem] flex-col items-center justify-center text-center"
          >
            <Badge variant="primary" className="mb-4">
              {q.section}
            </Badge>
            {!flipped ? (
              <>
                <p className="text-xl font-semibold leading-snug">
                  {q.question}
                </p>
                <span className="mt-6 flex items-center gap-1 text-xs text-neutral-400">
                  <RotateCw className="h-3.5 w-3.5" />
                  Tocá para ver la respuesta
                </span>
              </>
            ) : (
              <div className="w-full">
                <p className="mb-4 text-sm text-neutral-400">{q.question}</p>
                <ul className="flex flex-col gap-2 text-left">
                  {correct.map((o) => (
                    <li
                      key={o.letter}
                      className="flex items-start gap-2 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300"
                    >
                      <span className="font-bold">{o.letter}.</span>
                      <span>{o.text}</span>
                      <span className="ml-auto font-semibold">+{o.score}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </button>

        <div className="mt-4 flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={() => mark(false)}
            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <ThumbsDown className="h-4 w-4" />
            No la sabía
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={() => mark(true)}
            className="border-green-300 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/30"
          >
            <ThumbsUp className="h-4 w-4" />
            La sabía
          </Button>
        </div>
      </main>
    </>
  );
}
