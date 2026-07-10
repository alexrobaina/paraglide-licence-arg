'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Lock, Printer, AlertTriangle, Wind } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { useT } from '@/i18n/provider';
import {
  PRACTICAL_FORM_V1, ITEM_LABELS, TERRAIN_LABELS,
  baseSectionsOf, repetitionOf, sectionDef,
} from '@/lib/practical/form';
import type { ItemCode, ItemValue, SectionKey, SectionsValue, TestNo } from '@/lib/practical/form';
import {
  computeResult, diffMinutes, formatDuration, isSectionApproved, isSectionAttempted,
} from '@/lib/practical/evaluate';
import { savePracticalDraft, finalizePracticalExam } from './actions';
import type { PracticalExamInput } from '@/lib/practical/schema';

const TESTS: TestNo[] = [1, 2, 3];

const fieldCls =
  'w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700';
const labelCls = 'mb-1 block text-xs font-medium text-neutral-500';

/** SI / NO / — tri-state, matching the planilla's APROBADO column. */
function ItemToggle({
  value, disabled, onChange,
}: {
  value: ItemValue;
  disabled?: boolean;
  onChange: (v: ItemValue) => void;
}) {
  const opts: { v: ItemValue; label: string; on: string }[] = [
    { v: true, label: 'SI', on: 'bg-emerald-600 text-white border-emerald-600' },
    { v: false, label: 'NO', on: 'bg-red-600 text-white border-red-600' },
    { v: null, label: '—', on: 'bg-neutral-400 text-white border-neutral-400' },
  ];
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700">
      {opts.map((o, i) => {
        const active = value === o.v;
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onChange(o.v)}
            className={`w-10 py-1 text-xs font-semibold transition-colors ${i > 0 ? 'border-l border-neutral-300 dark:border-neutral-700' : ''} ${
              active ? o.on : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            } ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionCard({
  sectionKey, value, locked, onItem, onObs,
}: {
  sectionKey: SectionKey;
  value: SectionsValue[SectionKey];
  locked: boolean;
  onItem: (item: ItemCode, v: ItemValue) => void;
  onObs: (v: string) => void;
}) {
  const def = sectionDef(sectionKey);
  const title = def.terrain ? TERRAIN_LABELS[def.terrain] : `Vuelo ${def.testNo - 1}`;

  return (
    <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-semibold">{title}</span>
        {def.repetition && <Badge variant="warning">Repetición</Badge>}
      </div>
      {def.note && <p className="mb-2 text-xs italic text-neutral-400">{def.note}</p>}

      <div className="flex flex-col gap-1.5">
        {def.items.map((code) => (
          <div key={code} className="flex items-center justify-between">
            <span className="text-sm text-neutral-700 dark:text-neutral-300">{ITEM_LABELS[code]}</span>
            <ItemToggle value={value.items[code] ?? null} disabled={locked} onChange={(v) => onItem(code, v)} />
          </div>
        ))}
      </div>

      <textarea
        className={`${fieldCls} mt-2`}
        rows={2}
        disabled={locked}
        placeholder="Observaciones"
        value={value.observations}
        onChange={(e) => onObs(e.target.value)}
      />
    </div>
  );
}

export function PracticalForm({
  studentName,
  initial,
  examId,
  status,
}: {
  studentName: string;
  initial: PracticalExamInput;
  examId?: string;
  status: 'draft' | 'final';
}) {
  const t = useT();
  const router = useRouter();
  const locked = status === 'final';

  const [input, setInput] = useState<PracticalExamInput>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [note, setNote] = useState<string | null>(null);
  const [savingDraft, startDraft] = useTransition();
  const [finalizing, startFinal] = useTransition();

  const computed = useMemo(() => computeResult(input.sections), [input.sections]);
  const duration = useMemo(
    () => formatDuration(diffMinutes(input.weather.start_time, input.weather.end_time)),
    [input.weather.start_time, input.weather.end_time],
  );

  function setField<K extends keyof PracticalExamInput>(key: K, value: PracticalExamInput[K]) {
    setInput((p) => ({ ...p, [key]: value }));
  }
  function setWeather<K extends keyof PracticalExamInput['weather']>(
    key: K, value: PracticalExamInput['weather'][K],
  ) {
    setInput((p) => ({ ...p, weather: { ...p.weather, [key]: value } }));
  }
  function setItem(section: SectionKey, item: ItemCode, v: ItemValue) {
    setInput((p) => ({
      ...p,
      sections: { ...p.sections, [section]: { ...p.sections[section], items: { ...p.sections[section].items, [item]: v } } },
    }));
  }
  function setObs(section: SectionKey, v: string) {
    setInput((p) => ({
      ...p,
      sections: { ...p.sections, [section]: { ...p.sections[section], observations: v } },
    }));
  }

  /** A repetition shows once its base failed, or if it already carries data. */
  function repetitionVisible(base: SectionKey): SectionKey | null {
    const rep = repetitionOf(base);
    if (!rep) return null;
    const failed = isSectionAttempted(input.sections, base) && !isSectionApproved(input.sections, base);
    if (failed || isSectionAttempted(input.sections, rep)) return rep;
    return null;
  }

  function numOrNull(v: string): number | null {
    if (v.trim() === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function saveDraft() {
    setNote(null);
    startDraft(async () => {
      const res = await savePracticalDraft(input, examId);
      if (!res.ok) { setErrors(res.errors ?? {}); return; }
      setErrors({});
      setNote(t('pr.saved'));
      if (!examId && res.id) router.replace(`/instructor/practical/${res.id}`);
      else router.refresh();
    });
  }

  function finalize() {
    if (!examId) { saveDraft(); return; }
    if (!confirm(t('pr.finalize.confirm'))) return;
    setNote(null);
    startFinal(async () => {
      const res = await finalizePracticalExam(input, examId);
      if (!res.ok) { setErrors(res.errors ?? {}); return; }
      setErrors({});
      router.refresh();
    });
  }

  const err = (path: string) => errors[path];
  const errCls = (path: string) => (err(path) ? 'border-red-400 dark:border-red-500' : '');

  return (
    <div className="flex flex-col gap-5">
      {locked && (
        <Alert variant="info" icon={Lock}>{t('pr.locked')}</Alert>
      )}
      {note && <Alert variant="success">{note}</Alert>}
      {Object.keys(errors).length > 0 && <Alert variant="error">{t('pr.hasErrors')}</Alert>}

      {/* Datos para el examinador */}
      <Card variant="modern" size="lg">
        <CardTitle size="sm">Datos del examen</CardTitle>
        <div className="mt-1 text-sm text-neutral-500">Alumno: <strong className="text-neutral-800 dark:text-neutral-200">{studentName}</strong></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label>
            <span className={labelCls}>Tipo de licencia *</span>
            <input className={`${fieldCls} ${errCls('license_type')}`} disabled={locked}
              value={input.license_type} onChange={(e) => setField('license_type', e.target.value)} />
          </label>
          <label>
            <span className={labelCls}>Fecha *</span>
            <input type="date" className={`${fieldCls} ${errCls('exam_date')}`} disabled={locked}
              value={input.exam_date} onChange={(e) => setField('exam_date', e.target.value)} />
          </label>
          <label>
            <span className={labelCls}>Lugar *</span>
            <input className={`${fieldCls} ${errCls('place')}`} disabled={locked}
              value={input.place} onChange={(e) => setField('place', e.target.value)} />
          </label>
          <label>
            <span className={labelCls}>Club</span>
            <input className={fieldCls} disabled={locked}
              value={input.club} onChange={(e) => setField('club', e.target.value)} />
          </label>
          <label>
            <span className={labelCls}>Instructor *</span>
            <input className={`${fieldCls} ${errCls('instructor_name')}`} disabled={locked}
              value={input.instructor_name} onChange={(e) => setField('instructor_name', e.target.value)} />
          </label>
          <label>
            <span className={labelCls}>Examinador *</span>
            <input className={`${fieldCls} ${errCls('examiner_name')}`} disabled={locked}
              value={input.examiner_name} onChange={(e) => setField('examiner_name', e.target.value)} />
          </label>
          <label>
            <span className={labelCls}>Rendido antes s/Reg?</span>
            <select className={fieldCls} disabled={locked}
              value={input.previously_taken ?? ''}
              onChange={(e) => setField('previously_taken', (e.target.value || null) as 'SI' | 'NA' | null)}>
              <option value="">—</option>
              <option value="SI">SI</option>
              <option value="NA">N/A</option>
            </select>
          </label>
        </div>
      </Card>

      {/* Condiciones climáticas */}
      <Card variant="modern" size="lg">
        <CardTitle size="sm"><Wind className="mr-1 inline h-4 w-4" />Condiciones climáticas</CardTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label>
            <span className={labelCls}>Viento (grados)</span>
            <input type="number" min={0} max={360} className={`${fieldCls} ${errCls('weather.wind_deg')}`} disabled={locked}
              value={input.weather.wind_deg ?? ''} onChange={(e) => setWeather('wind_deg', numOrNull(e.target.value))} />
          </label>
          <label>
            <span className={labelCls}>Techo nubes (ft)</span>
            <input type="number" min={0} className={`${fieldCls} ${errCls('weather.cloud_base_ft')}`} disabled={locked}
              value={input.weather.cloud_base_ft ?? ''} onChange={(e) => setWeather('cloud_base_ft', numOrNull(e.target.value))} />
          </label>
          <label>
            <span className={labelCls}>Temperatura (°C)</span>
            <input type="number" step="0.1" className={`${fieldCls} ${errCls('weather.temperature_c')}`} disabled={locked}
              value={input.weather.temperature_c ?? ''} onChange={(e) => setWeather('temperature_c', numOrNull(e.target.value))} />
          </label>
          <label>
            <span className={labelCls}>Precipitación</span>
            <select className={fieldCls} disabled={locked}
              value={input.weather.precipitation == null ? '' : input.weather.precipitation ? 'si' : 'no'}
              onChange={(e) => setWeather('precipitation', e.target.value === '' ? null : e.target.value === 'si')}>
              <option value="">—</option>
              <option value="si">SI</option>
              <option value="no">NO</option>
            </select>
          </label>
          <label>
            <span className={labelCls}>Hora inicio</span>
            <input type="time" className={`${fieldCls} ${errCls('weather.start_time')}`} disabled={locked}
              value={input.weather.start_time} onChange={(e) => setWeather('start_time', e.target.value)} />
          </label>
          <label>
            <span className={labelCls}>Hora fin</span>
            <input type="time" className={`${fieldCls} ${errCls('weather.end_time')}`} disabled={locked}
              value={input.weather.end_time} onChange={(e) => setWeather('end_time', e.target.value)} />
          </label>
        </div>
        {err('weather.end_time') && <p className="mt-1 text-xs text-red-500">{err('weather.end_time')}</p>}
        <div className="mt-2 text-sm text-neutral-500">Tiempo total: <strong className="tabular-nums text-neutral-800 dark:text-neutral-200">{duration}</strong></div>
      </Card>

      {/* Pruebas */}
      {TESTS.map((testNo) => (
        <Card key={testNo} variant="modern" size="lg">
          <CardTitle size="sm">Prueba N° {testNo}</CardTitle>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {baseSectionsOf(testNo).map((key) => {
              const rep = repetitionVisible(key);
              return (
                <div key={key} className="flex flex-col gap-3">
                  <SectionCard sectionKey={key} value={input.sections[key]} locked={locked}
                    onItem={(item, v) => setItem(key, item, v)} onObs={(v) => setObs(key, v)} />
                  {rep && (
                    <SectionCard sectionKey={rep} value={input.sections[rep]} locked={locked}
                      onItem={(item, v) => setItem(rep, item, v)} onObs={(v) => setObs(rep, v)} />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {/* Resultado final */}
      <Card variant="modern" size="lg">
        <CardTitle size="sm">Resultado final</CardTitle>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-neutral-500">Según las pruebas:</span>
          <Badge variant={computed ? 'success' : 'error'}>
            {computed ? t('pr.result.approved') : t('pr.result.failed')}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={labelCls}>Declarar resultado *</span>
          <div className="flex gap-2">
            <button type="button" disabled={locked}
              onClick={() => setField('result_declared', true)}
              className={`rounded-lg border px-4 py-1.5 text-sm font-semibold ${input.result_declared === true ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-neutral-300 text-neutral-600 dark:border-neutral-700'}`}>
              {t('pr.result.approved')}
            </button>
            <button type="button" disabled={locked}
              onClick={() => setField('result_declared', false)}
              className={`rounded-lg border px-4 py-1.5 text-sm font-semibold ${input.result_declared === false ? 'border-red-600 bg-red-600 text-white' : 'border-neutral-300 text-neutral-600 dark:border-neutral-700'}`}>
              {t('pr.result.failed')}
            </button>
          </div>
        </div>
        {err('result_declared') && <p className="text-xs text-red-500">{err('result_declared')}</p>}

        {input.result_declared != null && input.result_declared !== computed && (
          <Alert variant="warning" icon={AlertTriangle}>
            El resultado declarado no coincide con las pruebas. Fundamentá el motivo en observaciones.
          </Alert>
        )}

        <label>
          <span className={labelCls}>Observaciones del resultado</span>
          <textarea className={`${fieldCls} ${errCls('result_observations')}`} rows={2} disabled={locked}
            value={input.result_observations} onChange={(e) => setField('result_observations', e.target.value)} />
        </label>
        {err('result_observations') && <p className="text-xs text-red-500">{err('result_observations')}</p>}

        {!locked && (
          <label className="flex items-start gap-2 rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800/50">
            <input type="checkbox" className="mt-0.5" checked={input.sworn}
              onChange={(e) => setField('sworn', e.target.checked)} />
            <span className="text-neutral-600 dark:text-neutral-400">
              Lo completado aquí, avalado por los firmantes, posee condición de <strong>declaración jurada</strong>.
            </span>
          </label>
        )}
        {err('sworn') && <p className="text-xs text-red-500">{err('sworn')}</p>}
      </Card>

      {/* Acciones */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {locked ? (
          <a href={`/instructor/practical/${examId}/print`} target="_blank" rel="noopener noreferrer">
            <Button variant="primary"><Printer className="h-4 w-4" />{t('pr.print')}</Button>
          </a>
        ) : (
          <>
            <Button variant="outline" onClick={saveDraft} disabled={savingDraft || finalizing}>
              <Save className="h-4 w-4" />
              {savingDraft ? t('pr.saving') : t('pr.saveDraft')}
            </Button>
            <Button variant="primary" onClick={finalize} disabled={savingDraft || finalizing || !examId}>
              <Lock className="h-4 w-4" />
              {finalizing ? t('pr.finalizing') : t('pr.finalize')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
