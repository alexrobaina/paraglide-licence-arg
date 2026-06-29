'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, XCircle, CheckCircle2, RotateCcw, Home } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import QuestionCard from '@/components/QuestionCard';
import { formatTime } from '@/lib/scoring';
import { useI18n } from '@/i18n/provider';
import type { ExamResult, Section } from '@/lib/types';

export default function ExamResults({
  result,
  onRetry,
}: {
  result: ExamResult;
  onRetry: () => void;
}) {
  const { t, ts } = useI18n();
  const [showReview, setShowReview] = useState(false);
  const pct = Math.round((result.total / result.maxTotal) * 100);

  return (
    <div className="flex flex-col gap-6">
      <Card
        variant="elevated"
        size="lg"
        className="text-center"
        spacing="normal"
      >
        <div className="flex flex-col items-center gap-3">
          {result.passed ? (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
            </span>
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </span>
          )}
          <Badge variant={result.passed ? 'success' : 'error'}>
            {result.passed ? t('result.passed') : t('result.failed')}
          </Badge>
          <div>
            <p className="text-5xl font-bold tabular-nums">
              {result.total}
              <span className="text-2xl text-neutral-400">
                /{result.maxTotal}
              </span>
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              {t('result.needPass', { pct, pass: result.passMark })}
            </p>
          </div>
          <div className="w-full max-w-md">
            <Progress
              value={result.total}
              max={result.maxTotal}
              variant={result.passed ? 'success' : 'error'}
              size="lg"
            />
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm text-neutral-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {t('result.perfect', { n: result.correctCount })}
            </span>
            <span>·</span>
            <span>
              {t('result.withError', {
                n: result.questionCount - result.correctCount,
              })}
            </span>
            <span>·</span>
            <span>⏱ {formatTime(result.elapsedMs)}</span>
          </div>
        </div>
      </Card>

      {/* Desglose por tema */}
      <Card variant="default" size="lg">
        <CardTitle size="md">{t('result.breakdown')}</CardTitle>
        <div className="mt-3 flex flex-col gap-4">
          {Object.entries(result.perSection).map(([sec, s]) => {
            const p = Math.round((s.correct / s.total) * 100);
            return (
              <div key={sec}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{ts(sec as Section)}</span>
                  <span className="text-neutral-500">
                    {s.correct}/{s.total} · {p}%
                  </span>
                </div>
                <Progress
                  value={p}
                  variant={p >= 75 ? 'success' : p >= 50 ? 'warning' : 'error'}
                  size="sm"
                />
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={onRetry} variant="primary">
          <RotateCcw className="h-4 w-4" />
          {t('result.newExam')}
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowReview((v) => !v)}
        >
          {showReview ? t('result.hideReview') : t('result.showReview')}
        </Button>
        <Link href="/" className="ml-auto">
          <Button variant="ghost">
            <Home className="h-4 w-4" />
            {t('common.home')}
          </Button>
        </Link>
      </div>

      {showReview && (
        <div className="flex flex-col gap-4">
          {result.details.map((d, i) => (
            <QuestionCard
              key={d.questionId}
              question={d.question}
              selected={d.selected}
              onChange={() => {}}
              revealed
              index={i}
              total={result.details.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
