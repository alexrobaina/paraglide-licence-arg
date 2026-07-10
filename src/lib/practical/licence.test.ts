import { describe, expect, it } from 'vitest';
import { summarizeLicence, summarizeLicencesByLevel } from './licence';

const passedTheory = { passed: true };
const failedTheory = { passed: false };
const finalPass = { status: 'final' as const, result_declared: true };
const finalFail = { status: 'final' as const, result_declared: false };
const draftPass = { status: 'draft' as const, result_declared: true };

describe('summarizeLicence', () => {
  it('an empty record is not ready', () => {
    expect(summarizeLicence([], [])).toEqual({ theoryPassed: false, practicalPassed: false, ready: false });
  });

  it('is ready only when theory AND a closed practical both passed', () => {
    expect(summarizeLicence([passedTheory], [finalPass]).ready).toBe(true);
  });

  it('theory alone is not a licence', () => {
    expect(summarizeLicence([passedTheory], []).ready).toBe(false);
  });

  it('a draft practical does not count', () => {
    expect(summarizeLicence([passedTheory], [draftPass]).ready).toBe(false);
  });

  it('a failed closed practical does not count', () => {
    expect(summarizeLicence([passedTheory], [finalFail]).practicalPassed).toBe(false);
  });
});

describe('summarizeLicencesByLevel', () => {
  it('is empty when the student has nothing', () => {
    expect(summarizeLicencesByLevel([], [])).toEqual([]);
  });

  it('does NOT cross levels: N3 theory + N4 practical are two separate licences', () => {
    const groups = summarizeLicencesByLevel(
      [{ level: 'N3', passed: true }],
      [{ level: 'N4', ...finalPass }],
    );
    expect(groups).toHaveLength(2);
    const n3 = groups.find((g) => g.level === 'N3')!;
    const n4 = groups.find((g) => g.level === 'N4')!;
    expect(n3).toMatchObject({ theoryPassed: true, practicalPassed: false, ready: false });
    expect(n4).toMatchObject({ theoryPassed: false, practicalPassed: true, ready: false });
  });

  it('grants a level only when its own theory and practical both passed', () => {
    const groups = summarizeLicencesByLevel(
      [{ level: 'N3', passed: true }],
      [{ level: 'N3', ...finalPass }],
    );
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ level: 'N3', ready: true });
  });

  it('orders levels down the ladder, unassigned last', () => {
    const groups = summarizeLicencesByLevel(
      [{ level: 'N5', passed: true }, { level: 'N3', passed: true }, { level: null, passed: true }],
      [{ level: 'N4', ...finalPass }],
    );
    expect(groups.map((g) => g.level)).toEqual(['N3', 'N4', 'N5', null]);
  });

  it('carries a human label for each level', () => {
    const [g] = summarizeLicencesByLevel([{ level: 'N3', passed: true }], []);
    expect(g.label).toBe('Nivel 3');
  });

  it('aggregates several attempts of the same level', () => {
    const groups = summarizeLicencesByLevel(
      [{ level: 'N3', passed: false }, { level: 'N3', passed: true }],
      [{ level: 'N3', ...finalFail }, { level: 'N3', ...finalPass }],
    );
    expect(groups).toHaveLength(1);
    expect(groups[0].ready).toBe(true);
  });

  it('groups exams with no level under a single "sin nivel" bucket', () => {
    const groups = summarizeLicencesByLevel(
      [{ level: null, passed: true }],
      [{ level: null, ...finalPass }],
    );
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ level: null, label: 'Sin nivel', ready: true });
  });
});
