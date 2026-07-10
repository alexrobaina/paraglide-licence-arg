'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { getT } from '@/i18n/server';

const studentSchema = z.object({
  last_name: z.string().trim().min(1).max(120),
  first_name: z.string().trim().max(120),
  dni: z.string().trim().max(30),
  email: z.string().trim().max(200),
  club: z.string().trim().max(200),
  phone: z.string().trim().max(60),
  notes: z.string().trim().max(4000),
});

export type StudentFormInput = z.input<typeof studentSchema>;

async function requireInstructor() {
  const { t } = await getT();
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'instructor') throw new Error(t('act.unauthorized'));
  return profile;
}

/** '' → null so the partial unique indexes on (instructor, dni/email) don't clash. */
function nullable(value: string): string | null {
  return value.trim() === '' ? null : value.trim();
}

function parse(input: StudentFormInput) {
  const parsed = studentSchema.safeParse(input);
  if (!parsed.success) throw new Error('invalid_student');
  const s = parsed.data;
  return {
    last_name: s.last_name,
    first_name: s.first_name,
    dni: nullable(s.dni),
    email: nullable(s.email)?.toLowerCase() ?? null,
    club: nullable(s.club),
    phone: nullable(s.phone),
    notes: nullable(s.notes),
  };
}

export async function createStudent(input: StudentFormInput) {
  const profile = await requireInstructor();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('students')
    .insert({ ...parse(input), instructor_id: profile.id })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/instructor/students');
  return data.id as string;
}

export async function updateStudent(id: string, input: StudentFormInput) {
  const profile = await requireInstructor();
  const supabase = await createClient();

  const { error } = await supabase
    .from('students')
    .update(parse(input))
    .eq('id', id)
    .eq('instructor_id', profile.id);

  if (error) throw new Error(error.message);
  revalidatePath('/instructor/students');
  revalidatePath(`/instructor/students/${id}`);
}

export async function deleteStudent(id: string) {
  const profile = await requireInstructor();
  const supabase = await createClient();

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id)
    .eq('instructor_id', profile.id);

  if (error) throw new Error(error.message);
  revalidatePath('/instructor/students');
}

/** One-click: create a student per invited email and link their theory attempts. */
export async function backfillStudents() {
  await requireInstructor();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('backfill_students_from_invitations');
  if (error) throw new Error(error.message);
  revalidatePath('/instructor/students');
  return data as { created: number; linked: number };
}
