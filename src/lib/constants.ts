import type { Section } from './types';

/** Cantidad de preguntas en el examen real. */
export const EXAM_QUESTION_COUNT = 60;

/** Puntaje objetivo del examen (60 × 6). */
export const EXAM_MAX_SCORE = 360;

/** Puntaje mínimo para aprobar (75%). */
export const EXAM_PASS_MARK = 270;

/** Penalización por opción incorrecta en el banco oficial. */
export const WRONG_PENALTY = -6;

export const SECTIONS: Section[] = [
  'Meteorología',
  'Aerodinámica',
  'Material',
  'Reglamentación',
  'Técnica de vuelo',
];

/** Metadatos visuales por tema (icono Lucide + acento de color). */
export const SECTION_META: Record<
  Section,
  { icon: string; accent: string; short: string }
> = {
  Meteorología: { icon: 'CloudSun', accent: 'text-sky-500', short: 'Meteo' },
  Aerodinámica: { icon: 'Wind', accent: 'text-cyan-500', short: 'Aero' },
  Material: { icon: 'Package', accent: 'text-amber-500', short: 'Material' },
  Reglamentación: { icon: 'Scale', accent: 'text-violet-500', short: 'Regla' },
  'Técnica de vuelo': {
    icon: 'Navigation',
    accent: 'text-emerald-500',
    short: 'Técnica',
  },
};

export const STORAGE_KEY = 'paraglide-exam:v1';
