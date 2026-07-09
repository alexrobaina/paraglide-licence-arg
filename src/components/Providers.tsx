'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/messages';

export default function Providers({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>
    </ThemeProvider>
  );
}
