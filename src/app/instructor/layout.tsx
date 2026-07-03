import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Mountain, ShieldAlert } from 'lucide-react';
import { getCurrentProfile, ensureProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import InstructorNav from './InstructorNav';

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

  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc('is_admin');

  // Still not an instructor: show a clear message instead of a silent redirect.
  if (profile.role !== 'instructor') {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-3 text-lg font-semibold">No eres instructor</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Sesión iniciada como <strong>{profile.email}</strong> (rol:{' '}
            <strong>{profile.role}</strong>). Tu email debe estar en la lista de
            instructores para acceder.
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
        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/instructor" className="flex shrink-0 items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900">
              <Mountain className="h-5 w-5" />
            </span>
            <span className="tracking-tight">
              Paraglide<span className="text-sky-500">Exam</span>
              <span className="ml-2 hidden text-xs font-normal text-neutral-400 sm:inline">
                Instructor
              </span>
            </span>
          </Link>

          <InstructorNav isAdmin={Boolean(isAdmin)} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8">{children}</main>
    </div>
  );
}
