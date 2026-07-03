'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const ERRORS: Record<string, string> = {
  not_authorized: 'Solo el admin puede hacer esto.',
  password_too_short: 'La contraseña debe tener al menos 6 caracteres.',
  user_not_found: 'Usuario no encontrado.',
  cannot_delete_self: 'No puedes borrarte a ti mismo.',
};

function friendly(message: string) {
  const key = message.replace(/^.*?:\s*/, '').trim();
  return ERRORS[key] ?? message;
}

export async function setUserPassword(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('admin_set_password', {
    p_email: email,
    p_password: password,
  });
  if (error) throw new Error(friendly(error.message));
  revalidatePath('/instructor/users');
}

export async function deleteUser(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('admin_delete_user', { p_email: email });
  if (error) throw new Error(friendly(error.message));
  revalidatePath('/instructor/users');
}
