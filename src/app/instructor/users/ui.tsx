'use client';

import { useState, useTransition } from 'react';
import { KeyRound, Trash2, X, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useT } from '@/i18n/provider';
import { setUserPassword, deleteUser } from './actions';

export function ResetPasswordButton({ email }: { email: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await setUserPassword(email, password);
        setDone(true);
        setPassword('');
        setTimeout(() => {
          setDone(false);
          setOpen(false);
        }, 1200);
      } catch (e) {
        setError(e instanceof Error ? e.message : t('users.error'));
      }
    });
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <KeyRound className="h-4 w-4" />
        {t('users.col.password')}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('users.newPassword')}
        className="w-40 rounded-lg border border-neutral-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
      />
      <Button variant="primary" size="sm" onClick={save} disabled={pending || password.length < 6}>
        {done ? <Check className="h-4 w-4" /> : t('common.save')}
      </Button>
      <button onClick={() => setOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600">
        <X className="h-4 w-4" />
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function DeleteUserButton({ email }: { email: string }) {
  const t = useT();
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!confirm(t('users.deleteConfirm', { email }))) return;
    startTransition(async () => {
      try {
        await deleteUser(email);
      } catch (e) {
        alert(e instanceof Error ? e.message : t('users.error'));
      }
    });
  }

  return (
    <button
      onClick={remove}
      disabled={pending}
      title={t('users.delete')}
      className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:hover:bg-red-900/20"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
