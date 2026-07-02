'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mountain, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setSessionEmail(data.user?.email ?? null));
  }, []);

  // Already signed in — don't ask for a magic link again.
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
          <Link href="/">
            <Button variant="ghost" className="w-full">
              Ir al inicio
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const redirectTo = new URL('/auth/callback', window.location.origin);
    if (next) redirectTo.searchParams.set('next', next);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo.toString() },
    });

    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <Card variant="modern" size="lg" className="w-full max-w-md">
      <div className="flex flex-col items-center text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900">
          <Mountain className="h-6 w-6" />
        </span>
        <CardTitle size="lg">Iniciar sesión</CardTitle>
        <CardDescription className="mt-1">
          Te enviaremos un enlace mágico a tu email para entrar sin contraseña.
        </CardDescription>
      </div>

      {sent ? (
        <Alert variant="success" title="Revisa tu email" className="mt-6">
          Enviamos un enlace de acceso a <strong>{email}</strong>. Ábrelo en este
          dispositivo para iniciar sesión.
        </Alert>
      ) : (
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
              className="w-full rounded-lg border border-neutral-300 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-700 dark:focus:border-neutral-500"
            />
          </label>

          {error && (
            <Alert variant="error" title="No se pudo enviar">
              {error}
            </Alert>
          )}

          <Button type="submit" variant="primary" disabled={loading} className="w-full">
            {loading ? 'Enviando…' : 'Enviar enlace mágico'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
      )}
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
