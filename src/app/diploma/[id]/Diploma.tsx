'use client';

import { useEffect, useState } from 'react';
import { Award, Mountain, Printer, User } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Diploma({
  attemptId,
  initialName,
  fallbackEmail,
  examTitle,
  score,
  maxScore,
  date,
}: {
  attemptId: string;
  initialName: string;
  fallbackEmail: string;
  examTitle: string;
  score: number;
  maxScore: number;
  date: string;
}) {
  const [name, setName] = useState(initialName);

  // Remember the typed name per diploma (in this browser).
  useEffect(() => {
    const saved = localStorage.getItem(`diploma-name-${attemptId}`);
    if (saved) setName(saved);
  }, [attemptId]);

  function updateName(value: string) {
    setName(value);
    localStorage.setItem(`diploma-name-${attemptId}`, value);
  }

  const displayName = name.trim() || fallbackEmail;

  return (
    <main className="diploma-page mx-auto max-w-3xl px-4 py-10">
      {/* Print rules: remove browser header/footer + margins, center the diploma. */}
      <style>{`
        @media print {
          @page { margin: 0; }
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          .diploma-page {
            max-width: none !important;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12mm !important;
          }
          .diploma-card {
            width: 100%;
            max-width: 190mm;
          }
        }
      `}</style>

      {/* Control bar — hidden when printing */}
      <div className="print:hidden mb-6 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
            <User className="h-3.5 w-3.5" />
            Nombre y apellido del piloto
          </span>
          <input
            value={name}
            onChange={(e) => updateName(e.target.value)}
            placeholder="Ej: Juan Pérez"
            autoFocus
            className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
          />
        </label>
        <Button variant="primary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Descargar / Imprimir PDF
        </Button>
      </div>

      {/* The diploma itself */}
      <div
        className="diploma-card rounded-2xl border-4 border-double border-sky-600/40 bg-white p-10 text-center shadow-sm print:border-sky-700 print:shadow-none"
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-600 text-white">
          <Mountain className="h-8 w-8" />
        </div>

        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-sky-700">
          Certificado de Aprobación
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-neutral-900">
          ParaglideExam
        </h1>

        <p className="mt-8 text-sm text-neutral-500">Se certifica que</p>
        <p className="mt-1 font-serif text-2xl font-semibold text-neutral-900">
          {displayName}
        </p>

        <p className="mx-auto mt-4 max-w-md text-sm text-neutral-600">
          aprobó satisfactoriamente el examen <strong>{examTitle}</strong>, obteniendo un
          puntaje de <strong>{score}</strong> sobre {maxScore}.
        </p>

        <div className="mt-8 flex items-center justify-center gap-2 text-emerald-600">
          <Award className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Aprobado</span>
        </div>

        <div className="mt-10 flex items-end justify-between text-xs text-neutral-500">
          <div className="text-left">
            <div className="border-t border-neutral-300 pt-1">Fecha</div>
            <div className="mt-1 text-neutral-700">{date}</div>
          </div>
          <div className="text-right">
            <div className="border-t border-neutral-300 pt-1">Instructor</div>
            <div className="mt-1 text-neutral-700">Firma</div>
          </div>
        </div>
      </div>
    </main>
  );
}
