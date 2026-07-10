import { describe, expect, it } from 'vitest';
import { gradeQuestion, gradeExam, isPerfect } from './scoring';
import { EXAM_MAX_SCORE } from './constants';
import type { Question, Option } from './types';

function opt(letter: string, score: number, correct: boolean): Option {
  return { letter, text: letter, score, correct };
}

function q(uid: string, options: Option[], maxScore: number, section = 'Meteorología'): Question {
  return { uid, id: uid, section: section as Question['section'], question: '?', options, multi: true, maxScore };
}

// A(+4 correct) B(+2 correct) C(-6 wrong), max 6 — the real bank's shape (q001).
const Q = q('q1', [opt('A', 4, true), opt('B', 2, true), opt('C', -6, false)], 6);

describe('gradeQuestion', () => {
  it('scores the sum of chosen options when both correct are picked', () => {
    const r = gradeQuestion(Q, ['A', 'B']);
    expect(r.score).toBe(6);
    expect(r.perfect).toBe(true);
  });

  it('floors a net-negative selection at 0 (a question never subtracts from the total)', () => {
    expect(gradeQuestion(Q, ['C']).score).toBe(0);
    expect(gradeQuestion(Q, ['C']).perfect).toBe(false);
  });

  it('gives partial credit for a partial-but-not-perfect selection', () => {
    const r = gradeQuestion(Q, ['A']); // one of two correct
    expect(r.score).toBe(4);
    expect(r.perfect).toBe(false);
  });

  it('a correct+incorrect mix is not perfect and nets the mix', () => {
    const r = gradeQuestion(Q, ['A', 'B', 'C']); // 4+2-6 = 0
    expect(r.score).toBe(0);
    expect(r.perfect).toBe(false);
  });

  it('an empty selection scores 0 and is not perfect', () => {
    expect(gradeQuestion(Q, [])).toMatchObject({ score: 0, perfect: false });
  });

  it('clamps a raw score above maxScore down to maxScore', () => {
    const big = q('q2', [opt('A', 5, true), opt('B', 5, true)], 6);
    expect(gradeQuestion(big, ['A', 'B']).score).toBe(6); // raw 10 → 6
  });

  it('isPerfect requires exactly the correct set', () => {
    expect(isPerfect(Q, ['A', 'B'])).toBe(true);
    expect(isPerfect(Q, ['A'])).toBe(false);
    expect(isPerfect(Q, ['A', 'B', 'C'])).toBe(false);
  });
});

describe('gradeExam', () => {
  it('scales the raw total to the 360-point target', () => {
    const questions = [Q, q('q2', [opt('A', 6, true)], 6)]; // rawMax 12
    // answer q1 perfectly (6), leave q2 blank (0) → raw 6 / 12 → 180
    const res = gradeExam(questions, { q1: ['A', 'B'] }, 0);
    expect(res.maxTotal).toBe(EXAM_MAX_SCORE);
    expect(res.total).toBe(Math.round((6 / 12) * EXAM_MAX_SCORE)); // 180
    expect(res.correctCount).toBe(1);
    expect(res.questionCount).toBe(2);
  });

  it('does not divide by zero when every maxScore is 0', () => {
    const zero = q('z', [opt('A', 0, true)], 0);
    const res = gradeExam([zero], { z: ['A'] }, 0);
    expect(res.total).toBe(0);
    expect(Number.isNaN(res.total)).toBe(false);
  });

  it('tallies per-section correct/total', () => {
    const meteo = Q;
    const aero = q('a1', [opt('A', 6, true)], 6, 'Aerodinámica');
    const res = gradeExam([meteo, aero], { q1: ['A', 'B'], a1: ['A'] }, 0);
    expect(res.perSection['Meteorología']).toMatchObject({ correct: 1, total: 1 });
    expect(res.perSection['Aerodinámica']).toMatchObject({ correct: 1, total: 1 });
  });
});
