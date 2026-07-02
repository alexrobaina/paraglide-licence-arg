'use client';

import { useState, useTransition } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { addInstructor, removeInstructor } from './actions';

export function AddInstructorForm() {
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
        setError(err instanceof Error ? err.message : 'No se pudo agregar.');
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
        placeholder="email@instructor.com"
        className="flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
      />
      <Button type="submit" variant="primary" disabled={pending || !email.trim()}>
        <UserPlus className="h-4 w-4" />
        {pending ? 'Agregando…' : 'Agregar instructor'}
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
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      try {
        await removeInstructor(email);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'No se pudo quitar.');
      }
    });
  }

  return (
    <button
      onClick={handleRemove}
      disabled={pending || disabled}
      title={disabled ? 'No puedes quitarte a ti mismo' : 'Quitar instructor'}
      className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-900/20"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
