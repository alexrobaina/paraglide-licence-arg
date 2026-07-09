import Link from 'next/link';
import { Award, Inbox, ListChecks } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getT } from '@/i18n/server';
import { DATE_LOCALE } from '@/i18n/messages';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface AttemptRow {
  id: string;
  score: number;
  max_score: number;
  passed: boolean;
  finished_at: string;
  student_name: string | null;
  template: { title: string } | null;
  invitation: { student_email: string } | null;
}

export default async function ResultsPage() {
  const { t, locale } = await getT();
  const supabase = await createClient();

  const { data } = await supabase
    .from('attempts')
    .select(
      `id, score, max_score, passed, finished_at, student_name,
       template:exam_templates(title),
       invitation:invitations(student_email)`
    )
    .order('finished_at', { ascending: false });

  const rows = (data as unknown as AttemptRow[]) ?? [];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t('res.title')}</h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          {t('res.subtitle')}
        </p>
      </div>

      {rows.length === 0 ? (
        <Card variant="modern" size="lg" className="text-center">
          <Inbox className="mx-auto h-10 w-10 text-neutral-300 dark:text-neutral-700" />
          <CardTitle size="md" className="mt-3">
            {t('res.empty.title')}
          </CardTitle>
          <CardDescription className="mt-1">
            {t('res.empty.desc')}
          </CardDescription>
        </Card>
      ) : (
        <Card variant="default" size="md" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-400 dark:border-neutral-800">
                <th className="py-2 pr-4 font-medium">{t('res.col.pilot')}</th>
                <th className="py-2 pr-4 font-medium">{t('res.col.exam')}</th>
                <th className="py-2 pr-4 font-medium">{t('res.col.score')}</th>
                <th className="py-2 pr-4 font-medium">{t('res.col.result')}</th>
                <th className="py-2 pr-4 font-medium">{t('res.col.date')}</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/60"
                >
                  <td className="py-3 pr-4 font-medium">
                    {r.student_name ?? r.invitation?.student_email ?? '—'}
                  </td>
                  <td className="py-3 pr-4 text-neutral-600 dark:text-neutral-400">
                    {r.template?.title ?? '—'}
                  </td>
                  <td className="py-3 pr-4 tabular-nums">
                    {r.score}/{r.max_score}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={r.passed ? 'success' : 'error'}>
                      {r.passed ? t('inv.passed') : t('inv.failed')}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-neutral-500">
                    {new Date(r.finished_at).toLocaleDateString(DATE_LOCALE[locale])}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/instructor/results/${r.id}`}>
                        <Button variant="outline" size="sm">
                          <ListChecks className="h-4 w-4" />
                          {t('res.detail')}
                        </Button>
                      </Link>
                      {r.passed && (
                        <Link href={`/diploma/${r.id}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <Award className="h-4 w-4" />
                            {t('res.diploma')}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
