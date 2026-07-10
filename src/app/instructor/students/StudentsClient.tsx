'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { GraduationCap, Plus, Download, Search, Pencil, Trash2, FileText, ClipboardList } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { useT } from '@/i18n/provider';
import { StudentForm } from './StudentForm';
import { backfillStudents, deleteStudent } from './actions';
import type { Student } from '@/lib/supabase/types';

export interface StudentRow extends Student {
  theory_count: number;
  practical_count: number;
}

export function StudentsClient({
  rows,
  canBackfill,
}: {
  rows: StudentRow[];
  canBackfill: boolean;
}) {
  const t = useT();
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.last_name, r.first_name, r.dni, r.email, r.club]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  function runBackfill() {
    setNote(null);
    startTransition(async () => {
      const res = await backfillStudents();
      setNote(t('stu.backfill.done', { created: res.created, linked: res.linked }));
    });
  }

  function remove(s: Student) {
    const name = `${s.last_name} ${s.first_name}`.trim();
    if (!confirm(t('stu.delete.confirm', { name }))) return;
    startTransition(() => deleteStudent(s.id));
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('stu.title')}</h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('stu.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {canBackfill && (
            <Button variant="outline" onClick={runBackfill} disabled={pending}>
              <Download className="h-4 w-4" />
              {pending ? t('stu.backfill.running') : t('stu.backfill')}
            </Button>
          )}
          <Button variant="primary" onClick={() => { setEditing(null); setCreating(true); }}>
            <Plus className="h-4 w-4" />
            {t('stu.new')}
          </Button>
        </div>
      </div>

      {note && <div className="mb-4"><Alert variant="success">{note}</Alert></div>}

      {(creating || editing) && (
        <div className="mb-4">
          <StudentForm
            student={editing ?? undefined}
            onClose={() => { setCreating(false); setEditing(null); }}
          />
        </div>
      )}

      {rows.length > 0 && (
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('stu.search')}
            className="w-full rounded-lg border border-neutral-300 bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
          />
        </div>
      )}

      {rows.length === 0 ? (
        <Card variant="modern" size="lg" className="text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-neutral-300 dark:text-neutral-700" />
          <CardTitle size="md" className="mt-3">{t('stu.empty.title')}</CardTitle>
          <CardDescription className="mt-1">{t('stu.empty.desc')}</CardDescription>
        </Card>
      ) : (
        <Card variant="default" size="md" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-400 dark:border-neutral-800">
                <th className="py-2 pr-4 font-medium">{t('stu.col.name')}</th>
                <th className="py-2 pr-4 font-medium">{t('stu.col.dni')}</th>
                <th className="py-2 pr-4 font-medium">{t('stu.col.club')}</th>
                <th className="py-2 pr-4 font-medium">{t('stu.col.exams')}</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/60">
                  <td className="py-3 pr-4 font-medium">
                    <Link href={`/instructor/students/${s.id}`} className="hover:underline">
                      {s.last_name}{s.first_name ? `, ${s.first_name}` : ''}
                    </Link>
                    {s.email && <div className="text-xs font-normal text-neutral-400">{s.email}</div>}
                  </td>
                  <td className="py-3 pr-4 tabular-nums text-neutral-600 dark:text-neutral-400">{s.dni ?? '—'}</td>
                  <td className="py-3 pr-4 text-neutral-600 dark:text-neutral-400">{s.club ?? '—'}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="default"><FileText className="mr-1 inline h-3 w-3" />{s.theory_count}</Badge>
                      <Badge variant="default"><ClipboardList className="mr-1 inline h-3 w-3" />{s.practical_count}</Badge>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setCreating(false); setEditing(s); }}
                        title={t('common.edit')}
                        className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(s)}
                        disabled={pending}
                        title={t('common.delete')}
                        className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
