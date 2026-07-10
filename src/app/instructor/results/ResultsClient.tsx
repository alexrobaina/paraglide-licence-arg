'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ListChecks } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n/provider';
import { DATE_LOCALE } from '@/i18n/messages';
import { levelLabel } from '@/lib/practical/levels';

export interface ResultRow {
  id: string;
  pilot: string;
  student_id: string | null;
  exam: string;
  level: string | null;
  score: number;
  max_score: number;
  passed: boolean;
  finished_at: string;
}

type Filter = 'all' | 'passed' | 'failed';

export function ResultsClient({ rows }: { rows: ResultRow[] }) {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === 'passed' && !r.passed) return false;
      if (filter === 'failed' && r.passed) return false;
      if (!q) return true;
      return `${r.pilot} ${r.exam}`.toLowerCase().includes(q);
    });
  }, [rows, query, filter]);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: t('res.filter.all') },
    { key: 'passed', label: t('res.filter.passed') },
    { key: 'failed', label: t('res.filter.failed') },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t('res.title')}</h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('res.subtitle')}</p>
      </div>

      {rows.length === 0 ? (
        <Card variant="modern" size="lg" className="text-center">
          <ListChecks className="mx-auto h-10 w-10 text-neutral-300 dark:text-neutral-700" />
          <CardTitle size="md" className="mt-3">{t('res.empty.title')}</CardTitle>
          <CardDescription className="mt-1">{t('res.empty.desc')}</CardDescription>
        </Card>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('res.search')}
                className="w-full rounded-lg border border-neutral-300 bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
              />
            </div>
            <div className="inline-flex overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-2 text-sm transition-colors ${
                    filter === f.key
                      ? 'bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900'
                      : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-neutral-400">
              {t('res.count', { n: filtered.length, total: rows.length })}
            </span>
          </div>

          <Card variant="default" size="md" className="overflow-x-auto">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-400">{t('res.noMatch')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-400 dark:border-neutral-800">
                    <th className="py-2 pr-4 font-medium">{t('res.col.pilot')}</th>
                    <th className="py-2 pr-4 font-medium">{t('res.col.exam')}</th>
                    <th className="py-2 pr-4 font-medium">{t('res.col.level')}</th>
                    <th className="py-2 pr-4 font-medium">{t('res.col.score')}</th>
                    <th className="py-2 pr-4 font-medium">{t('res.col.result')}</th>
                    <th className="py-2 pr-4 font-medium">{t('res.col.date')}</th>
                    <th className="py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/60">
                      <td className="py-3 pr-4 font-medium">
                        {r.student_id ? (
                          <Link href={`/instructor/students/${r.student_id}`} className="hover:underline">{r.pilot}</Link>
                        ) : r.pilot}
                      </td>
                      <td className="py-3 pr-4 text-neutral-600 dark:text-neutral-400">{r.exam}</td>
                      <td className="py-3 pr-4">
                        {r.level ? <Badge variant="default">{levelLabel(r.level)}</Badge> : <span className="text-neutral-400">—</span>}
                      </td>
                      <td className="py-3 pr-4 tabular-nums">{r.score}/{r.max_score}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={r.passed ? 'success' : 'error'}>
                          {r.passed ? t('inv.passed') : t('inv.failed')}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-neutral-500">
                        {new Date(r.finished_at).toLocaleDateString(DATE_LOCALE[locale])}
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end">
                          <Link href={`/instructor/results/${r.id}`}>
                            <Button variant="outline" size="sm"><ListChecks className="h-4 w-4" />{t('res.detail')}</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}
    </>
  );
}
