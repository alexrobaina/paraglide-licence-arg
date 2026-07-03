'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  FileText,
  Send,
  BarChart3,
  Users,
  UserCog,
  UserCircle,
} from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';

const BASE_LINKS = [
  { href: '/instructor', icon: LayoutDashboard, label: 'Panel' },
  { href: '/instructor/templates', icon: FileText, label: 'Exámenes' },
  { href: '/instructor/invite', icon: Send, label: 'Invitar' },
  { href: '/instructor/results', icon: BarChart3, label: 'Resultados' },
  { href: '/instructor/team', icon: Users, label: 'Instructores' },
];

export default function InstructorNav({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    ...BASE_LINKS,
    ...(isAdmin ? [{ href: '/instructor/users', icon: UserCog, label: 'Usuarios' }] : []),
    { href: '/instructor/account', icon: UserCircle, label: 'Mi cuenta' },
  ];

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-1 text-sm lg:flex">
        {links.map((l) => {
          const Icon = l.icon;
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors ${
                active
                  ? 'bg-neutral-200/70 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50'
                  : 'text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden xl:inline">{l.label}</span>
            </Link>
          );
        })}
        <span className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-800" />
        <LanguageToggle />
        <ThemeToggle />
        <SignOutButton />
      </nav>

      {/* Mobile: toggles + hamburger */}
      <div className="flex items-center gap-1 lg:hidden">
        <LanguageToggle />
        <ThemeToggle />
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Menú"
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800/60"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-neutral-200/60 bg-neutral-50/95 backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-950/95 lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((l) => {
              const Icon = l.icon;
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-neutral-200/70 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50'
                      : 'text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
            <div className="mt-1 border-t border-neutral-200/60 pt-1 dark:border-neutral-800/60">
              <SignOutButton mobile />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SignOutButton({ mobile }: { mobile?: boolean }) {
  return (
    <form action="/auth/signout" method="post" className={mobile ? '' : 'ml-1'}>
      <button
        type="submit"
        className={
          mobile
            ? 'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800/60'
            : 'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800/60'
        }
      >
        <LogOut className="h-4 w-4" />
        Salir
      </button>
    </form>
  );
}
