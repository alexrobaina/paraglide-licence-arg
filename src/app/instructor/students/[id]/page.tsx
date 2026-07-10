import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText, ClipboardList, Plus, Mail, Phone, IdCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getT } from '@/i18n/server';
import { DATE_LOCALE } from '@/i18n/messages';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { Student } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

interface TheoryRow {
  id: string;
  score: number;
  max_score: number;
  passed: boolean;
  finished_at: string;
  template: { title: string } | null;
}
interface PracticalRow {
  id: string;
  status: 'draft' | 'final';
  exam_date: string;
  license_type: string;
  result_declared: boolean | null;
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t, locale } = await getT();
  const supabase = await createClient();

  const { data: student } = await supabase.from('students').select('*').eq('id', id).maybeSingle();
  if (!student) notFound();
  const s = student as Student;

  const [{ data: theory }, { data: practical }] = await Promise.all([
    supabase
      .from('attempts')
      .select('id, score, max_score, passed, finished_at, template:exam_templates(title)')
      .eq('student_id', id)
      .order('finished_at', { ascending: false }),
    supabase
      .from('practical_exams')
      .select('id, status, exam_date, license_type, result_declared')
      .eq('student_id', id)
      .order('exam_date', { ascending: false }),
  ]);

  const theoryRows = (theory as unknown as TheoryRow[]) ?? [];
  const practicalRows = (practical as PracticalRow[]) ?? [];
  const fullName = `${s.last_name}${s.first_name ? `, ${s.first_name}` : ''}`;

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString(DATE_LOCALE[locale]);
  }

  return (
    <>
      <Link href="/instructor/students" className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
        <ArrowLeft className="h-4 w-4" />
        {t('stu.title')}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
          {s.dni && <span className="inline-flex items-center gap-1"><IdCard className="h-4 w-4" />{s.dni}</span>}
          {s.email && <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" />{s.email}</span>}
          {s.phone && <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4" />{s.phone}</span>}
          {s.club && <span>{s.club}</span>}
        </div>
        {s.notes && <p className="mt-2 max-w-2xl text-sm text-neutral-500">{s.notes}</p>}
      </div>

      {/* Prácticos */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
          <ClipboardList className="h-4 w-4" />{t('stu.detail.practical')}
        </h2>
        <Link href={`/instructor/practical/new?student=${s.id}`}>
          <Button variant="primary" size="sm"><Plus className="h-4 w-4" />{t('stu.detail.newPractical')}</Button>
        </Link>
      </div>
      {practicalRows.length === 0 ? (
        <p className="mb-8 text-sm text-neutral-400">{t('stu.detail.noPractical')}</p>
      ) : (
        <div className="mb-8 flex flex-col gap-2">
          {practicalRows.map((p) => (
            <Link key={p.id} href={`/instructor/practical/${p.id}`}>
              <Card variant="default" size="sm" className="flex-row items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{p.license_type}</div>
                  <div className="text-xs text-neutral-400">{fmtDate(p.exam_date)}</div>
                </div>
                <div className="flex items-center gap-2">
                  {p.result_declared != null && (
                    <Badge variant={p.result_declared ? 'success' : 'error'}>
                      {p.result_declared ? t('pr.result.approved') : t('pr.result.failed')}
                    </Badge>
                  )}
                  <Badge variant={p.status === 'final' ? 'default' : 'warning'}>
                    {p.status === 'final' ? t('pr.status.final') : t('pr.status.draft')}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Teóricos */}
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-500">
        <FileText className="h-4 w-4" />{t('stu.detail.theory')}
      </h2>
      {theoryRows.length === 0 ? (
        <p className="text-sm text-neutral-400">{t('stu.detail.noTheory')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {theoryRows.map((a) => (
            <Card key={a.id} variant="default" size="sm" className="flex-row items-center justify-between">
              <div>
                <div className="text-sm font-medium">{a.template?.title ?? '—'}</div>
                <div className="text-xs text-neutral-400">{fmtDate(a.finished_at)}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular-nums text-sm text-neutral-600 dark:text-neutral-400">{a.score}/{a.max_score}</span>
                <Badge variant={a.passed ? 'success' : 'error'}>
                  {a.passed ? t('pr.result.approved') : t('pr.result.failed')}
                </Badge>
                <Link href={`/instructor/results/${a.id}`} className="text-xs text-sky-600 hover:underline">
                  {t('res.detail')}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
