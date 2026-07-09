'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getT } from '@/i18n/server';
import type { MessageKey } from '@/i18n/messages';

const ERROR_KEYS: Record<string, MessageKey> = {
  not_authorized: 'act.unauthorized',
  invalid_email: 'act.invalidEmail',
  cannot_remove_self: 'act.cannotRemoveSelf',
};

/** Traduce el código que devuelve el RPC; si no lo conocemos, lo deja tal cual. */
async function friendly(message: string) {
  const code = message.replace(/^.*?:\s*/, '').trim();
  const key = ERROR_KEYS[code];
  if (!key) return message;
  const { t } = await getT();
  return t(key);
}

export async function addInstructor(rawEmail: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('add_instructor', { p_email: rawEmail });
  if (error) throw new Error(await friendly(error.message));
  revalidatePath('/instructor/team');
}

export async function removeInstructor(rawEmail: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('remove_instructor', { p_email: rawEmail });
  if (error) throw new Error(await friendly(error.message));
  revalidatePath('/instructor/team');
}
