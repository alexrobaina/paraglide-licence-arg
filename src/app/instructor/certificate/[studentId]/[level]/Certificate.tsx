'use client';

import { Printer } from 'lucide-react';
import Button from '@/components/ui/Button';

export interface CertificateData {
  clubHeader: string;
  levelLabel: string;
  // alumno
  lastName: string;
  firstName: string;
  dni: string;
  // examinador
  examDate: string;
  place: string;
  club: string;
  instructor: string;
  examiner: string;
  // resultado teórico
  questionsAsked: number;
  questionsAnswered: number;
  score: number;
  maxScore: number;
  passPoints: number;
  passPct: number;
  // práctico
  practicalApprovedOn: string;
}

/** FAVL PRE-CERTIFICADO — the printable diploma that merges the theory result
 * and the practical result for a granted licence level. */
export function Certificate({ data }: { data: CertificateData }) {
  const pct = data.maxScore > 0 ? (data.score / data.maxScore) * 100 : 0;
  const notAnswered = data.questionsAsked - data.questionsAnswered;
  const fullName = `${data.firstName} ${data.lastName}`.trim();

  return (
    <main className="cert-page mx-auto max-w-3xl px-4 py-8">
      <style>{`
        @media print {
          @page { margin: 8mm; }
          html, body { margin: 0 !important; background: #fff !important; }
          .cert-noprint { display: none !important; }
          .cert-page { max-width: none !important; padding: 0 !important; }
        }
        .cert { color:#111; border:2px solid #1e3a5f; }
        .cert-band { background:#1e3a5f; color:#fff; text-align:center; font-weight:700; padding:4px; }
        .cert-sub { text-align:center; font-size:12px; padding:2px 8px; }
        .cert-title { text-align:center; font-weight:800; font-size:18px; padding:2px 0 6px; }
        .cert-rule { text-align:center; font-size:11px; background:#eef2f7; padding:4px 8px; border-top:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1; }
        .cert-section { background:#2f5c8f; color:#fff; text-align:center; font-weight:700; font-size:12px; padding:3px; }
        .cert-row { display:grid; grid-template-columns:220px 1fr; border-bottom:1px solid #e2e8f0; }
        .cert-row > div { padding:4px 10px; }
        .cert-row > div:first-child { color:#334155; font-weight:600; border-right:1px solid #e2e8f0; background:#f8fafc; }
        .cert-result { position:relative; }
        .cert-approved { position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
                         background:#dcedc1; color:#0a7d2c; font-weight:800; font-size:22px; letter-spacing:2px; }
        .cert-cert { padding:12px 16px; text-align:center; font-size:13px; }
        .cert-practical { text-align:center; font-weight:700; font-size:13px; padding:2px; }
        .cert-felic { text-align:center; font-weight:800; font-style:italic; font-size:16px; padding:8px 0; }
        .cert-signs { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; padding:24px 16px 12px; text-align:center; font-size:11px; }
        .cert-signs > div { border-top:1px solid #333; padding-top:4px; }
      `}</style>

      <div className="cert-noprint mb-6 flex justify-end">
        <Button variant="primary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />Imprimir certificado
        </Button>
      </div>

      <div className="cert" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        <div className="cert-band">PRE-CERTIFICADO</div>
        {data.clubHeader && <div className="cert-sub" style={{ fontWeight: 700 }}>{data.clubHeader}</div>}
        <div className="cert-sub" style={{ fontWeight: 700 }}>FEDERACIÓN ARGENTINA DE VUELO LIBRE</div>
        <div className="cert-sub">CUESTIONARIO PARA LA PREPARACIÓN DEL EXAMEN TEÓRICO DE:</div>
        <div className="cert-title">LICENCIA DE {data.levelLabel.toUpperCase()}</div>
        <div className="cert-rule">
          Examen: {data.questionsAsked} preguntas del total de este cuestionario. Aprobación: ≥{data.passPct}% del
          puntaje total: de {data.passPoints} a {data.maxScore} puntos.
        </div>

        <div className="cert-section">DATOS PERSONALES DEL ALUMNO</div>
        <div className="cert-row"><div>APELLIDO</div><div>{data.lastName || '—'}</div></div>
        <div className="cert-row"><div>NOMBRES</div><div>{data.firstName || '—'}</div></div>
        <div className="cert-row"><div>DNI</div><div>{data.dni || '—'}</div></div>
        <div className="cert-row"><div>TIPO DE LICENCIA</div><div>{data.levelLabel}</div></div>

        <div className="cert-section">DATOS PARA EL EXAMINADOR</div>
        <div className="cert-row"><div>FECHA</div><div>{data.examDate}</div></div>
        <div className="cert-row"><div>LUGAR</div><div>{data.place || '—'}</div></div>
        <div className="cert-row"><div>CLUB</div><div>{data.club || '—'}</div></div>
        <div className="cert-row"><div>INSTRUCTOR</div><div>{data.instructor || '—'}</div></div>
        <div className="cert-row"><div>EXAMINADOR</div><div>{data.examiner || '—'}</div></div>

        <div className="cert-section">RESULTADO</div>
        <div className="cert-result">
          <div>
            <div className="cert-row"><div>PREGUNTAS CUESTIONADAS</div><div>{data.questionsAsked}</div></div>
            <div className="cert-row"><div>PREGUNTAS RESPONDIDAS</div><div>{data.questionsAnswered}</div></div>
            <div className="cert-row"><div>NO RESPONDIDAS</div><div>{notAnswered}</div></div>
            <div className="cert-row"><div>PUNTAJE</div><div>{data.score} de {data.maxScore} Máx.</div></div>
            <div className="cert-row"><div>PORCENTUAL</div><div>{pct.toFixed(2)}%</div></div>
          </div>
        </div>
        <div className="cert-approved" style={{ position: 'static', padding: '6px' }}>APROBADO</div>

        <div className="cert-cert">
          Por la presente, certifico que el cursante <strong>{fullName}</strong>, ha efectuado el examen teórico
          correspondiente a: <strong>{data.levelLabel}</strong>, habiendo APROBADO conforme a lo contenido en la
          tabla superior.
        </div>
        <div className="cert-practical">EXAMEN PRÁCTICO: APROBADO</div>
        <div className="cert-sub">APROBADO EL: {data.practicalApprovedOn}</div>
        <div className="cert-felic">¡FELICITACIONES!</div>

        <div className="cert-signs">
          <div>Examinado<br />{fullName}</div>
          <div>Examinador<br />{data.examiner || '—'}</div>
          <div>Instructor<br />{data.instructor || '—'}</div>
        </div>
      </div>
    </main>
  );
}
