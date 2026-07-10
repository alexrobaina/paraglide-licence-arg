import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { getCurrentProfile, ensureProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getT } from '@/i18n/server';
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
    const { t } = await getT();
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-3 text-lg font-semibold">{t('guard.title')}</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {t('guard.signedInAs')} <strong>{profile.email}</strong> (
            {t('guard.role')}: <strong>{profile.role}</strong>).{' '}
            {t('guard.needWhitelist')}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/"
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900"
            >
              {t('common.goHome')}
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="w-full rounded-lg px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400"
              >
                {t('common.signOut')}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen lg:pl-60 print:pl-0">
      <InstructorNav isAdmin={Boolean(isAdmin)} />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 print:max-w-none print:p-0">{children}</main>
    </div>
  );
}
