import { notFound } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { ExamTemplate } from '@/lib/supabase/types';
import TemplateForm from '../../TemplateForm';

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data } = await supabase
    .from('exam_templates')
    .select('*')
    .eq('id', id)
    .eq('instructor_id', profile!.id)
    .single();

  const tpl = data as ExamTemplate | null;
  if (!tpl) notFound();

  const passPct =
    tpl.max_score > 0 ? Math.round((tpl.pass_mark / tpl.max_score) * 100) : 75;

  return (
    <TemplateForm
      mode="edit"
      templateId={tpl.id}
      initial={{
        title: tpl.title,
        description: tpl.description ?? '',
        passPct,
        timeLimit: tpl.time_limit_min != null ? String(tpl.time_limit_min) : '',
        licenseLevel: tpl.license_level ?? '',
        selectedUids: tpl.question_uids,
      }}
    />
  );
}
