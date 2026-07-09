'use client';

import { useState, useTransition } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useT } from '@/i18n/provider';
import { addInstructor, removeInstructor } from './actions';

export function AddInstructorForm() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await addInstructor(email);
        setEmail('');
      } catch (err) {
        setError(err instanceof Error ? err.message : t('team.addError'));
      }
    });
  }

  return (
    <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('team.emailPlaceholder')}
        className="flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
      />
      <Button type="submit" variant="primary" disabled={pending || !email.trim()}>
        <UserPlus className="h-4 w-4" />
        {pending ? t('team.adding') : t('team.add')}
      </Button>
      {error && (
        <Alert variant="error" className="sm:w-full">
          {error}
        </Alert>
      )}
    </form>
  );
}

export function RemoveInstructorButton({
  email,
  disabled,
}: {
  email: string;
  disabled?: boolean;
}) {
  const t = useT();
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      try {
        await removeInstructor(email);
      } catch (err) {
        alert(err instanceof Error ? err.message : t('team.removeError'));
      }
    });
  }

  return (
    <button
      onClick={handleRemove}
      disabled={pending || disabled}
      title={disabled ? t('team.removeSelf') : t('team.remove')}
      className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-900/20"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
