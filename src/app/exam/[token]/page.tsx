import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ExamRunner from './ExamRunner';

export const dynamic = 'force-dynamic';

interface InvitationInfo {
  found: boolean;
  status?: 'pending' | 'used' | 'expired';
  student_email?: string;
  template_id?: string;
  template_title?: string;
  question_uids?: string[];
  pass_mark?: number;
  max_score?: number;
  time_limit_min?: number | null;
  attempt?: { score: number; max_score: number; passed: boolean } | null;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}

export default async function ExamTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data } = await supabase.rpc('get_exam_invitation', { p_token: token });
  const inv = data as InvitationInfo | null;

  // Invalid token
  if (!inv || !inv.found) {
    return (
      <Shell>
        <Card variant="modern" size="lg" className="text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
          <CardTitle size="lg" className="mt-3">
            Invitación no válida
          </CardTitle>
          <CardDescription className="mt-1">
            Este enlace no existe o fue eliminado. Pide una invitación nueva a tu
            instructor.
          </CardDescription>
        </Card>
      </Shell>
    );
  }

  // Already completed
  if (inv.status === 'used') {
    return (
      <Shell>
        <Card variant="modern" size="lg" className="text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <CardTitle size="lg" className="mt-3">
            Este examen ya fue rendido
          </CardTitle>
          <CardDescription className="mt-1">
            Cada invitación se puede usar una sola vez. Para repetir, pide una nueva.
          </CardDescription>
          {inv.attempt && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Badge variant={inv.attempt.passed ? 'success' : 'error'}>
                {inv.attempt.passed ? 'Aprobado' : 'No aprobado'}
              </Badge>
              <span className="text-sm text-neutral-500">
                {inv.attempt.score}/{inv.attempt.max_score}
              </span>
            </div>
          )}
        </Card>
      </Shell>
    );
  }

  // Expired
  if (inv.status === 'expired') {
    return (
      <Shell>
        <Card variant="modern" size="lg" className="text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
          <CardTitle size="lg" className="mt-3">
            Invitación expirada
          </CardTitle>
          <CardDescription className="mt-1">
            Pide una invitación nueva a tu instructor.
          </CardDescription>
        </Card>
      </Shell>
    );
  }

  // Pending — run the exam directly (no login required for pilots).
  return (
    <ExamRunner
      token={token}
      templateTitle={inv.template_title ?? 'Examen'}
      questionUids={inv.question_uids ?? []}
      passMark={inv.pass_mark ?? 0}
      maxScore={inv.max_score ?? 0}
      timeLimitMin={inv.time_limit_min ?? null}
    />
  );
}
