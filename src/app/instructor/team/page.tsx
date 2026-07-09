import { ShieldCheck, Clock } from 'lucide-react';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getT } from '@/i18n/server';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { AddInstructorForm, RemoveInstructorButton } from './ui';

interface InstructorRow {
  email: string;
  signed_up: boolean;
  full_name: string | null;
}

export default async function TeamPage() {
  const me = await getCurrentProfile();
  const { t } = await getT();
  const supabase = await createClient();

  const { data } = await supabase.rpc('list_instructors');
  const list = (data as InstructorRow[]) ?? [];

  const rows = list.map((r) => ({
    ...r,
    isMe: me?.email.toLowerCase() === r.email.toLowerCase(),
  }));

  return (
    <>
      <PageHeader />

      <Card variant="modern" size="lg" className="mt-4">
        <CardTitle size="sm">{t('team.add.title')}</CardTitle>
        <CardDescription className="mb-3 mt-1">{t('team.add.desc')}</CardDescription>
        <AddInstructorForm />
      </Card>

      <div className="mt-4 flex flex-col gap-2">
        {rows.map((r) => (
          <Card key={r.email} variant="default" size="md">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </span>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {r.full_name ?? r.email}
                    {r.isMe && <Badge variant="primary">{t('team.you')}</Badge>}
                  </div>
                  {r.full_name && (
                    <div className="text-xs text-neutral-500">{r.email}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {r.signed_up ? (
                  <Badge variant="success">{t('team.active')}</Badge>
                ) : (
                  <Badge variant="default">
                    <Clock className="mr-1 h-3 w-3" />
                    {t('team.pending')}
                  </Badge>
                )}
                <RemoveInstructorButton email={r.email} disabled={r.isMe} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

async function PageHeader() {
  const { t } = await getT();
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{t('team.title')}</h1>
      <p className="mt-1 text-neutral-600 dark:text-neutral-400">
        {t('team.subtitle')}
      </p>
    </div>
  );
}
