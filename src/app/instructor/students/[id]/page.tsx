import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FileText, ClipboardList, Plus, Mail, Phone, IdCard, Award, Link2 } from 'lucide-react';
import BackLink from '@/components/BackLink';
import { createClient } from '@/lib/supabase/server';
import { getT } from '@/i18n/server';
import { DATE_LOCALE } from '@/i18n/messages';
import { Card, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { summarizeLicencesByLevel } from '@/lib/practical/licence';
import { LicenceLadder } from './LicenceLadder';
import type { LadderRung } from './LicenceLadder';
import type { Student } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

interface TheoryRow {
  id: string;
  score: number;
  max_score: number;
  passed: boolean;
  finished_at: string;
  template: { title: string; license_level: string | null } | null;
}
interface PracticalRow {
  id: string;
  status: 'draft' | 'final';
  exam_date: string;
  license_type: string;
  license_level: string | null;
  result_declared: boolean | null;
  attempt_id: string | null;
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

  const [{ data: theory }, { data: practical }, { data: templatesData }] = await Promise.all([
    supabase
      .from('attempts')
      .select('id, score, max_score, passed, finished_at, template:exam_templates(title, license_level)')
      .eq('student_id', id)
      .order('finished_at', { ascending: false }),
    supabase
      .from('practical_exams')
      .select('id, status, exam_date, license_type, license_level, result_declared, attempt_id')
      .eq('student_id', id)
      .order('exam_date', { ascending: false }),
    supabase
      .from('exam_templates')
      .select('id, title, license_level')
      .order('created_at', { ascending: false }),
  ]);

  const templates = (templatesData as { id: string; title: string; license_level: string | null }[]) ?? [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const theoryRows = (theory as unknown as TheoryRow[]) ?? [];
  const practicalRows = (practical as PracticalRow[]) ?? [];
  const fullName = `${s.last_name}${s.first_name ? `, ${s.first_name}` : ''}`;

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString(DATE_LOCALE[locale]);
  }

  const licences = summarizeLicencesByLevel(
    theoryRows.map((a) => ({ level: a.template?.license_level ?? null, passed: a.passed, date: a.finished_at })),
    practicalRows.map((p) => ({ level: p.license_level, status: p.status, result_declared: p.result_declared, date: p.exam_date })),
  );
  const theoryTitleById = new Map(theoryRows.map((a) => [a.id, a.template?.title ?? 'Examen teórico']));

  // The exams that best represent each level's licence, + the theory templates
  // available for that level (used by the per-rung invite).
  const templatesByLevel = new Map<string, { id: string; title: string }[]>();
  for (const tpl of templates) {
    if (!tpl.license_level) continue;
    const arr = templatesByLevel.get(tpl.license_level) ?? [];
    arr.push({ id: tpl.id, title: tpl.title });
    templatesByLevel.set(tpl.license_level, arr);
  }
  // Which exam to show in each block: the PASSING one when the leg is passed
  // (so a green "Otorgada" rung never displays a red exam), otherwise the LATEST
  // attempt (so after a fail the instructor sees the last try and can re-invite).
  // Rows are already sorted newest-first, so `.find` picks the newest match.
  const repTheory = (level: string | null) => {
    const list = theoryRows.filter((a) => (a.template?.license_level ?? null) === level);
    return list.find((a) => a.passed) ?? list[0] ?? null;
  };
  const repPractical = (level: string | null) => {
    const list = practicalRows.filter((p) => p.license_level === level);
    return list.find((p) => p.status === 'final' && p.result_declared === true) ?? list[0] ?? null;
  };

  const rungs: LadderRung[] = licences.map((lic) => {
    const th = repTheory(lic.level);
    const pr = repPractical(lic.level);
    return {
      level: lic.level,
      label: lic.label,
      status: lic.status,
      grantedAt: lic.grantedAt ? fmtDate(lic.grantedAt) : null,
      theory: th
        ? { passed: th.passed, score: th.score, maxScore: th.max_score, date: fmtDate(th.finished_at), attemptId: th.id }
        : null,
      practical: pr
        ? { status: pr.status, resultDeclared: pr.result_declared, date: fmtDate(pr.exam_date), examId: pr.id }
        : null,
      templates: lic.level ? templatesByLevel.get(lic.level) ?? [] : [],
    };
  });

  return (
    <>
      <BackLink fallback="/instructor/students" label={t('common.back')} />

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

      {/* Progresión de licencias — escalera accionable (Alumno → N3 → N4 → N5) */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
          <Award className="h-4 w-4" />{t('lic.title')}
        </h2>
        <Link href="/instructor/invite" className="text-xs text-sky-600 hover:underline">
          {t('lic.allInvites')}
        </Link>
      </div>
      <div className="mb-8">
        <LicenceLadder rungs={rungs} studentId={s.id} studentEmail={s.email} siteUrl={siteUrl} />
      </div>

      {/* Historial de prácticos */}
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
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400">
                    <Link2 className="h-3 w-3" />
                    {p.attempt_id
                      ? `${t('lic.linkedTheory')}: ${theoryTitleById.get(p.attempt_id) ?? '—'}`
                      : t('lic.noLink')}
                  </div>
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
