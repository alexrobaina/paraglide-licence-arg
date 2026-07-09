import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import { getLocale, getT } from '@/i18n/server';

/** Título/descripción siguen el idioma elegido (cookie), igual que la UI. */
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
