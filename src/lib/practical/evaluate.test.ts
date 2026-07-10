import { describe, expect, it } from 'vitest';
import { PRACTICAL_FORM_V1, emptySections, sectionDef } from './form';
import {
  computeResult,
  diffMinutes,
  formatDuration,
  isSectionApproved,
  isSectionAttempted,
  isSectionComplete,
  isTestApproved,
} from './evaluate';
import type { SectionKey, SectionsValue } from './form';

/** Marks every item of `key` with `value`. */
function fill(sections: SectionsValue, key: SectionKey, value: boolean): SectionsValue {
  const items = { ...sections[key].items };
  for (const code of sectionDef(key).items) items[code] = value;
  return { ...sections, [key]: { ...sections[key], items } };
}

/** Every section of the planilla passed on the first try. */
function allFirstTryPassed(): SectionsValue {
  let s = emptySections();
  for (const key of ['t1-llanura', 't1-montana', 't2', 't3'] as const) s = fill(s, key, true);
  return s;
}

describe('PRACTICAL_FORM_V1', () => {
  it('has the 8 sections of the FAVL planilla, in order', () => {
    expect(PRACTICAL_FORM_V1.map((s) => s.key)).toEqual([
      't1-llanura', 't1-montana', 't1r-llanura', 't1r-montana',
      't2', 't2r', 't3', 't3r',
    ]);
  });

  it('only prueba 1 / llanura evaluates conos', () => {
    expect(sectionDef('t1-llanura').items).toEqual(['PREPARACION', 'CHEQUEO', 'DESPEGUE', 'CONOS']);
    expect(sectionDef('t1-montana').items).toEqual(['PREPARACION', 'CHEQUEO', 'DESPEGUE']);
  });

  it('pruebas 2 and 3 evaluate the flight programme, not the terrain', () => {
    expect(sectionDef('t2').items).toEqual(['VUELO_1', 'CIRC_APROX', 'DESPEGUE']);
    expect(sectionDef('t3').items).toEqual(['VUELO_2', 'CIRC_APROX', 'DESPEGUE']);
    expect(sectionDef('t2').terrain).toBeNull();
  });

  it('mirrors each prueba into a repetition section with the same items', () => {
    for (const [base, rep] of [['t1-llanura', 't1r-llanura'], ['t2', 't2r'], ['t3', 't3r']] as const) {
      expect(sectionDef(rep).items).toEqual(sectionDef(base).items);
      expect(sectionDef(rep).repetition).toBe(true);
      expect(sectionDef(base).repetition).toBe(false);
    }
  });

  it('emptySections() starts every item unanswered', () => {
    const s = emptySections();
    for (const def of PRACTICAL_FORM_V1) {
      expect(s[def.key].observations).toBe('');
      for (const code of def.items) expect(s[def.key].items[code]).toBeNull();
    }
  });
});

describe('isSectionAttempted', () => {
  it('is false while every item is unanswered', () => {
    const s = emptySections();
    expect(isSectionAttempted(s, 't1r-llanura')).toBe(false);
  });

  it('is true as soon as one item is answered, even with NO', () => {
    const s = emptySections();
    s['t1r-llanura'].items.DESPEGUE = false;
    expect(isSectionAttempted(s, 't1r-llanura')).toBe(true);
  });
});

describe('isSectionComplete', () => {
  it('needs every item decided — SI or NO, never blank', () => {
    const s = fill(emptySections(), 't1-llanura', true);
    expect(isSectionComplete(s, 't1-llanura')).toBe(true);

    s['t1-llanura'].items.CONOS = false;
    expect(isSectionComplete(s, 't1-llanura')).toBe(true);

    s['t1-llanura'].items.CONOS = null;
    expect(isSectionComplete(s, 't1-llanura')).toBe(false);
  });
});

describe('isSectionApproved', () => {
  it('requires every item to be SI', () => {
    expect(isSectionApproved(fill(emptySections(), 't1-llanura', true), 't1-llanura')).toBe(true);
  });

  it('fails when a single item is NO', () => {
    const s = fill(emptySections(), 't1-llanura', true);
    s['t1-llanura'].items.CONOS = false;
    expect(isSectionApproved(s, 't1-llanura')).toBe(false);
  });

  it('fails when a single item is left unanswered', () => {
    const s = fill(emptySections(), 't1-llanura', true);
    s['t1-llanura'].items.CONOS = null;
    expect(isSectionApproved(s, 't1-llanura')).toBe(false);
  });

  it('an untouched section is not approved', () => {
    expect(isSectionApproved(emptySections(), 't2')).toBe(false);
  });
});

describe('isTestApproved', () => {
  it('prueba 1 needs BOTH llanura and montaña', () => {
    let s = fill(emptySections(), 't1-llanura', true);
    expect(isTestApproved(s, 1)).toBe(false);
    s = fill(s, 't1-montana', true);
    expect(isTestApproved(s, 1)).toBe(true);
  });

  it('a failed terrain is rescued by its repetition', () => {
    let s = fill(emptySections(), 't1-llanura', false);
    s = fill(s, 't1-montana', true);
    expect(isTestApproved(s, 1)).toBe(false);

    s = fill(s, 't1r-llanura', true);
    expect(isTestApproved(s, 1)).toBe(true);
  });

  it('a failed repetition does not rescue the terrain', () => {
    let s = fill(emptySections(), 't1-llanura', false);
    s = fill(s, 't1-montana', true);
    s = fill(s, 't1r-llanura', false);
    expect(isTestApproved(s, 1)).toBe(false);
  });

  it('pruebas 2 and 3 pass on the first try or on the repetition', () => {
    expect(isTestApproved(fill(emptySections(), 't2', true), 2)).toBe(true);
    expect(isTestApproved(fill(emptySections(), 't2r', true), 2)).toBe(true);
    expect(isTestApproved(fill(emptySections(), 't3', true), 3)).toBe(true);
    expect(isTestApproved(fill(emptySections(), 't3r', true), 3)).toBe(true);
    expect(isTestApproved(emptySections(), 3)).toBe(false);
  });
});

describe('computeResult', () => {
  it('an untouched planilla is not approved', () => {
    expect(computeResult(emptySections())).toBe(false);
  });

  it('approves when all three pruebas are approved', () => {
    expect(computeResult(allFirstTryPassed())).toBe(true);
  });

  it('one failed prueba without repetition sinks the exam', () => {
    const s = fill(allFirstTryPassed(), 't3', false);
    expect(computeResult(s)).toBe(false);
  });

  it('approves through repetitions', () => {
    let s = fill(allFirstTryPassed(), 't3', false);
    s = fill(s, 't3r', true);
    expect(computeResult(s)).toBe(true);
  });
});

describe('diffMinutes', () => {
  it('measures the elapsed exam time', () => {
    expect(diffMinutes('09:30', '11:05')).toBe(95);
    expect(diffMinutes('09:30', '09:30')).toBe(0);
  });

  it('returns null when an end precedes its start', () => {
    expect(diffMinutes('11:05', '09:30')).toBeNull();
  });

  it('returns null when a bound is missing or malformed', () => {
    expect(diffMinutes('', '11:05')).toBeNull();
    expect(diffMinutes('09:30', '')).toBeNull();
    expect(diffMinutes('9:30', '25:00')).toBeNull();
  });
});

describe('formatDuration', () => {
  it('renders the planilla TIEMPO TOTAL format', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(95)).toBe('1:35');
    expect(formatDuration(600)).toBe('10:00');
  });

  it('renders an em dash when there is nothing to show', () => {
    expect(formatDuration(null)).toBe('—');
  });
});
