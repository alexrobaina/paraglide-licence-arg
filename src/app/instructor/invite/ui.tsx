'use client';

import { useMemo, useState, useTransition } from 'react';
import { Send, Copy, Check, Trash2, MessageCircle } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { useI18n } from '@/i18n/provider';
import type { MessageKey } from '@/i18n/messages';
import { createInvitation, deleteInvitation } from './actions';

interface TemplateLite {
  id: string;
  title: string;
}
interface InvitationLite {
  id: string;
  token: string;
  student_email: string;
  status: 'pending' | 'used' | 'expired';
  created_at: string;
  template?: { title: string } | null;
}

const STATUS: Record<
  InvitationLite['status'],
  { labelKey: MessageKey; variant: 'default' | 'success' | 'warning' }
> = {
  pending: { labelKey: 'invite.status.pending', variant: 'warning' },
  used: { labelKey: 'invite.status.used', variant: 'success' },
  expired: { labelKey: 'invite.status.expired', variant: 'default' },
};

export function InviteClient({
  templates,
  currentTemplateId,
  invitations,
  siteUrl,
}: {
  templates: TemplateLite[];
  currentTemplateId: string;
  invitations: InvitationLite[];
  siteUrl: string;
}) {
  const { t } = useI18n();
  const [templateId, setTemplateId] = useState(currentTemplateId);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const [pending, startTransition] = useTransition();

  const templateTitle = useMemo(
    () =>
      templates.find((tpl) => tpl.id === templateId)?.title ??
      t('invite.defaultTemplate'),
    [templates, templateId, t]
  );

  function examUrl(token: string) {
    return `${siteUrl}/exam/${token}`;
  }
  function waHref(token: string, studentEmail: string, title: string) {
    const msg = t('invite.waMessage', {
      title,
      email: studentEmail,
      url: examUrl(token),
    });
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreated(false);
    startTransition(async () => {
      try {
        await createInvitation(templateId, email);
        setEmail('');
        setCreated(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('invite.error'));
      }
    });
  }

  return (
    <>
      <Card variant="modern" size="lg">
        <CardTitle size="sm">{t('invite.card.title')}</CardTitle>
        <CardDescription className="mb-3 mt-1">
          {t('invite.card.desc')}
        </CardDescription>

        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          {templates.length > 1 && (
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-900"
            >
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.title}
                </option>
              ))}
            </select>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('invite.emailPlaceholder')}
              className="flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
            />
            <Button type="submit" variant="primary" disabled={pending || !templateId}>
              <Send className="h-4 w-4" />
              {pending ? t('invite.creating') : t('invite.create')}
            </Button>
          </div>
          {error && <Alert variant="error">{error}</Alert>}
          {created && <Alert variant="success">{t('invite.created')}</Alert>}
        </form>
      </Card>

      <h2 className="mb-2 mt-6 text-sm font-semibold text-neutral-500">
        {t('invite.listTitle', { n: invitations.length })}
      </h2>

      {invitations.length === 0 ? (
        <p className="text-sm text-neutral-400">{t('invite.empty')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {invitations.map((inv) => (
            <InvitationRow
              key={inv.id}
              inv={inv}
              url={examUrl(inv.token)}
              waHref={waHref(inv.token, inv.student_email, inv.template?.title ?? templateTitle)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function InvitationRow({
  inv,
  url,
  waHref,
}: {
  inv: InvitationLite;
  url: string;
  waHref: string;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const status = STATUS[inv.status];

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function remove() {
    if (!confirm(t('invite.removeConfirm', { email: inv.student_email }))) return;
    startTransition(() => deleteInvitation(inv.id));
  }

  return (
    <Card variant="default" size="md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="truncate">{inv.student_email}</span>
            <Badge variant={status.variant}>{t(status.labelKey)}</Badge>
          </div>
          {inv.template?.title && (
            <div className="mt-0.5 truncate text-xs font-medium text-neutral-500">{inv.template.title}</div>
          )}
          <div className="mt-0.5 truncate text-xs text-neutral-400">{url}</div>
        </div>

        <div className="flex items-center gap-1">
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
          <button
            onClick={remove}
            disabled={pending}
            title={t('invite.remove')}
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
