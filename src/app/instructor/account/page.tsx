'use client';

import { useEffect, useState } from 'react';
import { Lock, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useT } from '@/i18n/provider';

export default function AccountPage() {
  const t = useT();
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (password.length < 6) return setError(t('account.tooShort'));
    if (password !== confirm) return setError(t('account.mismatch'));

    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    setDone(true);
    setPassword('');
    setConfirm('');
  }

  const inputClass =
    'w-full rounded-lg border border-neutral-300 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700';

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t('account.title')}</h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          {email && (
            <>
              {t('account.session')}: <strong>{email}</strong>
            </>
          )}
        </p>
      </div>

      <Card variant="modern" size="lg">
        <CardTitle size="sm">{t('account.changePassword')}</CardTitle>
        <CardDescription className="mb-4 mt-1">
          {t('account.changeDesc')}
        </CardDescription>

        <form onSubmit={save} className="flex flex-col gap-3">
          <label className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('account.newPassword')}
              className={inputClass}
            />
          </label>
          <label className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={t('account.repeatPassword')}
              className={inputClass}
            />
          </label>

          {error && <Alert variant="error">{error}</Alert>}
          {done && (
            <Alert variant="success">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4" /> {t('account.updated')}
              </span>
            </Alert>
          )}

          <Button type="submit" variant="primary" disabled={loading} className="w-full">
            {loading ? t('common.saving') : t('account.save')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
