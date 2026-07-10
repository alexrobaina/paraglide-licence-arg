// Shared DB row types (mirror supabase/schema.sql).

export type UserRole = 'instructor' | 'student';
export type InvitationStatus = 'pending' | 'used' | 'expired';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface ExamTemplate {
  id: string;
  instructor_id: string;
  title: string;
  description: string | null;
  question_uids: string[];
  pass_mark: number;
  max_score: number;
  time_limit_min: number | null;
  license_level: string | null;
  created_at: string;
}

export interface Invitation {
  id: string;
  token: string;
  template_id: string;
  instructor_id: string;
  student_email: string;
  status: InvitationStatus;
  expires_at: string | null;
  used_at: string | null;
  created_at: string;
}

export interface Attempt {
  id: string;
  invitation_id: string;
  /** The alumno (students.id). Null for legacy attempts not yet backfilled. */
  student_id: string | null;
  /** Legacy: the logged-in account that took the exam. Almost always null. */
  student_profile_id: string | null;
  template_id: string;
  score: number;
  max_score: number;
  passed: boolean;
  answers: Record<string, string[]>;
  started_at: string | null;
  finished_at: string;
}

export interface Student {
  id: string;
  instructor_id: string;
  last_name: string;
  first_name: string;
  dni: string | null;
  email: string | null;
  club: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}
