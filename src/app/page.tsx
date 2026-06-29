'use client';

import Link from 'next/link';
import {
  Timer,
  BookOpen,
  RefreshCcw,
  Layers,
  Trophy,
  Target,
  ArrowRight,
} from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import {
  Card,
  CardTitle,
  CardDescription,
} from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import { useProgress } from '@/lib/storage';
import { QUESTIONS, countBySection } from '@/lib/questions';
import {
  EXAM_MAX_SCORE,
  EXAM_PASS_MARK,
  EXAM_QUESTION_COUNT,
  SECTIONS,
} from '@/lib/constants';

const MODES = [
  {
    href: '/examen',
    title: 'Simulacro de examen',
    desc: `${EXAM_QUESTION_COUNT} preguntas al azar, cronómetro y puntaje real. Aprobás con ${EXAM_PASS_MARK}/${EXAM_MAX_SCORE}.`,
    icon: Timer,
    accent: 'from-sky-500 to-cyan-500',
  },
  {
    href: '/practica',
    title: 'Práctica por tema',
    desc: 'Elegí uno o varios temas y practicá con feedback inmediato.',
    icon: BookOpen,
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    href: '/repaso',
    title: 'Repaso de errores',
    desc: 'Volvé a las preguntas que fallaste hasta dominarlas.',
    icon: RefreshCcw,
    accent: 'from-amber-500 to-orange-500',
  },
  {
    href: '/flashcards',
    title: 'Flashcards',
    desc: 'Tarjetas pregunta/respuesta para memorizar rápido.',
    icon: Layers,
    accent: 'from-violet-500 to-fuchsia-500',
  },
];

export default function HomePage() {
  const { progress, ready } = useProgress();
  const counts = countBySection();
  const wrongCount = Object.keys(progress.wrongQueue).length;

  const best = progress.bestExamScore;
  const bestPct = best != null ? Math.round((best / EXAM_MAX_SCORE) * 100) : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8">
        {/* Hero */}
        <section className="mb-8">
          <Badge variant="primary" className="mb-3">
            Federación Argentina de Vuelo Libre
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Examen teórico · Piloto Básico{' '}
            <span className="text-sky-500">Nivel 3</span>
          </h1>
          <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-400">
            Preparate con {QUESTIONS.length} preguntas oficiales en 5 temas.
            Simulá el examen real, practicá por tema, repasá tus errores y memorizá
            con flashcards.
          </p>
        </section>

        {/* Stats */}
        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<Trophy className="h-5 w-5 text-amber-500" />}
            label="Mejor simulacro"
            value={
              ready && best != null ? `${best}/${EXAM_MAX_SCORE}` : '—'
            }
            sub={bestPct != null ? `${bestPct}%` : 'Sin intentos'}
          />
          <StatCard
            icon={<Target className="h-5 w-5 text-sky-500" />}
            label="Simulacros"
            value={ready ? String(progress.examsTaken) : '—'}
            sub="completados"
          />
          <StatCard
            icon={<BookOpen className="h-5 w-5 text-emerald-500" />}
            label="Practicadas"
            value={ready ? String(progress.questionsAnswered) : '—'}
            sub="respuestas"
          />
          <StatCard
            icon={<RefreshCcw className="h-5 w-5 text-orange-500" />}
            label="Para repasar"
            value={ready ? String(wrongCount) : '—'}
            sub="preguntas"
          />
        </section>

        {/* Modos */}
        <section className="grid gap-4 sm:grid-cols-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            const badge =
              m.href === '/repaso' && ready && wrongCount > 0
                ? wrongCount
                : null;
            return (
              <Link key={m.href} href={m.href} className="group">
                <Card
                  variant="modern"
                  interactive
                  size="lg"
                  className="h-full"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${m.accent} text-white shadow-sm`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle size="md">{m.title}</CardTitle>
                        {badge != null && (
                          <Badge variant="error">{badge}</Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {m.desc}
                      </CardDescription>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 self-center text-neutral-400 transition-transform group-hover:translate-x-1" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </section>

        {/* Progreso por tema */}
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Tu dominio por tema</h2>
          <Card variant="default" size="lg" spacing="normal">
            <div className="flex flex-col gap-4">
              {SECTIONS.map((s) => {
                const stat = progress.perSection[s];
                const answered = stat?.answered ?? 0;
                const correct = stat?.correct ?? 0;
                const pct =
                  answered > 0 ? Math.round((correct / answered) * 100) : 0;
                return (
                  <div key={s}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{s}</span>
                      <span className="text-neutral-500">
                        {answered > 0
                          ? `${correct}/${answered} · ${pct}%`
                          : `${counts[s] ?? 0} preguntas`}
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      variant={
                        pct >= 75 ? 'success' : pct >= 50 ? 'warning' : 'default'
                      }
                      size="md"
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      </main>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card variant="minimal" size="md" spacing="none">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-medium text-neutral-500">{label}</span>
        </div>
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        <span className="text-xs text-neutral-400">{sub}</span>
      </div>
    </Card>
  );
}
