'use client';

import { Check, X, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { useI18n } from '@/i18n/provider';
import { localizeQuestion } from '@/lib/questions';
import type { Question } from '@/lib/types';

interface QuestionCardProps {
  question: Question;
  selected: string[];
  onChange: (letters: string[]) => void;
  revealed?: boolean;
  disabled?: boolean;
  index?: number;
  total?: number;
}

export default function QuestionCard({
  question,
  selected,
  onChange,
  revealed = false,
  disabled = false,
  index,
  total,
}: QuestionCardProps) {
  const { t, ts, locale } = useI18n();
  const lq = localizeQuestion(question, locale);
  const correctCount = lq.options.filter((o) => o.correct).length;
  const isLocked = revealed || disabled;

  function toggle(letter: string) {
    if (isLocked) return;
    if (question.multi) {
      onChange(
        selected.includes(letter)
          ? selected.filter((l) => l !== letter)
          : [...selected, letter]
      );
    } else {
      onChange(selected.includes(letter) ? [] : [letter]);
    }
  }

  return (
    <Card variant="modern" size="lg" className="w-full">
      <div className="flex flex-wrap items-center gap-2">
        {index != null && total != null && (
          <Badge variant="default">
            {t('q.counter', { index: index + 1, total })}
          </Badge>
        )}
        <Badge variant="primary">{ts(question.section)}</Badge>
        <Badge variant={question.multi ? 'warning' : 'outline'}>
          {question.multi
            ? t('q.multi', { n: correctCount })
            : t('q.single')}
        </Badge>
        <span className="ml-auto text-xs text-neutral-400">#{question.id}</span>
      </div>

      <h2 className="mt-1 text-lg font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
        {lq.question}
      </h2>

      <ul className="mt-2 flex flex-col gap-2">
        {lq.options.map((opt) => {
          const isSelected = selected.includes(opt.letter);
          const showCorrect = revealed && opt.correct;
          const showWrong = revealed && isSelected && !opt.correct;

          return (
            <li key={opt.letter}>
              <button
                type="button"
                onClick={() => toggle(opt.letter)}
                disabled={isLocked}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-50 dark:focus:ring-offset-neutral-950',
                  !isLocked &&
                    'hover:border-neutral-400 hover:bg-neutral-50 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/40',
                  isSelected && !revealed
                    ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500/30 dark:bg-sky-950/30'
                    : 'border-neutral-200 dark:border-neutral-800',
                  showCorrect &&
                    'border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-950/30',
                  showWrong &&
                    'border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-950/30',
                  isLocked && 'cursor-default'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-xs font-bold',
                    question.multi ? 'rounded-md' : 'rounded-full',
                    'border',
                    isSelected || showCorrect
                      ? 'border-transparent text-white'
                      : 'border-neutral-300 text-neutral-500 dark:border-neutral-600',
                    showCorrect && 'bg-green-600',
                    showWrong && 'bg-red-600',
                    isSelected && !revealed && 'bg-sky-500',
                    !isSelected && !revealed && 'bg-transparent'
                  )}
                >
                  {showCorrect ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : showWrong ? (
                    <X className="h-3.5 w-3.5" />
                  ) : isSelected ? (
                    question.multi ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Minus className="h-3 w-3 rotate-90" />
                    )
                  ) : (
                    opt.letter
                  )}
                </span>

                <span className="flex-1 text-sm text-neutral-800 dark:text-neutral-200">
                  {opt.text}
                </span>

                {revealed && (
                  <span
                    className={cn(
                      'shrink-0 self-center rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums',
                      opt.score > 0
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    )}
                  >
                    {opt.score > 0 ? `+${opt.score}` : opt.score}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
