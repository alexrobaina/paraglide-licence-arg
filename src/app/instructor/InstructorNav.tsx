'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LogOut,
  Mountain,
  LayoutDashboard,
  FileText,
  Send,
  BarChart3,
  Users,
  GraduationCap,
  UserCog,
  UserCircle,
} from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { useT } from '@/i18n/provider';
import type { MessageKey } from '@/i18n/messages';

const BASE_LINKS = [
  { href: '/instructor', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { href: '/instructor/templates', icon: FileText, labelKey: 'nav.exams' },
  { href: '/instructor/invite', icon: Send, labelKey: 'nav.invite' },
  { href: '/instructor/students', icon: GraduationCap, labelKey: 'nav.students' },
  { href: '/instructor/results', icon: BarChart3, labelKey: 'nav.results' },
  { href: '/instructor/team', icon: Users, labelKey: 'nav.instructors' },
] satisfies NavLink[];

type NavLink = {
  href: string;
  icon: typeof LayoutDashboard;
  labelKey: MessageKey;
};

function Brand() {
  const t = useT();
  return (
    <Link href="/instructor" className="flex shrink-0 items-center gap-2 font-semibold">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900">
        <Mountain className="h-5 w-5" />
      </span>
      <span className="tracking-tight">
        Paraglide<span className="text-sky-500">Exam</span>
        <span className="ml-1.5 text-xs font-normal text-neutral-400">
          {t('nav.brandRole')}
        </span>
      </span>
    </Link>
  );
}

function NavLinks({
  links,
  pathname,
  onNavigate,
}: {
  links: NavLink[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const t = useT();
  return (
    <nav className="flex flex-col gap-1">
      {links.map((l) => {
        const Icon = l.icon;
        const active =
          l.href === '/instructor'
            ? pathname === l.href
            : pathname === l.href || pathname.startsWith(l.href + '/');
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? 'bg-neutral-200/70 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50'
                : 'text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800/60'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {t(l.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

function SignOutButton() {
  const t = useT();
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800/60"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {t('common.exit')}
      </button>
    </form>
  );
}

export default function InstructorNav({ isAdmin }: { isAdmin: boolean }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links: NavLink[] = [
    ...BASE_LINKS,
    ...(isAdmin
      ? [{ href: '/instructor/users', icon: UserCog, labelKey: 'nav.users' as const }]
      : []),
    { href: '/instructor/account', icon: UserCircle, labelKey: 'nav.account' },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-neutral-200/60 bg-neutral-50/80 backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-950/80 lg:flex print:hidden">
        <div className="flex h-16 items-center border-b border-neutral-200/60 px-5 dark:border-neutral-800/60">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks links={links} pathname={pathname} />
        </div>
        <div className="flex flex-col gap-2 border-t border-neutral-200/60 px-3 py-3 dark:border-neutral-800/60">
          <div className="flex items-center gap-1 px-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200/60 bg-neutral-50/80 px-4 py-3 backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-950/80 lg:hidden print:hidden">
        <Brand />
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            aria-label={t('nav.openMenu')}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800/60"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col border-r border-neutral-200/60 bg-neutral-50 dark:border-neutral-800/60 dark:bg-neutral-950">
            <div className="flex h-16 items-center justify-between border-b border-neutral-200/60 px-4 dark:border-neutral-800/60">
              <Brand />
              <button
                onClick={() => setOpen(false)}
                aria-label={t('nav.closeMenu')}
                className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <NavLinks links={links} pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-neutral-200/60 px-3 py-3 dark:border-neutral-800/60">
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
