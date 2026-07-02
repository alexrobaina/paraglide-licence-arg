'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function assertInstructor() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'instructor') {
    throw new Error('No autorizado.');
  }
  if (!process.env.SUPABASE_SECRET_KEY) {
    throw new Error(
      'Falta SUPABASE_SECRET_KEY en .env.local para gestionar instructores.'
    );
  }
  return profile;
}

export async function addInstructor(rawEmail: string) {
  await assertInstructor();
  const email = normalizeEmail(rawEmail);
  if (!email || !email.includes('@')) throw new Error('Email inválido.');

  const admin = createAdminClient();

  // 1) Add to the whitelist (so future signups become instructors).
  const { error: wlError } = await admin
    .from('instructor_whitelist')
    .upsert({ email }, { onConflict: 'email' });
  if (wlError) throw new Error(wlError.message);

  // 2) If the person already has an account, promote them now.
  const { error: upError } = await admin
    .from('profiles')
    .update({ role: 'instructor' })
    .eq('email', email);
  if (upError) throw new Error(upError.message);

  revalidatePath('/instructor/team');
}

export async function removeInstructor(rawEmail: string) {
  const me = await assertInstructor();
  const email = normalizeEmail(rawEmail);

  // Safety: never remove yourself (avoids locking everyone out).
  if (email === me.email.toLowerCase()) {
    throw new Error('No puedes quitarte a ti mismo como instructor.');
  }

  const admin = createAdminClient();

  const { error: wlError } = await admin
    .from('instructor_whitelist')
    .delete()
    .eq('email', email);
  if (wlError) throw new Error(wlError.message);

  // Demote their existing account (if any) back to student.
  const { error: dError } = await admin
    .from('profiles')
    .update({ role: 'student' })
    .eq('email', email);
  if (dError) throw new Error(dError.message);

  revalidatePath('/instructor/team');
}
