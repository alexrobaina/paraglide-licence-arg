'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useT } from '@/i18n/provider';

export default function SetupPage() {
  const t = useT();
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        setEmail(data.user?.email ?? null);
        setChecking(false);
      });
  }, []);

  async function claim() {
    setLoading(true);
    setError(null);
    const { data, error } = await createClient().rpc('claim_instructor');
    setLoading(false);
    if (error) setError(error.message);
    else setResult(data as string);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card variant="modern" size="lg" className="w-full max-w-md text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-emerald-500" />
        <CardTitle size="lg" className="mt-3">
          {t('setup.title')}
        </CardTitle>
        <CardDescription className="mt-1">{t('setup.desc')}</CardDescription>

        {checking ? (
          <p className="mt-6 text-sm text-neutral-500">{t('common.loading')}</p>
        ) : !email ? (
          <div className="mt-6">
            <Alert variant="warning">{t('setup.signInFirst')}</Alert>
            <Link href="/login" className="mt-3 inline-block">
              <Button variant="primary">
                <LogIn className="h-4 w-4" />
                {t('common.signIn')}
              </Button>
            </Link>
          </div>
        ) : result ? (
          <div className="mt-6">
            {result === 'instructor' ? (
              <Alert variant="success" title={t('setup.done')}>
                {t('setup.nowInstructor')}
              </Alert>
            ) : (
              <Alert variant="info" title={t('setup.roleAssigned')}>
                {t('setup.roleDesc', { role: result })}
              </Alert>
            )}
            <Link href="/instructor" className="mt-3 inline-block">
              <Button variant="primary">
                {t('login.toPanel')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            <p className="text-sm text-neutral-500">
              {t('account.session')}: <strong>{email}</strong>
            </p>
            {error && <Alert variant="error">{error}</Alert>}
            <Button variant="primary" onClick={claim} disabled={loading} className="w-full">
              {loading ? t('setup.claiming') : t('setup.claim')}
            </Button>
          </div>
        )}
      </Card>
    </main>
  );
}
