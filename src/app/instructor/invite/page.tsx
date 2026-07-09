import Link from 'next/link';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getT } from '@/i18n/server';
import type { ExamTemplate, Invitation } from '@/lib/supabase/types';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { InviteClient } from './ui';

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  const profile = await getCurrentProfile();
  const { t } = await getT();
  const supabase = await createClient();

  const { data: templatesData } = await supabase
    .from('exam_templates')
    .select('id, title')
    .eq('instructor_id', profile!.id)
    .order('created_at', { ascending: false });

  const templates = (templatesData as Pick<ExamTemplate, 'id' | 'title'>[]) ?? [];

  if (templates.length === 0) {
    return (
      <>
        <PageHeader />
        <Card variant="modern" size="lg" className="mt-4 text-center">
          <CardTitle size="md">{t('invite.needTemplate.title')}</CardTitle>
          <CardDescription className="mt-1">
            {t('invite.needTemplate.desc')}
          </CardDescription>
          <Link href="/instructor/templates/new" className="mt-4 inline-block">
            <Button variant="primary">{t('tpl.create')}</Button>
          </Link>
        </Card>
      </>
    );
  }

  const currentTemplateId =
    template && templates.some((t) => t.id === template)
      ? template
      : templates[0].id;

  const { data: invitationsData } = await supabase
    .from('invitations')
    .select('id, token, student_email, status, created_at')
    .eq('template_id', currentTemplateId)
    .order('created_at', { ascending: false });

  const invitations =
    (invitationsData as Pick<
      Invitation,
      'id' | 'token' | 'student_email' | 'status' | 'created_at'
    >[]) ?? [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return (
    <>
      <PageHeader />
      <div className="mt-4">
        <InviteClient
          templates={templates}
          currentTemplateId={currentTemplateId}
          invitations={invitations}
          siteUrl={siteUrl}
        />
      </div>
    </>
  );
}

async function PageHeader() {
  const { t } = await getT();
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{t('invite.title')}</h1>
      <p className="mt-1 text-neutral-600 dark:text-neutral-400">
        {t('invite.subtitle')}
      </p>
    </div>
  );
}
