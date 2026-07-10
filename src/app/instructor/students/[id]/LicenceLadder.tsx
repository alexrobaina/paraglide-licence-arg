'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ChevronDown, Send, Plus, Copy, Check, CheckCircle2, Circle,
  ArrowRight, Printer, Award, Mail,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import { useT } from '@/i18n/provider';
import { createInvitation } from '@/app/instructor/invite/actions';
import type { LicenceStatus } from '@/lib/practical/licence';
import type { MessageKey } from '@/i18n/messages';

export interface LadderRung {
  level: string | null;
  label: string;
  status: LicenceStatus;
  grantedAt: string | null; // formatted for display
  theory: { passed: boolean; score: number; maxScore: number; date: string; attemptId: string } | null;
  practical: { status: 'draft' | 'final'; resultDeclared: boolean | null; date: string; examId: string } | null;
  templates: { id: string; title: string }[];
}

const STATUS: Record<LicenceStatus, { dot: string; badge: 'success' | 'warning' | 'default'; key: MessageKey }> = {
  granted: { dot: 'bg-emerald-500', badge: 'success', key: 'lic.granted' },
  in_progress: { dot: 'bg-amber-500', badge: 'warning', key: 'lic.inProgress' },
  not_started: { dot: 'bg-neutral-300 dark:bg-neutral-700', badge: 'default', key: 'lic.notStarted' },
};

const keyOf = (r: LadderRung) => r.level ?? '__none';

export function LicenceLadder({
  rungs, studentId, studentEmail, siteUrl,
}: {
  rungs: LadderRung[];
  studentId: string;
  studentEmail: string | null;
  siteUrl: string;
}) {
  // Open the first level that needs attention, so the pending work is front-and-center.
  const [open, setOpen] = useState<string | null>(
    () => { const r = rungs.find((x) => x.status === 'in_progress'); return r ? keyOf(r) : null; },
  );
  const [inviteRung, setInviteRung] = useState<LadderRung | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-neutral-200/70 dark:border-neutral-800/70">
        {rungs.map((rung) => (
          <AccordionRung
            key={keyOf(rung)}
            rung={rung}
            studentId={studentId}
            open={open === keyOf(rung)}
            onToggle={() => setOpen((cur) => (cur === keyOf(rung) ? null : keyOf(rung)))}
            onInvite={() => setInviteRung(rung)}
          />
        ))}
      </div>

      <InviteModal
        rung={inviteRung}
        studentEmail={studentEmail}
        siteUrl={siteUrl}
        onClose={() => setInviteRung(null)}
      />
    </>
  );
}

function AccordionRung({
  rung, studentId, open, onToggle, onInvite,
}: {
  rung: LadderRung;
  studentId: string;
  open: boolean;
  onToggle: () => void;
  onInvite: () => void;
}) {
  const t = useT();
  const s = STATUS[rung.status];
  const muted = rung.status === 'not_started';

  return (
    <div className="border-b border-neutral-200/70 last:border-0 dark:border-neutral-800/70">
      {/* Header (toggles the accordion) */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
      >
        <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
        <span className={`font-semibold ${muted ? 'text-neutral-400' : ''}`}>{rung.label}</span>

        {/* Mini legs (collapsed glance) */}
        <span className="ml-2 hidden items-center gap-3 text-xs text-neutral-400 sm:flex">
          <MiniLeg label={t('lic.theory')} ok={rung.theory?.passed ?? false} />
          <MiniLeg label={t('lic.practical')} ok={rung.practical?.resultDeclared === true} />
        </span>

        <span className="ml-auto flex flex-col items-end">
          <Badge variant={s.badge}>{t(s.key)}</Badge>
          {rung.grantedAt && (
            <span className="mt-0.5 text-[11px] text-neutral-400">{rung.grantedAt}</span>
          )}
        </span>
      </button>

      {/* Expediente (expanded) */}
      {open && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TheoryBlock rung={rung} onInvite={onInvite} />
            <PracticalBlock rung={rung} studentId={studentId} />
          </div>
          {rung.status === 'granted' && rung.level && (
            <div className="mt-3 flex justify-end border-t border-neutral-200/60 pt-3 dark:border-neutral-800/60">
              <a href={`/instructor/certificate/${studentId}/${rung.level}`} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="sm"><Award className="h-4 w-4" />{t('lic.certificate')}</Button>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniLeg({ label, ok }: { label: string; ok: boolean }) {
  const Icon = ok ? CheckCircle2 : Circle;
  return (
    <span className={`inline-flex items-center gap-1 ${ok ? 'text-emerald-600' : ''}`}>
      <Icon className="h-3.5 w-3.5" />{label}
    </span>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-3 dark:border-neutral-800 dark:bg-neutral-800/30">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{title}</div>
      {children}
    </div>
  );
}

function TheoryBlock({ rung, onInvite }: { rung: LadderRung; onInvite: () => void }) {
  const t = useT();
  return (
    <Block title={t('lic.theory')}>
      {rung.theory ? (
        <div className="flex flex-col gap-2">
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${rung.theory.passed ? 'text-emerald-600' : 'text-red-600'}`}>
            {rung.theory.passed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
            {rung.theory.passed ? t('lic.passed') : t('pr.result.failed')} · {rung.theory.score}/{rung.theory.maxScore}
          </span>
          <span className="text-xs text-neutral-400">{rung.theory.date}</span>
          <div className="flex flex-wrap gap-2">
            <Link href={`/instructor/results/${rung.theory.attemptId}`}>
              <Button variant="outline" size="sm"><ArrowRight className="h-3.5 w-3.5" />{t('lic.viewResult')}</Button>
            </Link>
            {/* Always allow another shot — essential after a failed exam. */}
            <Button variant={rung.theory.passed ? 'ghost' : 'primary'} size="sm" onClick={onInvite}>
              <Send className="h-3.5 w-3.5" />{t('lic.reinvite')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-neutral-400">{t('lic.pendingLeg')}</span>
          <Button variant="primary" size="sm" onClick={onInvite}>
            <Send className="h-4 w-4" />{t('lic.inviteTheory')}
          </Button>
        </div>
      )}
    </Block>
  );
}

function PracticalBlock({ rung, studentId }: { rung: LadderRung; studentId: string }) {
  const t = useT();
  return (
    <Block title={t('lic.practical')}>
      {rung.practical ? (
        <div className="flex flex-col gap-2">
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${rung.practical.resultDeclared ? 'text-emerald-600' : 'text-neutral-600 dark:text-neutral-300'}`}>
            {rung.practical.resultDeclared ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
            {rung.practical.resultDeclared == null
              ? t('pr.status.draft')
              : rung.practical.resultDeclared ? t('lic.passed') : t('pr.result.failed')}
            {' · '}{rung.practical.status === 'final' ? t('pr.status.final') : t('pr.status.draft')}
          </span>
          <span className="text-xs text-neutral-400">{rung.practical.date}</span>
          <div className="flex flex-wrap gap-2">
            <Link href={`/instructor/practical/${rung.practical.examId}`}>
              <Button variant="outline" size="sm"><ArrowRight className="h-3.5 w-3.5" />{t('lic.viewChecklist')}</Button>
            </Link>
            {rung.practical.status === 'final' && (
              <Link href={`/instructor/practical/${rung.practical.examId}/print`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm"><Printer className="h-3.5 w-3.5" />{t('pr.print')}</Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-neutral-400">{t('lic.pendingLeg')}</span>
          <Link href={`/instructor/practical/new?student=${studentId}${rung.level ? `&level=${rung.level}` : ''}`}>
            <Button variant="primary" size="sm"><Plus className="h-4 w-4" />{t('lic.newPractical')}</Button>
          </Link>
        </div>
      )}
    </Block>
  );
}

function InviteModal({
  rung, studentEmail, siteUrl, onClose,
}: {
  rung: LadderRung | null;
  studentEmail: string | null;
  siteUrl: string;
  onClose: () => void;
}) {
  const t = useT();
  const [templateId, setTemplateId] = useState('');
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Reset every time the modal target changes — including reopening the SAME
  // rung after a close (rung goes null → rung), so a freshly created link never
  // lingers on the next open.
  useEffect(() => {
    setTemplateId(rung?.templates[0]?.id ?? '');
    setLink(null);
    setError(null);
    setCopied(false);
  }, [rung]);

  function create() {
    if (!studentEmail) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await createInvitation(templateId, studentEmail);
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

  return (
    <Modal open={!!rung} onClose={onClose} title={rung ? `${t('lic.inviteTheory')} · ${rung.label}` : ''}>
      {rung && (
        <div className="flex flex-col gap-3">
          {!studentEmail ? (
            <Alert variant="warning" icon={<Mail className="h-5 w-5" />}>{t('stu.invite.noEmail')}</Alert>
          ) : rung.templates.length === 0 ? (
            <Alert variant="info">{t('lic.needTemplate', { level: rung.label })}</Alert>
          ) : link ? (
            <>
              <Alert variant="success">{t('lic.inviteCreated')}</Alert>
              <div className="truncate rounded-lg border border-neutral-200 p-2 text-xs text-neutral-500 dark:border-neutral-800">{link}</div>
              <Button variant="primary" onClick={copy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t('invite.copied') : t('invite.copy')}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-neutral-500">{t('stu.invite.desc')}</p>
              {rung.templates.length > 1 && (
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
                >
                  {rung.templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>{tpl.title}</option>
                  ))}
                </select>
              )}
              <div className="text-xs text-neutral-400">{studentEmail}</div>
              {error && <Alert variant="error">{error}</Alert>}
              <Button variant="primary" onClick={create} disabled={pending || !templateId}>
                <Send className="h-4 w-4" />{pending ? t('stu.invite.creating') : t('lic.inviteTheory')}
              </Button>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
