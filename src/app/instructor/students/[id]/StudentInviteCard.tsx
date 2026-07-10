'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Send, Copy, Check, MessageCircle, Mail } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useT } from '@/i18n/provider';
import { createInvitation } from '@/app/instructor/invite/actions';

interface TemplateLite {
  id: string;
  title: string;
}

export function StudentInviteCard({
  templates,
  studentEmail,
  siteUrl,
}: {
  templates: TemplateLite[];
  studentEmail: string | null;
  siteUrl: string;
}) {
  const t = useT();
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '');
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const email = studentEmail?.trim() ?? '';
  const field =
    'w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700';

  function create() {
    setError(null);
    setLink(null);
    startTransition(async () => {
      try {
        const res = await createInvitation(templateId, email);
        setLink(`${siteUrl}/exam/${res.token}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('stu.invite.error'));
      }
    });
  }

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const waHref = link
    ? `https://wa.me/?text=${encodeURIComponent(
        t('invite.waMessage', {
          title: templates.find((x) => x.id === templateId)?.title ?? t('invite.defaultTemplate'),
          email,
          url: link,
        }),
      )}`
    : '#';

  return (
    <Card variant="modern" size="md" className="mb-8">
      <div className="flex items-center justify-between">
        <CardTitle size="sm">{t('stu.invite.title')}</CardTitle>
        <Link href="/instructor/invite" className="text-xs text-sky-600 hover:underline">
          {t('stu.invite.manageAll')}
        </Link>
      </div>
      <CardDescription>{t('stu.invite.desc')}</CardDescription>

      {!email ? (
        <Alert variant="warning" icon={<Mail className="h-5 w-5" />}>{t('stu.invite.noEmail')}</Alert>
      ) : templates.length === 0 ? (
        <Alert variant="info">{t('stu.invite.noTemplates')}</Alert>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select className={field} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>{tpl.title}</option>
              ))}
            </select>
            <Button variant="primary" onClick={create} disabled={pending || !templateId}>
              <Send className="h-4 w-4" />
              {pending ? t('stu.invite.creating') : t('stu.invite.create')}
            </Button>
          </div>
          <div className="text-xs text-neutral-400">{email}</div>
        </>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      {link && (
        <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
          <Alert variant="success">{t('stu.invite.created')}</Alert>
          <div className="truncate text-xs text-neutral-500">{link}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? t('invite.copied') : t('invite.copy')}
            </Button>
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 text-green-600" />
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
      )}
    </Card>
  );
}
