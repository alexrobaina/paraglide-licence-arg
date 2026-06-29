import type { ExamResult, Question, QuestionResult } from './types';
import { EXAM_MAX_SCORE, EXAM_PASS_MARK } from './constants';

/**
 * Califica una pregunta dada la selección de letras.
 * Puntaje = suma de score de las opciones elegidas, acotado a [0, maxScore]
 * (una pregunta nunca resta al total global).
 */
export function gradeQuestion(q: Question, selected: string[]): QuestionResult {
  const chosen = new Set(selected);
  const rawScore = q.options
    .filter((o) => chosen.has(o.letter))
    .reduce((sum, o) => sum + o.score, 0);

  const score = Math.max(0, Math.min(rawScore, q.maxScore));

  const correctLetters = q.options.filter((o) => o.correct).map((o) => o.letter);
  const perfect =
    correctLetters.length === selected.length &&
    correctLetters.every((l) => chosen.has(l));

  return {
    questionId: q.uid,
    selected,
    score,
    maxScore: q.maxScore,
    perfect,
  };
}

/** ¿La selección es correcta? (eligió exactamente todas las correctas). */
export function isPerfect(q: Question, selected: string[]): boolean {
  return gradeQuestion(q, selected).perfect;
}

/**
 * Califica un simulacro completo. Escala la suma cruda al objetivo de 360
 * (por si el set no sumara exactamente 360 de máximo).
 */
export function gradeExam(
  questions: Question[],
  answers: Record<string, string[]>,
  elapsedMs: number
): ExamResult {
  const details = questions.map((q) => {
    const res = gradeQuestion(q, answers[q.uid] ?? []);
    return { ...res, question: q };
  });

  const rawTotal = details.reduce((s, d) => s + d.score, 0);
  const rawMax = details.reduce((s, d) => s + d.maxScore, 0) || 1;

  // Escala a 360 para mantener el umbral oficial estable.
  const total = Math.round((rawTotal / rawMax) * EXAM_MAX_SCORE);

  const perSection: ExamResult['perSection'] = {};
  for (const d of details) {
    const sec = d.question.section;
    perSection[sec] ??= { correct: 0, total: 0, score: 0 };
    perSection[sec].total += 1;
    perSection[sec].score += d.score;
    if (d.perfect) perSection[sec].correct += 1;
  }

  return {
    total,
    maxTotal: EXAM_MAX_SCORE,
    passed: total >= EXAM_PASS_MARK,
    passMark: EXAM_PASS_MARK,
    correctCount: details.filter((d) => d.perfect).length,
    questionCount: questions.length,
    elapsedMs,
    perSection,
    details,
  };
}

export function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
