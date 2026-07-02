import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Mountain, LogOut, LayoutDashboard, FileText, Send, Users, ShieldAlert, BarChart3 } from 'lucide-react';
import { getCurrentProfile, ensureProfile } from '@/lib/auth';

/**
 * Guards the whole /instructor area: only signed-in instructors may enter.
 * (The middleware already blocks anonymous users; this also blocks students.)
 */
export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile = await getCurrentProfile();

  if (!profile) redirect('/login?next=/instructor');

  // Maybe they were just added to the whitelist — re-sync role, then re-check.
  if (profile.role !== 'instructor') {
    await ensureProfile(profile.id, profile.email);
    profile = (await getCurrentProfile()) ?? profile;
  }

  // Still not an instructor: show a clear message instead of a silent redirect.
  if (profile.role !== 'instructor') {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-3 text-lg font-semibold">No eres instructor</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Sesión iniciada como <strong>{profile.email}</strong> (rol:{' '}
            <strong>{profile.role}</strong>). Para ser instructor, tu email debe estar
            en la whitelist y necesitas <code>SUPABASE_SECRET_KEY</code> configurada.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/"
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900"
            >
              Ir al inicio
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="w-full rounded-lg px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-neutral-200/60 bg-neutral-50/80 backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/instructor" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900">
              <Mountain className="h-5 w-5" />
            </span>
            <span className="tracking-tight">
              Paraglide<span className="text-sky-500">Exam</span>
              <span className="ml-2 text-xs font-normal text-neutral-400">
                Instructor
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            <NavLink href="/instructor" icon={LayoutDashboard} label="Panel" />
            <NavLink href="/instructor/templates" icon={FileText} label="Exámenes" />
            <NavLink href="/instructor/invite" icon={Send} label="Invitar" />
            <NavLink href="/instructor/results" icon={BarChart3} label="Resultados" />
            <NavLink href="/instructor/team" icon={Users} label="Instructores" />
            <form action="/auth/signout" method="post" className="ml-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-neutral-600 transition-colors hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800/60"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-neutral-600 transition-colors hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800/60"
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
