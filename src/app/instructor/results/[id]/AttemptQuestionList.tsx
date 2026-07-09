import { Check, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { localizeQuestion } from '@/lib/questions';
import { getT } from '@/i18n/server';
import type { Question, QuestionResult } from '@/lib/types';

export interface AttemptEntry {
  question: Question;
  selected: string[];
  result: QuestionResult;
}

/**
 * Read-only render of a graded attempt: every question with each option marked
 * as correct / chosen-by-pilot / wrong, plus the per-question score. Server
 * component — no interactivity; text follows the instructor's chosen language.
 */
export default async function AttemptQuestionList({
  entries,
}: {
  entries: AttemptEntry[];
}) {
  const { t, ts, locale } = await getT();

  return (
    <ol className="flex flex-col gap-4">
      {entries.map(({ question, selected, result }, i) => {
        const answered = selected.length > 0;
        const q = localizeQuestion(question, locale);
        return (
          <li key={q.uid}>
          <Card variant="default" size="md">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="tabular-nums">
                {i + 1}
              </Badge>
              <Badge variant="primary">{ts(q.section)}</Badge>
              <Badge variant={result.perfect ? 'success' : answered ? 'error' : 'warning'}>
                {result.perfect
                  ? t('aq.correct')
                  : answered
                    ? t('aq.incorrect')
                    : t('aq.blank')}
              </Badge>
              <span className="ml-auto text-sm font-semibold tabular-nums text-neutral-500">
                {result.score}/{result.maxScore}
              </span>
            </div>

            <h2 className="mt-2 text-base font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
              {q.question}
            </h2>

            <ul className="mt-3 flex flex-col gap-2">
              {q.options.map((opt) => {
                const chosen = selected.includes(opt.letter);
                const isCorrect = opt.correct;
                const chosenWrong = chosen && !isCorrect;

                return (
                  <li
                    key={opt.letter}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border p-3',
                      isCorrect &&
                        'border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-950/30',
                      chosenWrong &&
                        'border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-950/30',
                      !isCorrect &&
                        !chosenWrong &&
                        'border-neutral-200 dark:border-neutral-800'
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold',
                        isCorrect && 'border-transparent bg-green-600 text-white',
                        chosenWrong && 'border-transparent bg-red-600 text-white',
                        !isCorrect &&
                          !chosenWrong &&
                          'border-neutral-300 text-neutral-500 dark:border-neutral-600'
                      )}
                    >
                      {isCorrect ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : chosenWrong ? (
                        <X className="h-3.5 w-3.5" />
                      ) : (
                        opt.letter
                      )}
                    </span>

                    <span className="flex-1 text-sm text-neutral-800 dark:text-neutral-200">
                      {opt.text}
                    </span>

                    {chosen && (
                      <Badge
                        variant={isCorrect ? 'success' : 'error'}
                        className="shrink-0 self-center"
                      >
                        {t('aq.chosen')}
                      </Badge>
                    )}

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
                  </li>
                );
              })}
            </ul>
          </Card>
          </li>
        );
      })}
    </ol>
  );
}
