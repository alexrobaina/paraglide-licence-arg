'use client';

import { useMemo, useState, useTransition } from 'react';
import { Send, Copy, Check, Trash2, MessageCircle } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
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
}

const STATUS: Record<
  InvitationLite['status'],
  { label: string; variant: 'default' | 'success' | 'warning' }
> = {
  pending: { label: 'Pendiente', variant: 'warning' },
  used: { label: 'Completado', variant: 'success' },
  expired: { label: 'Expirado', variant: 'default' },
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
  const [templateId, setTemplateId] = useState(currentTemplateId);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const [pending, startTransition] = useTransition();

  const templateTitle = useMemo(
    () => templates.find((t) => t.id === templateId)?.title ?? 'el examen',
    [templates, templateId]
  );

  function examUrl(token: string) {
    return `${siteUrl}/exam/${token}`;
  }
  function waHref(token: string, studentEmail: string) {
    const msg = `¡Hola! Te invito a rendir "${templateTitle}". Entra con este enlace (es solo para ti, ${studentEmail}): ${examUrl(token)}`;
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
        setError(err instanceof Error ? err.message : 'No se pudo invitar.');
      }
    });
  }

  return (
    <>
      <Card variant="modern" size="lg">
        <CardTitle size="sm">Invitar a un piloto</CardTitle>
        <CardDescription className="mb-3 mt-1">
          Se crea un enlace único. El piloto solo puede rendir <strong>una vez</strong>;
          para repetir necesita una invitación nueva.
        </CardDescription>

        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          {templates.length > 1 && (
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-900"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
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
              placeholder="piloto@email.com"
              className="flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
            />
            <Button type="submit" variant="primary" disabled={pending || !templateId}>
              <Send className="h-4 w-4" />
              {pending ? 'Creando…' : 'Crear invitación'}
            </Button>
          </div>
          {error && <Alert variant="error">{error}</Alert>}
          {created && (
            <Alert variant="success">
              ✅ Invitación creada. Compártela por WhatsApp o Copiar el enlace abajo. 👇
            </Alert>
          )}
        </form>
      </Card>

      <h2 className="mb-2 mt-6 text-sm font-semibold text-neutral-500">
        Invitaciones ({invitations.length})
      </h2>

      {invitations.length === 0 ? (
        <p className="text-sm text-neutral-400">Aún no hay invitaciones.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {invitations.map((inv) => (
            <InvitationRow
              key={inv.id}
              inv={inv}
              url={examUrl(inv.token)}
              waHref={waHref(inv.token, inv.student_email)}
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
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const status = STATUS[inv.status];

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function remove() {
    if (!confirm(`¿Quitar la invitación de ${inv.student_email}?`)) return;
    startTransition(() => deleteInvitation(inv.id));
  }

  return (
    <Card variant="default" size="md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="truncate">{inv.student_email}</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <div className="mt-0.5 truncate text-xs text-neutral-400">{url}</div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado' : 'Copiar'}
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
            title="Quitar invitación"
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
