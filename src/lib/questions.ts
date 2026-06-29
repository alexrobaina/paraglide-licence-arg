import raw from '@/data/questions.json';
import enTranslations from '@/data/questions.en.json';
import type { Question, Section } from './types';
import type { Locale } from '@/i18n/messages';

export const QUESTIONS = raw as Question[];

type QuestionTranslation = { question: string; options: Record<string, string> };
const EN = enTranslations as Record<string, QuestionTranslation>;

/** Hay traducción al inglés disponible para esta pregunta. */
export function hasTranslation(uid: string): boolean {
  return uid in EN;
}

/**
 * Devuelve la pregunta en el idioma pedido. Para 'en', reemplaza enunciado y
 * textos de opciones por su traducción (conservando puntajes/correctas). Si no
 * hay traducción, cae a español.
 */
export function localizeQuestion(q: Question, locale: Locale): Question {
  if (locale === 'es') return q;
  const tr = EN[q.uid];
  if (!tr) return q;
  return {
    ...q,
    question: tr.question ?? q.question,
    options: q.options.map((o) => ({
      ...o,
      text: tr.options?.[o.letter] ?? o.text,
    })),
  };
}

export const QUESTIONS_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.uid, q])
);

export function getQuestionsBySection(sections: Section[]): Question[] {
  if (sections.length === 0) return QUESTIONS;
  const set = new Set(sections);
  return QUESTIONS.filter((q) => set.has(q.section));
}

export function countBySection(): Record<string, number> {
  return QUESTIONS.reduce<Record<string, number>>((acc, q) => {
    acc[q.section] = (acc[q.section] ?? 0) + 1;
    return acc;
  }, {});
}

/** Fisher-Yates shuffle (no muta el original). */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Muestra n preguntas al azar de un conjunto (o de todo el banco). */
export function sampleQuestions(n: number, pool: Question[] = QUESTIONS): Question[] {
  return shuffle(pool).slice(0, Math.min(n, pool.length));
}
