// ============================================================================
// Derivations over a filled planilla. Pure functions — no I/O, no framework.
// The examiner still declares the final result by hand; `computeResult` only
// tells the UI (and the audit trail) what the items add up to.
// ============================================================================

import { baseSectionsOf, repetitionOf, sectionDef } from './form';
import type { SectionKey, SectionsValue, TestNo } from './form';

const TESTS: readonly TestNo[] = [1, 2, 3];

/** Any item decided — the examiner has touched this section. */
export function isSectionAttempted(sections: SectionsValue, key: SectionKey): boolean {
  return sectionDef(key).items.some((code) => sections[key].items[code] != null);
}

/** Every item decided, SI or NO. A planilla cannot be closed with blanks. */
export function isSectionComplete(sections: SectionsValue, key: SectionKey): boolean {
  return sectionDef(key).items.every((code) => sections[key].items[code] != null);
}

/** Every item is SI. A blank item is not an approval. */
export function isSectionApproved(sections: SectionsValue, key: SectionKey): boolean {
  return sectionDef(key).items.every((code) => sections[key].items[code] === true);
}

/** A base section passes on its own, or its repetition rescues it. */
function sectionPassed(sections: SectionsValue, key: SectionKey): boolean {
  if (isSectionApproved(sections, key)) return true;
  const rep = repetitionOf(key);
  return rep != null && isSectionApproved(sections, rep);
}

/** Prueba 1 demands both terrains; pruebas 2 and 3 have a single section. */
export function isTestApproved(sections: SectionsValue, testNo: TestNo): boolean {
  return baseSectionsOf(testNo).every((key) => sectionPassed(sections, key));
}

/** What the items add up to. The examiner may override it — see schema.ts. */
export function computeResult(sections: SectionsValue): boolean {
  return TESTS.every((t) => isTestApproved(sections, t));
}

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseTime(value: string): number | null {
  const m = HHMM.exec(value);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Elapsed minutes, or null when either bound is unusable or the exam runs backwards. */
export function diffMinutes(start: string, end: string): number | null {
  const from = parseTime(start);
  const to = parseTime(end);
  if (from == null || to == null || to < from) return null;
  return to - from;
}

/** The planilla's TIEMPO TOTAL cell: `H:MM`. */
export function formatDuration(minutes: number | null): string {
  if (minutes == null) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}
