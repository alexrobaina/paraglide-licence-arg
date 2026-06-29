'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { RefreshCcw, Home, CheckCircle2, Sparkles } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import PracticeSession from '@/components/PracticeSession';
import Spinner from '@/components/ui/Spinner';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { QUESTIONS_BY_ID } from '@/lib/questions';
import { useProgress } from '@/lib/storage';
import { useT } from '@/i18n/provider';
import type { Question } from '@/lib/types';

export default function RepasoPage() {
  const t = useT();
  const { progress, ready, recordAnswer } = useProgress();
  const [session, setSession] = useState<Question[] | null>(null);

  // Preguntas a repasar, ordenadas por nº de fallos (desc).
  const queue = useMemo(() => {
    return Object.entries(progress.wrongQueue)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => QUESTIONS_BY_ID[id])
      .filter(Boolean) as Question[];
  }, [progress.wrongQueue]);

  if (!ready) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-3xl justify-center px-4 py-20">
          <Spinner size="lg" variant="primary" />
        </main>
      </>
    );
  }

  if (session) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
          <PracticeSession
            questions={session}
            onAnswer={(q, perfect) => recordAnswer(q.uid, q.section, perfect)}
            onRestart={() => setSession(null)}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
        <Card variant="elevated" size="lg" spacing="normal">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <RefreshCcw className="h-6 w-6" />
            </span>
            <div>
              <CardTitle size="lg">{t('mode.review.title')}</CardTitle>
              <CardDescription>{t('repaso.desc')}</CardDescription>
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-lg font-semibold">{t('repaso.emptyTitle')}</p>
              <p className="max-w-sm text-sm text-neutral-500">
                {t('repaso.emptyDesc')}
              </p>
              <div className="mt-2 flex gap-3">
                <Link href="/practica">
                  <Button>{t('repaso.goPractice')}</Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost">
                    <Home className="h-4 w-4" />
                    {t('common.home')}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="error">{queue.length}</Badge>
                <span className="text-sm text-neutral-500">
                  {t('repaso.count')}
                </span>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={() => setSession(queue)}>
                  <Sparkles className="h-4 w-4" />
                  {t('repaso.reviewAll', { n: queue.length })}
                </Button>
                <Link href="/" className="ml-auto">
                  <Button variant="ghost">
                    <Home className="h-4 w-4" />
                    {t('common.home')}
                  </Button>
                </Link>
              </div>
            </>
          )}
        </Card>
      </main>
    </>
  );
}
