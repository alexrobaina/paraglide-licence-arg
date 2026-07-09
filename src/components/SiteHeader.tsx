'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mountain, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { createClient } from '@/lib/supabase/client';
import { useT } from '@/i18n/provider';

export default function SiteHeader() {
  const t = useT();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

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

          {ready && email ? (
            <div className="ml-1 flex items-center gap-1">
              <Link
                href="/instructor"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-neutral-800/60"
                title={email}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden max-w-[140px] truncate sm:inline">{email}</span>
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800/60"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('header.signOut')}</span>
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-1 flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-neutral-50 transition-colors hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">{t('header.access')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
