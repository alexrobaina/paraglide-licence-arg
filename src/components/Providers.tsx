'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { I18nProvider } from '@/i18n/provider';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  );
}
