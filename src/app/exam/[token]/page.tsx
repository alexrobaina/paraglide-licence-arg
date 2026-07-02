import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Mail, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase.rpc('get_exam_invitation', { p_token: token });
  const inv = data as InvitationInfo | null;

  // 1) Invalid token
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

  // 2) Already completed
  if (inv.status === 'used') {
    return (
      <Shell>
        <Card variant="modern" size="lg" className="text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <CardTitle size="lg" className="mt-3">
            Ya rendiste este examen
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

  // 3) Expired
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

  // 4) Pending — must be logged in with the matching email
  if (!user) {
    return (
      <Shell>
        <Card variant="modern" size="lg" className="text-center">
          <Mail className="mx-auto h-10 w-10 text-sky-500" />
          <CardTitle size="lg" className="mt-3">
            Inicia sesión para rendir
          </CardTitle>
          <CardDescription className="mt-1">
            Te invitaron con el email <strong>{inv.student_email}</strong>. Inicia
            sesión con ese email para acceder.
          </CardDescription>
          <Link href={`/login?next=/exam/${token}`} className="mt-5 inline-block">
            <Button variant="primary">
              <LogIn className="h-4 w-4" />
              Iniciar sesión
            </Button>
          </Link>
        </Card>
      </Shell>
    );
  }

  if (user.email?.toLowerCase() !== inv.student_email?.toLowerCase()) {
    return (
      <Shell>
        <Card variant="modern" size="lg" className="text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
          <CardTitle size="lg" className="mt-3">
            Email incorrecto
          </CardTitle>
          <CardDescription className="mt-1">
            Esta invitación es para <strong>{inv.student_email}</strong>, pero iniciaste
            sesión como <strong>{user.email}</strong>. Cierra sesión y entra con el email
            correcto.
          </CardDescription>
          <form action="/auth/signout" method="post" className="mt-5">
            <Button type="submit" variant="outline">
              Cerrar sesión
            </Button>
          </form>
        </Card>
      </Shell>
    );
  }

  // 5) Ready — run the exam
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
