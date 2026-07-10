import { describe, expect, it } from 'vitest';
import { summarizeLicence, summarizeLicencesByLevel } from './licence';

const finalPass = { status: 'final' as const, result_declared: true };
const finalFail = { status: 'final' as const, result_declared: false };
const draftPass = { status: 'draft' as const, result_declared: true };

const theory = (level: string | null, passed: boolean, date = '2025-01-01') => ({ level, passed, date });
const prac = (level: string | null, base: typeof finalPass | typeof finalFail | typeof draftPass, date = '2025-01-01') =>
  ({ level, ...base, date });

describe('summarizeLicence', () => {
  it('is ready only when theory AND a closed practical both passed', () => {
    expect(summarizeLicence([{ passed: true }], [finalPass]).ready).toBe(true);
    expect(summarizeLicence([{ passed: true }], [draftPass]).ready).toBe(false);
    expect(summarizeLicence([{ passed: true }], [finalFail]).ready).toBe(false);
  });
});

describe('summarizeLicencesByLevel', () => {
  it('always shows the full ladder, in order, even with no exams', () => {
    const groups = summarizeLicencesByLevel([], []);
    expect(groups.map((g) => g.level)).toEqual(['ALU', 'N3', 'N4', 'N5']);
    expect(groups.every((g) => g.status === 'not_started')).toBe(true);
  });

  it('marks a level granted only when its own theory and practical passed', () => {
    const groups = summarizeLicencesByLevel([theory('N3', true)], [prac('N3', finalPass)]);
    const n3 = groups.find((g) => g.level === 'N3')!;
    expect(n3.status).toBe('granted');
    expect(n3.theoryPassed && n3.practicalPassed).toBe(true);
  });

  it('does NOT cross levels: N3 theory + N4 practical are separate, neither granted', () => {
    const groups = summarizeLicencesByLevel([theory('N3', true)], [prac('N4', finalPass)]);
    expect(groups.find((g) => g.level === 'N3')!.status).toBe('in_progress');
    expect(groups.find((g) => g.level === 'N4')!.status).toBe('in_progress');
  });

  it('in_progress when there is activity but the licence is not complete', () => {
    const groups = summarizeLicencesByLevel([theory('N3', false)], []);
    expect(groups.find((g) => g.level === 'N3')!.status).toBe('in_progress');
  });

  it('stamps the grant date as the moment BOTH legs were satisfied (the later one)', () => {
    const groups = summarizeLicencesByLevel(
      [theory('ALU', true, '2025-03-10')],
      [prac('ALU', finalPass, '2025-05-20')],
    );
    expect(groups.find((g) => g.level === 'ALU')!.grantedAt).toBe('2025-05-20');
  });

  it('uses the earliest passing exam of each leg for the grant date', () => {
    const groups = summarizeLicencesByLevel(
      [theory('N3', true, '2025-06-01'), theory('N3', true, '2025-02-01')],
      [prac('N3', finalPass, '2025-04-01'), prac('N3', finalPass, '2025-01-01')],
    );
    // earliest theory pass = 02-01, earliest practical pass = 01-01 → granted when both met = 02-01
    expect(groups.find((g) => g.level === 'N3')!.grantedAt).toBe('2025-02-01');
  });

  it('has no grant date while not granted', () => {
    const groups = summarizeLicencesByLevel([theory('N3', true)], []);
    expect(groups.find((g) => g.level === 'N3')!.grantedAt).toBeNull();
  });

  it('appends a "Sin nivel" bucket after the ladder when legacy exams have no level', () => {
    const groups = summarizeLicencesByLevel([theory(null, true)], [prac(null, finalPass)]);
    expect(groups.map((g) => g.level)).toEqual(['ALU', 'N3', 'N4', 'N5', null]);
    const sinNivel = groups.find((g) => g.level === null)!;
    expect(sinNivel).toMatchObject({ label: 'Sin nivel', status: 'granted' });
  });

  it('labels each ladder rung', () => {
    const labels = summarizeLicencesByLevel([], []).map((g) => g.label);
    expect(labels).toEqual(['Alumno', 'Nivel 3', 'Nivel 4', 'Nivel 5']);
  });

  it('an empty-string date does not poison the grant date', () => {
    const groups = summarizeLicencesByLevel(
      [{ level: 'N3', passed: true, date: '' }],
      [prac('N3', finalPass, '2025-05-20')],
    );
    // the empty theory date must not win over the real practical date
    expect(groups.find((g) => g.level === 'N3')!.grantedAt).toBe('2025-05-20');
  });

  it('a null date falls back to the other leg', () => {
    const groups = summarizeLicencesByLevel(
      [{ level: 'N3', passed: true, date: null as unknown as string }],
      [prac('N3', finalPass, '2025-05-20')],
    );
    expect(groups.find((g) => g.level === 'N3')!.grantedAt).toBe('2025-05-20');
  });

  it('an off-ladder level code appears after the ladder, before null', () => {
    const groups = summarizeLicencesByLevel(
      [{ level: 'N9', passed: true, date: '2025-01-01' }, { level: null, passed: true, date: '2025-01-01' }],
      [prac('N9', finalPass), prac(null, finalPass)],
    );
    expect(groups.map((g) => g.level)).toEqual(['ALU', 'N3', 'N4', 'N5', 'N9', null]);
  });
});
