import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { Profile, UserRole } from '@/lib/supabase/types';

/**
 * Guarantees a profile row exists for a signed-in user (self-heal for users who
 * signed up before the DB trigger existed). Uses the service-role key to bypass
 * RLS. No-ops if the secret key isn't configured yet.
 */
export async function ensureProfile(userId: string, email: string) {
  if (!process.env.SUPABASE_SECRET_KEY) return;

  const admin = createAdminClient();
  const { data: whitelisted } = await admin
    .from('instructor_whitelist')
    .select('email')
    .eq('email', email)
    .maybeSingle();

  const role: UserRole = whitelisted ? 'instructor' : 'student';

  await admin
    .from('profiles')
    .upsert({ id: userId, email, role }, { onConflict: 'id' });
}

/** The authenticated auth user, or null. */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** The current user's profile row (includes role), or null if not signed in. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Self-heal: no profile row yet (signed up before the trigger existed).
  if (!data && user.email) {
    await ensureProfile(user.id, user.email);
    ({ data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single());
  }

  return (data as Profile) ?? null;
}
