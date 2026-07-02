import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/auth';

/**
 * Magic-link landing route. Supabase (PKCE flow) redirects here with a `code`
 * which we exchange for a session cookie, then route the user by role.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Self-heal: make sure this user has a profile row (fixes users who
      // signed up before the DB trigger existed).
      if (user?.email) await ensureProfile(user.id, user.email);

      // Explicit next wins; otherwise route by role.
      if (next) return NextResponse.redirect(`${origin}${next}`);

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user!.id)
        .single();

      const dest = profile?.role === 'instructor' ? '/instructor' : '/';
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
