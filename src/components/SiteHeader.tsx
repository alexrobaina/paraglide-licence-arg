'use client';

import Link from 'next/link';
import { Mountain } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/60 bg-neutral-50/80 backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900">
            <Mountain className="h-5 w-5" />
          </span>
          <span className="tracking-tight">
            Paraglide<span className="text-sky-500">Exam</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
