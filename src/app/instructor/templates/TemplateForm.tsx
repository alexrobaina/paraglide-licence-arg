'use client';

import { useMemo, useState, useTransition } from 'react';
import { Search, Shuffle, Save, X } from 'lucide-react';
import { QUESTIONS, shuffle } from '@/lib/questions';
import { SECTIONS } from '@/lib/constants';
import { Card, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { createTemplate, updateTemplate } from './actions';

const inputClass =
  'w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700';

export interface TemplateFormInitial {
  title: string;
  description: string;
  passPct: number;
  timeLimit: string;
  selectedUids: string[];
}

export default function TemplateForm({
  mode,
  templateId,
  initial,
}: {
  mode: 'create' | 'edit';
  templateId?: string;
  initial?: TemplateFormInitial;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [passPct, setPassPct] = useState(initial?.passPct ?? 75);
  const [timeLimit, setTimeLimit] = useState<string>(initial?.timeLimit ?? '');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initial?.selectedUids ?? [])
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return QUESTIONS;
    return QUESTIONS.filter((question) => question.question.toLowerCase().includes(q));
  }, [query]);

  const bySection = useMemo(() => {
    return SECTIONS.map((section) => ({
      section,
      questions: filtered.filter((q) => q.section === section),
    })).filter((g) => g.questions.length > 0);
  }, [filtered]);

  const maxScore = useMemo(
    () =>
      QUESTIONS.filter((q) => selected.has(q.uid)).reduce((sum, q) => sum + q.maxScore, 0),
    [selected]
  );
  const passMark = Math.round((maxScore * passPct) / 100);

  function toggle(uid: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  }

  function toggleSection(section: string, add: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      QUESTIONS.filter((q) => q.section === section).forEach((q) =>
        add ? next.add(q.uid) : next.delete(q.uid)
      );
      return next;
    });
  }

  function pickRandom(n: number) {
    setSelected(new Set(shuffle(QUESTIONS).slice(0, n).map((q) => q.uid)));
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        const payload = {
          title,
          description,
          question_uids: [...selected],
          pass_pct: passPct,
          time_limit_min: timeLimit ? Number(timeLimit) : null,
        };
        if (mode === 'edit' && templateId) {
          await updateTemplate(templateId, payload);
        } else {
          await createTemplate(payload);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo guardar.');
      }
    });
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {mode === 'edit' ? 'Editar examen' : 'Nuevo examen'}
        </h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Ponle un nombre y elige las preguntas del banco.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        {/* Left: question picker */}
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar pregunta…"
                className="w-full rounded-lg border border-neutral-300 bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
              />
            </label>
            <Button variant="outline" size="sm" onClick={() => pickRandom(60)}>
              <Shuffle className="h-4 w-4" />
              60 al azar
            </Button>
            {selected.size > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {bySection.map(({ section, questions }) => {
              const allSelected = questions.every((q) => selected.has(q.uid));
              return (
                <Card key={section} variant="default" size="md">
                  <div className="mb-2 flex items-center justify-between">
                    <CardTitle size="sm">{section}</CardTitle>
                    <button
                      onClick={() => toggleSection(section, !allSelected)}
                      className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
                    >
                      {allSelected ? 'Quitar todas' : 'Seleccionar todas'}
                    </button>
                  </div>
                  <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
                    {questions.map((q) => (
                      <label
                        key={q.uid}
                        className="flex cursor-pointer items-start gap-3 py-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(q.uid)}
                          onChange={() => toggle(q.uid)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-sky-500"
                        />
                        <span className="text-neutral-700 dark:text-neutral-300">
                          <span className="mr-1 text-neutral-400">#{q.id}</span>
                          {q.question}
                        </span>
                      </label>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: settings + save (sticky) */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card variant="modern" size="lg">
            <div className="flex flex-col gap-3">
              <Field label="Título">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Simulacro Nivel 3"
                  className={inputClass}
                />
              </Field>
              <Field label="Descripción (opcional)">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Aprobado (%)">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={passPct}
                    onChange={(e) => setPassPct(Number(e.target.value))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Tiempo (min)">
                  <input
                    type="number"
                    min={0}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    placeholder="Sin límite"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="rounded-lg bg-neutral-100 p-3 text-sm dark:bg-neutral-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Preguntas</span>
                  <Badge variant="primary">{selected.size}</Badge>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-neutral-500">Puntaje máximo</span>
                  <span className="font-medium tabular-nums">{maxScore}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-neutral-500">Aprobar con</span>
                  <span className="font-medium tabular-nums">{passMark}</span>
                </div>
              </div>

              {error && <Alert variant="error">{error}</Alert>}

              <Button
                variant="primary"
                onClick={handleSave}
                disabled={pending || selected.size === 0 || !title.trim()}
                className="w-full"
              >
                <Save className="h-4 w-4" />
                {pending ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Guardar examen'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      {children}
    </label>
  );
}
