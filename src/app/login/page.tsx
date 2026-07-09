'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mountain, Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import LanguageToggle from '@/components/LanguageToggle';
import { useT } from '@/i18n/provider';
import type { MessageKey } from '@/i18n/messages';

const inputClass =
  'w-full rounded-lg border border-neutral-300 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700';

/** Mapea el error de Supabase a una clave traducible; null = mostrar tal cual. */
function errorKey(msg: string): MessageKey | null {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'login.err.credentials';
  if (m.includes('already registered')) return 'login.err.registered';
  if (m.includes('at least 6')) return 'login.err.short';
  return null;
}

function LoginForm() {
  const t = useT();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setSessionEmail(data.user?.email ?? null));
  }, []);

  async function redirectAfterAuth() {
    if (next) {
      window.location.assign(next);
      return;
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user!.id)
      .single();
    window.location.assign(profile?.role === 'instructor' ? '/instructor' : '/');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const creds = { email: email.trim(), password };

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp(creds);
      if (error) {
        setLoading(false);
        const key = errorKey(error.message);
        setError(key ? t(key) : error.message);
        return;
      }
      if (!data.session) {
        setLoading(false);
        setError(t('login.err.confirmEmail'));
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword(creds);
      if (error) {
        setLoading(false);
        const key = errorKey(error.message);
        setError(key ? t(key) : error.message);
        return;
      }
    }

    await redirectAfterAuth();
  }

  if (sessionEmail) {
    return (
      <Card variant="modern" size="lg" className="w-full max-w-md text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
        <CardTitle size="lg" className="mt-3">
          {t('login.signedIn.title')}
        </CardTitle>
        <CardDescription className="mt-1">
          {t('login.signedIn.as')} <strong>{sessionEmail}</strong>.
        </CardDescription>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/instructor">
            <Button variant="primary" className="w-full">
              {t('login.toPanel')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" className="w-full">
              {t('common.signOut')}
            </Button>
          </form>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="modern" size="lg" className="w-full max-w-md">
      <div className="flex flex-col items-center text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900">
          <Mountain className="h-6 w-6" />
        </span>
        <CardTitle size="lg">
          {mode === 'signup' ? t('login.createAccount') : t('common.signIn')}
        </CardTitle>
        <CardDescription className="mt-1">
          {mode === 'signup' ? t('login.signupDesc') : t('login.loginDesc')}
        </CardDescription>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <label className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('login.emailPlaceholder')}
            className={inputClass}
          />
        </label>
        <label className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('login.passwordPlaceholder')}
            className={inputClass}
          />
        </label>

        {error && (
          <Alert variant="error" title={t('login.errorTitle')}>
            {error}
          </Alert>
        )}

        <Button type="submit" variant="primary" disabled={loading} className="w-full">
          {loading
            ? t('login.wait')
            : mode === 'signup'
              ? t('login.createAccount')
              : t('common.signIn')}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <button
        onClick={() => {
          setMode((m) => (m === 'login' ? 'signup' : 'login'));
          setError(null);
        }}
        className="mt-4 w-full text-center text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
      >
        {mode === 'login' ? t('login.toSignup') : t('login.toLogin')}
      </button>

      <Link
        href="/"
        className="mt-4 flex items-center justify-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('common.backHome')}
      </Link>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col px-4 py-6">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
