'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useT } from '@/i18n/provider';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useT();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t('header.themeToggle')}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {mounted && isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
