'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const ERRORS: Record<string, string> = {
  not_authorized: 'No autorizado.',
  invalid_email: 'Email inválido.',
  cannot_remove_self: 'No puedes quitarte a ti mismo como instructor.',
};

function friendly(message: string) {
  const key = message.replace(/^.*?:\s*/, '').trim();
  return ERRORS[key] ?? message;
}

export async function addInstructor(rawEmail: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('add_instructor', { p_email: rawEmail });
  if (error) throw new Error(friendly(error.message));
  revalidatePath('/instructor/team');
}

export async function removeInstructor(rawEmail: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('remove_instructor', { p_email: rawEmail });
  if (error) throw new Error(friendly(error.message));
  revalidatePath('/instructor/team');
}
