import { createClient, createAdminClient } from '@/lib/supabase/server';

// Diagnostic page — no guards, no redirects. Visit /whoami while logged in.
export const dynamic = 'force-dynamic';

export default async function WhoAmIPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  let profileRow: unknown = null;
  let profileError: string | null = null;
  let whitelisted: boolean | null = null;

  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    profileRow = data;
    profileError = error?.message ?? null;

    if (process.env.SUPABASE_SECRET_KEY && user.email) {
      const admin = createAdminClient();
      const { data: wl } = await admin
        .from('instructor_whitelist')
        .select('email')
        .eq('email', user.email)
        .maybeSingle();
      whitelisted = Boolean(wl);
    }
  }

  const report = {
    server_sees_session: Boolean(user),
    user_email: user?.email ?? null,
    user_id: user?.id ?? null,
    getUser_error: userError?.message ?? null,
    profile_row: profileRow,
    profile_error: profileError,
    email_in_whitelist: whitelisted,
    SUPABASE_URL_set: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_PUBLISHABLE_KEY_set: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ),
    SUPABASE_SECRET_KEY_set: Boolean(process.env.SUPABASE_SECRET_KEY),
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-bold">Diagnóstico de sesión (/whoami)</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Copia y pégame todo este JSON.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-xs text-neutral-100">
        {JSON.stringify(report, null, 2)}
      </pre>
    </main>
  );
}
