import Link from 'next/link';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getT } from '@/i18n/server';

export default async function AuthCodeErrorPage() {
  const { t } = await getT();
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card variant="modern" size="lg" className="w-full max-w-md text-center">
        <CardTitle size="lg">{t('authErr.title')}</CardTitle>
        <CardDescription className="mt-2">{t('authErr.desc')}</CardDescription>
        <Link href="/login" className="mt-6 inline-block">
          <Button variant="primary">{t('authErr.back')}</Button>
        </Link>
      </Card>
    </main>
  );
}
