import Link from 'next/link';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function AuthCodeErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card variant="modern" size="lg" className="w-full max-w-md text-center">
        <CardTitle size="lg">El enlace no es válido</CardTitle>
        <CardDescription className="mt-2">
          El enlace mágico expiró o ya fue usado. Solicita uno nuevo para entrar.
        </CardDescription>
        <Link href="/login" className="mt-6 inline-block">
          <Button variant="primary">Volver a iniciar sesión</Button>
        </Link>
      </Card>
    </main>
  );
}
