'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mountain, Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

const inputClass =
  'w-full rounded-lg border border-neutral-300 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700';

function translateError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email o contraseña incorrectos.';
  if (m.includes('already registered')) return 'Ese email ya tiene cuenta. Inicia sesión.';
  if (m.includes('at least 6')) return 'La contraseña debe tener al menos 6 caracteres.';
  return msg;
}

function LoginForm() {
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
        setError(translateError(error.message));
        return;
      }
      if (!data.session) {
        setLoading(false);
        setError(
          'Cuenta creada, pero falta desactivar la confirmación por email en Supabase (Auth → Providers → Email → "Confirm email" OFF).'
        );
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword(creds);
      if (error) {
        setLoading(false);
        setError(translateError(error.message));
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
          Ya iniciaste sesión
        </CardTitle>
        <CardDescription className="mt-1">
          Estás conectado como <strong>{sessionEmail}</strong>.
        </CardDescription>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/instructor">
            <Button variant="primary" className="w-full">
              Ir al panel de instructor
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" className="w-full">
              Cerrar sesión
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
          {mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión'}
        </CardTitle>
        <CardDescription className="mt-1">
          {mode === 'signup'
            ? 'Elige una contraseña para tu cuenta.'
            : 'Ingresa con tu email y contraseña.'}
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
            placeholder="tu@email.com"
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
            placeholder="Contraseña (mín. 6)"
            className={inputClass}
          />
        </label>

        {error && (
          <Alert variant="error" title="No se pudo continuar">
            {error}
          </Alert>
        )}

        <Button type="submit" variant="primary" disabled={loading} className="w-full">
          {loading
            ? 'Un momento…'
            : mode === 'signup'
              ? 'Crear cuenta'
              : 'Iniciar sesión'}
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
        {mode === 'login'
          ? '¿No tienes cuenta? Crea una'
          : '¿Ya tienes cuenta? Inicia sesión'}
      </button>

      <Link
        href="/"
        className="mt-4 flex items-center justify-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
