'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function SetupPage() {
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
          Configuración inicial
        </CardTitle>
        <CardDescription className="mt-1">
          Reclama tu rol de instructor. Solo funciona si tu email está en la lista
          autorizada.
        </CardDescription>

        {checking ? (
          <p className="mt-6 text-sm text-neutral-500">Cargando…</p>
        ) : !email ? (
          <div className="mt-6">
            <Alert variant="warning">Primero inicia sesión.</Alert>
            <Link href="/login" className="mt-3 inline-block">
              <Button variant="primary">
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </Button>
            </Link>
          </div>
        ) : result ? (
          <div className="mt-6">
            {result === 'instructor' ? (
              <Alert variant="success" title="¡Listo!">
                Ahora eres <strong>instructor</strong>.
              </Alert>
            ) : (
              <Alert variant="info" title="Rol asignado">
                Tu rol quedó como <strong>{result}</strong>. Tu email no está en la
                lista de instructores.
              </Alert>
            )}
            <Link href="/instructor" className="mt-3 inline-block">
              <Button variant="primary">
                Ir al panel de instructor
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            <p className="text-sm text-neutral-500">
              Sesión: <strong>{email}</strong>
            </p>
            {error && <Alert variant="error">{error}</Alert>}
            <Button variant="primary" onClick={claim} disabled={loading} className="w-full">
              {loading ? 'Reclamando…' : 'Reclamar rol de instructor'}
            </Button>
          </div>
        )}
      </Card>
    </main>
  );
}
