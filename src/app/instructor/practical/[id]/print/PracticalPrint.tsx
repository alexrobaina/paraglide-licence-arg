'use client';

import { Printer } from 'lucide-react';
import Button from '@/components/ui/Button';
import {
  ITEM_LABELS, TERRAIN_LABELS, baseSectionsOf, repetitionOf, sectionDef,
} from '@/lib/practical/form';
import { diffMinutes, formatDuration, isSectionAttempted } from '@/lib/practical/evaluate';
import type { ItemValue, SectionKey, TestNo } from '@/lib/practical/form';
import type { PracticalExamInput } from '@/lib/practical/schema';

const TESTS: TestNo[] = [1, 2, 3];

function mark(v: ItemValue): string {
  if (v === true) return 'SI';
  if (v === false) return 'NO';
  return '—';
}

function Section({ sectionKey, input }: { sectionKey: SectionKey; input: PracticalExamInput }) {
  const def = sectionDef(sectionKey);
  const value = input.sections[sectionKey];
  const title = def.terrain ? TERRAIN_LABELS[def.terrain] : `Vuelo ${def.testNo - 1}`;
  return (
    <div className="pr-section">
      <div className="pr-section-title">
        {title}{def.repetition ? ' · Repetición' : ''}
      </div>
      <table className="pr-items">
        <tbody>
          {def.items.map((code) => (
            <tr key={code}>
              <td className="pr-item-label">{ITEM_LABELS[code]}</td>
              <td className={`pr-item-val ${value.items[code] === false ? 'pr-no' : ''}`}>
                {mark(value.items[code] ?? null)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {value.observations && <div className="pr-obs"><em>Obs:</em> {value.observations}</div>}
    </div>
  );
}

export function PracticalPrint({
  input,
  studentName,
  dni,
}: {
  input: PracticalExamInput;
  studentName: string;
  dni: string | null;
}) {
  const duration = formatDuration(diffMinutes(input.weather.start_time, input.weather.end_time));
  const approved = input.result_declared;

  return (
    <main className="pr-page mx-auto max-w-3xl px-4 py-8">
      <style>{`
        @media print {
          @page { margin: 10mm; }
          html, body { margin: 0 !important; background: #fff !important; }
          .pr-noprint { display: none !important; }
          .pr-page { max-width: none !important; padding: 0 !important; }
        }
        .pr-doc { color: #111; font-size: 12px; }
        .pr-h1 { text-align: center; font-weight: 700; font-size: 14px; }
        .pr-sub { text-align: center; font-size: 11px; color: #444; margin-bottom: 10px; }
        .pr-band { background: #1e3a5f; color: #fff; padding: 3px 8px; font-weight: 700; font-size: 11px; margin: 10px 0 6px; }
        .pr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 16px; }
        .pr-row { display: flex; justify-content: space-between; border-bottom: 1px solid #ddd; padding: 2px 0; }
        .pr-row span:first-child { color: #555; }
        .pr-tests { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .pr-section { border: 1px solid #ccc; border-radius: 4px; padding: 6px; margin-bottom: 6px; }
        .pr-section-title { font-weight: 600; margin-bottom: 3px; }
        .pr-items { width: 100%; border-collapse: collapse; }
        .pr-item-label { padding: 1px 0; }
        .pr-item-val { text-align: right; font-weight: 700; width: 40px; }
        .pr-no { color: #c00; }
        .pr-obs { margin-top: 3px; font-size: 11px; color: #333; }
        .pr-result { border: 2px solid #1e3a5f; border-radius: 4px; padding: 8px; margin-top: 10px; text-align: center; }
        .pr-result strong { font-size: 16px; }
        .pr-approved { color: #0a7d2c; }
        .pr-failed { color: #c00; }
        .pr-signs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-top: 30px; text-align: center; font-size: 11px; }
        .pr-sign-line { border-top: 1px solid #333; padding-top: 4px; }
        .pr-jurada { margin-top: 16px; font-size: 10px; text-align: center; color: #444; font-style: italic; }
      `}</style>

      <div className="pr-noprint mb-6 flex justify-end">
        <Button variant="primary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />Imprimir
        </Button>
      </div>

      <div className="pr-doc">
        <div className="pr-h1">FEDERACIÓN ARGENTINA DE VUELO LIBRE</div>
        <div className="pr-sub">Cuestionario para la rendición del examen práctico — {input.license_type}</div>

        <div className="pr-band">Datos del alumno</div>
        <div className="pr-grid">
          <div className="pr-row"><span>Alumno</span><span>{studentName}</span></div>
          <div className="pr-row"><span>DNI</span><span>{dni ?? '—'}</span></div>
          <div className="pr-row"><span>Fecha</span><span>{input.exam_date}</span></div>
          <div className="pr-row"><span>Lugar</span><span>{input.place || '—'}</span></div>
          <div className="pr-row"><span>Club</span><span>{input.club || '—'}</span></div>
          <div className="pr-row"><span>Instructor</span><span>{input.instructor_name || '—'}</span></div>
          <div className="pr-row"><span>Examinador</span><span>{input.examiner_name || '—'}</span></div>
          <div className="pr-row"><span>Rendido antes s/Reg?</span><span>{input.previously_taken === 'SI' ? 'SI' : input.previously_taken === 'NA' ? 'N/A' : '—'}</span></div>
        </div>

        <div className="pr-band">Condiciones climáticas</div>
        <div className="pr-grid">
          <div className="pr-row"><span>Viento</span><span>{input.weather.wind_deg ?? '—'}°</span></div>
          <div className="pr-row"><span>Techo de nubes</span><span>{input.weather.cloud_base_ft ?? '—'} ft</span></div>
          <div className="pr-row"><span>Temperatura</span><span>{input.weather.temperature_c ?? '—'} °C</span></div>
          <div className="pr-row"><span>Precipitación</span><span>{input.weather.precipitation == null ? '—' : input.weather.precipitation ? 'SI' : 'NO'}</span></div>
          <div className="pr-row"><span>Hora inicio</span><span>{input.weather.start_time || '—'}</span></div>
          <div className="pr-row"><span>Hora fin</span><span>{input.weather.end_time || '—'}</span></div>
          <div className="pr-row"><span>Tiempo total</span><span>{duration}</span></div>
        </div>

        {TESTS.map((testNo) => (
          <div key={testNo}>
            <div className="pr-band">Prueba N° {testNo}</div>
            <div className="pr-tests">
              {baseSectionsOf(testNo).map((key) => {
                const rep = repetitionOf(key);
                return (
                  <div key={key}>
                    <Section sectionKey={key} input={input} />
                    {rep && isSectionAttempted(input.sections, rep) && (
                      <Section sectionKey={rep} input={input} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pr-result">
          <div>RESULTADO FINAL</div>
          <strong className={approved ? 'pr-approved' : 'pr-failed'}>
            {approved == null ? '—' : approved ? 'APROBADO' : 'DESAPROBADO'}
          </strong>
          {input.result_observations && <div className="pr-obs">{input.result_observations}</div>}
        </div>

        <div className="pr-signs">
          <div className="pr-sign-line">EXAMINADO<br />{studentName}</div>
          <div className="pr-sign-line">INSTRUCTOR<br />{input.instructor_name || '—'}</div>
          <div className="pr-sign-line">EXAMINADOR<br />{input.examiner_name || '—'}</div>
        </div>

        <div className="pr-jurada">
          IMPORTANTE: lo completado aquí, avalado por los firmantes, posee condición de declaración jurada.
        </div>
      </div>
    </main>
  );
}
