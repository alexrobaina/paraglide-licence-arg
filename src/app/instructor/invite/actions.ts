'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';

export interface CreatedInvitation {
  token: string;
  student_email: string;
}

export async function createInvitation(
  templateId: string,
  studentEmail: string
): Promise<CreatedInvitation> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'instructor') {
    throw new Error('No autorizado.');
  }

  const email = studentEmail.trim().toLowerCase();
  if (!email.includes('@')) throw new Error('Email inválido.');

  const supabase = await createClient();

  // Verify the template belongs to this instructor.
  const { data: tpl } = await supabase
    .from('exam_templates')
    .select('id')
    .eq('id', templateId)
    .eq('instructor_id', profile.id)
    .single();
  if (!tpl) throw new Error('Plantilla no encontrada.');

  const token = randomBytes(24).toString('base64url');

  const { error } = await supabase.from('invitations').insert({
    token,
    template_id: templateId,
    instructor_id: profile.id,
    student_email: email,
    status: 'pending',
  });
  if (error) throw new Error(error.message);

  revalidatePath('/instructor/invite');
  return { token, student_email: email };
}

export async function deleteInvitation(id: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'instructor') {
    throw new Error('No autorizado.');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', id)
    .eq('instructor_id', profile.id);
  if (error) throw new Error(error.message);

  revalidatePath('/instructor/invite');
}
