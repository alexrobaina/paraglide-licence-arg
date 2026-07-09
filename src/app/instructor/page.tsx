import Link from 'next/link';
import { FileText, Send, Users, ArrowRight } from 'lucide-react';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getT } from '@/i18n/server';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';

export default async function InstructorDashboard() {
  const profile = await getCurrentProfile();
  const { t } = await getT();
  const supabase = await createClient();

  // Lightweight counts for the shell (tables filled in later phases).
  const [{ count: templateCount }, { count: inviteCount }, { count: attemptCount }] =
    await Promise.all([
      supabase.from('exam_templates').select('*', { count: 'exact', head: true }),
      supabase.from('invitations').select('*', { count: 'exact', head: true }),
      supabase.from('attempts').select('*', { count: 'exact', head: true }),
    ]);

  return (
    <>
      <section className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('dash.hello', { name: profile?.full_name ?? profile?.email ?? '' })}
        </h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          {t('dash.subtitle')}
        </p>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={<FileText className="h-5 w-5 text-sky-500" />} label={t('dash.stat.templates')} value={templateCount ?? 0} />
        <StatCard icon={<Send className="h-5 w-5 text-violet-500" />} label={t('dash.stat.invites')} value={inviteCount ?? 0} />
        <StatCard icon={<Users className="h-5 w-5 text-emerald-500" />} label={t('dash.stat.attempts')} value={attemptCount ?? 0} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <ActionCard
          href="/instructor/templates"
          title={t('dash.action.create.title')}
          description={t('dash.action.create.desc')}
        />
        <ActionCard
          href="/instructor/invite"
          title={t('dash.action.invite.title')}
          description={t('dash.action.invite.desc')}
        />
      </section>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card variant="minimal" size="md">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-medium text-neutral-500">{label}</span>
        </div>
        <span className="text-2xl font-bold tabular-nums">{value}</span>
      </div>
    </Card>
  );
}

function ActionCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group">
      <Card variant="modern" interactive size="lg" className="h-full">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <CardTitle size="md">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 self-center text-neutral-400 transition-transform group-hover:translate-x-1" />
        </div>
      </Card>
    </Link>
  );
}
