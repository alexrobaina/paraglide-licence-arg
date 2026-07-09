import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LanguageToggle from '@/components/LanguageToggle';
import { getT } from '@/i18n/server';
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

/** El invitado no tiene cabecera de sitio, así que el selector va aquí. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col px-4 py-6">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  );
}

export default async function ExamTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { t } = await getT();
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
            {t('inv.invalid.title')}
          </CardTitle>
          <CardDescription className="mt-1">
            {t('inv.invalid.desc')}
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
            {t('inv.used.title')}
          </CardTitle>
          <CardDescription className="mt-1">{t('inv.used.desc')}</CardDescription>
          {inv.attempt && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Badge variant={inv.attempt.passed ? 'success' : 'error'}>
                {inv.attempt.passed ? t('inv.passed') : t('inv.failed')}
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
            {t('inv.expired.title')}
          </CardTitle>
          <CardDescription className="mt-1">
            {t('inv.expired.desc')}
          </CardDescription>
        </Card>
      </Shell>
    );
  }

  // Pending — run the exam directly (no login required for pilots).
  return (
    <ExamRunner
      token={token}
      templateTitle={inv.template_title ?? t('inv.defaultTitle')}
      questionUids={inv.question_uids ?? []}
      passMark={inv.pass_mark ?? 0}
      maxScore={inv.max_score ?? 0}
      timeLimitMin={inv.time_limit_min ?? null}
    />
  );
}
