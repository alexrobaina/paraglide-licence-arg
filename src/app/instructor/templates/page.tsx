import Link from 'next/link';
import { Plus, FileText, ListChecks, Pencil } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { getT } from '@/i18n/server';
import type { ExamTemplate } from '@/lib/supabase/types';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default async function TemplatesPage() {
  const profile = await getCurrentProfile();
  const { t } = await getT();
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from('exam_templates')
    .select('*')
    .eq('instructor_id', profile!.id)
    .order('created_at', { ascending: false });

  const list = (templates as ExamTemplate[]) ?? [];

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('tpl.title')}</h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            {t('tpl.subtitle')}
          </p>
        </div>
        <Link href="/instructor/templates/new">
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            {t('tpl.new')}
          </Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <Card variant="modern" size="lg" className="text-center">
          <FileText className="mx-auto h-10 w-10 text-neutral-300 dark:text-neutral-700" />
          <CardTitle size="md" className="mt-3">
            {t('tpl.empty.title')}
          </CardTitle>
          <CardDescription className="mt-1">
            {t('tpl.empty.desc')}
          </CardDescription>
          <Link href="/instructor/templates/new" className="mt-4 inline-block">
            <Button variant="primary">
              <Plus className="h-4 w-4" />
              {t('tpl.create')}
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((tpl) => (
            <Card key={tpl.id} variant="default" size="lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle size="md">{tpl.title}</CardTitle>
                  {tpl.description && (
                    <CardDescription className="mt-1">{tpl.description}</CardDescription>
                  )}
                </div>
                <Badge variant="primary">
                  <ListChecks className="mr-1 h-3 w-3" />
                  {tpl.question_uids.length}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500">
                <span>
                  {t('tpl.passLabel', { pass: tpl.pass_mark, max: tpl.max_score })}
                </span>
                {tpl.time_limit_min && (
                  <span>· {t('tpl.minutes', { min: tpl.time_limit_min })}</span>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/instructor/invite?template=${tpl.id}`}>
                  <Button variant="outline" size="sm">{t('tpl.invitePilot')}</Button>
                </Link>
                <Link href={`/instructor/templates/${tpl.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                    {t('tpl.edit')}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
