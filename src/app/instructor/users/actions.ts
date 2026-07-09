'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getT } from '@/i18n/server';
import type { MessageKey } from '@/i18n/messages';

const ERROR_KEYS: Record<string, MessageKey> = {
  not_authorized: 'act.adminOnly',
  password_too_short: 'act.passwordTooShort',
  user_not_found: 'act.userNotFound',
  cannot_delete_self: 'act.cannotDeleteSelf',
};

/** Traduce el código que devuelve el RPC; si no lo conocemos, lo deja tal cual. */
async function friendly(message: string) {
  const code = message.replace(/^.*?:\s*/, '').trim();
  const key = ERROR_KEYS[code];
  if (!key) return message;
  const { t } = await getT();
  return t(key);
}

export async function setUserPassword(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('admin_set_password', {
    p_email: email,
    p_password: password,
  });
  if (error) throw new Error(await friendly(error.message));
  revalidatePath('/instructor/users');
}

export async function deleteUser(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('admin_delete_user', { p_email: email });
  if (error) throw new Error(await friendly(error.message));
  revalidatePath('/instructor/users');
}
