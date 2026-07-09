import { Progress } from '@/components/ui/Progress';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { AttemptEntry } from './AttemptQuestionList';

type SectionStat = { section: string; total: number; correct: number; blank: number };

function variantFor(pct: number): 'success' | 'warning' | 'error' {
  if (pct >= 0.8) return 'success';
  if (pct >= 0.5) return 'warning';
  return 'error';
}

/**
 * Per-topic performance for a graded attempt: overall correct/wrong/blank tally
 * plus a per-section breakdown ordered weakest-first, so the instructor sees at
 * a glance which topics the pilot needs to study. Server component.
 */
export default function AttemptStats({ entries }: { entries: AttemptEntry[] }) {
  const total = entries.length;
  const correct = entries.filter((e) => e.result.perfect).length;
  const answered = entries.filter((e) => e.selected.length > 0).length;
  const wrong = answered - correct;
  const blank = total - answered;

  const bySection = new Map<string, SectionStat>();
  for (const e of entries) {
    const s = e.question.section;
    const b = bySection.get(s) ?? { section: s, total: 0, correct: 0, blank: 0 };
    b.total += 1;
    if (e.result.perfect) b.correct += 1;
    if (e.selected.length === 0) b.blank += 1;
    bySection.set(s, b);
  }

  const sections = [...bySection.values()]
    .map((b) => ({ ...b, pct: b.total ? b.correct / b.total : 0 }))
    .sort((a, b) => a.pct - b.pct);

  return (
    <Card variant="modern" size="lg" className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold">Desempeño por tema</h2>
        <div className="ml-auto flex flex-wrap gap-1.5">
          <Badge variant="success">{correct} correctas</Badge>
          <Badge variant="error">{wrong} incorrectas</Badge>
          {blank > 0 && <Badge variant="warning">{blank} sin responder</Badge>}
        </div>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        Temas ordenados de más flojo a más fuerte — enfoca el repaso en los primeros.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {sections.map((s) => {
          const pct = Math.round(s.pct * 100);
          return (
            <div key={s.section}>
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{s.section}</span>
                  {s.pct < 0.5 && <Badge variant="error">A reforzar</Badge>}
                  {s.blank > 0 && (
                    <span className="text-xs text-neutral-400">
                      {s.blank} sin responder
                    </span>
                  )}
                </span>
                <span className="shrink-0 tabular-nums text-neutral-500">
                  {s.correct}/{s.total} · {pct}%
                </span>
              </div>
              <Progress value={s.correct} max={s.total} variant={variantFor(s.pct)} size="md" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
