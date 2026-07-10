'use client';

import { useState, useTransition } from 'react';
import { Save, X } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useT } from '@/i18n/provider';
import { createStudent, updateStudent, type StudentFormInput } from './actions';
import type { Student } from '@/lib/supabase/types';

const EMPTY: StudentFormInput = {
  last_name: '', first_name: '', dni: '', email: '', club: '', phone: '', notes: '',
};

function fromStudent(s: Student): StudentFormInput {
  return {
    last_name: s.last_name, first_name: s.first_name,
    dni: s.dni ?? '', email: s.email ?? '', club: s.club ?? '',
    phone: s.phone ?? '', notes: s.notes ?? '',
  };
}

export function StudentForm({
  student,
  onClose,
}: {
  student?: Student;
  onClose: () => void;
}) {
  const t = useT();
  const [form, setForm] = useState<StudentFormInput>(student ? fromStudent(student) : EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof StudentFormInput>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.last_name.trim()) {
      setError(t('stu.form.lastNameRequired'));
      return;
    }
    startTransition(async () => {
      try {
        if (student) await updateStudent(student.id, form);
        else await createStudent(form);
        onClose();
      } catch {
        setError(t('stu.form.error'));
      }
    });
  }

  const field =
    'w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700';
  const label = 'mb-1 block text-xs font-medium text-neutral-500';

  return (
    <Card variant="modern" size="lg">
      <div className="flex items-center justify-between">
        <CardTitle size="sm">
          {student ? t('stu.form.editTitle') : t('stu.form.newTitle')}
        </CardTitle>
        <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="sm:col-span-1">
          <span className={label}>{t('stu.form.lastName')} *</span>
          <input className={field} value={form.last_name} onChange={(e) => set('last_name', e.target.value)} autoFocus />
        </label>
        <label>
          <span className={label}>{t('stu.form.firstName')}</span>
          <input className={field} value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
        </label>
        <label>
          <span className={label}>{t('stu.form.dni')}</span>
          <input className={field} value={form.dni} onChange={(e) => set('dni', e.target.value)} inputMode="numeric" />
        </label>
        <label>
          <span className={label}>{t('stu.form.email')}</span>
          <input className={field} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </label>
        <label>
          <span className={label}>{t('stu.form.club')}</span>
          <input className={field} value={form.club} onChange={(e) => set('club', e.target.value)} />
        </label>
        <label>
          <span className={label}>{t('stu.form.phone')}</span>
          <input className={field} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </label>
        <label className="sm:col-span-2">
          <span className={label}>{t('stu.form.notes')}</span>
          <textarea className={field} rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </label>

        {error && <div className="sm:col-span-2"><Alert variant="error">{error}</Alert></div>}

        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="primary" disabled={pending}>
            <Save className="h-4 w-4" />
            {pending ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
