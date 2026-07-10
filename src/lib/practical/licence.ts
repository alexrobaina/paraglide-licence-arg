// ============================================================================
// A FAVL licence is earned by passing BOTH the theory Q&A exam and the
// practical checklist. This derives that combined verdict for a student.
// A practical only counts once it is a signed, closed planilla (status
// 'final') — a draft is not a result.
// ============================================================================

export interface TheoryLike {
  passed: boolean;
}

export interface PracticalLike {
  status: 'draft' | 'final';
  result_declared: boolean | null;
}

export interface LicenceSummary {
  theoryPassed: boolean;
  practicalPassed: boolean;
  /** In condition for the licence: theory and a closed practical both passed. */
  ready: boolean;
}

export function summarizeLicence(theory: TheoryLike[], practical: PracticalLike[]): LicenceSummary {
  const theoryPassed = theory.some((t) => t.passed);
  const practicalPassed = practical.some((p) => p.status === 'final' && p.result_declared === true);
  return { theoryPassed, practicalPassed, ready: theoryPassed && practicalPassed };
}

// --- Per-level licences ------------------------------------------------------
// A student climbs the FAVL ladder; each rung is its own licence. The full
// ladder is always shown (even not-started rungs), so the instructor sees the
// whole progression. N3 theory never counts toward an N4 licence.

import { LICENSE_LEVEL_CODES, levelLabel, levelOrder } from './levels';

export type LicenceStatus = 'granted' | 'in_progress' | 'not_started';

export interface LeveledTheory extends TheoryLike {
  level: string | null;
  date: string;
}
export interface LeveledPractical extends PracticalLike {
  level: string | null;
  date: string;
}

export interface LevelLicence {
  level: string | null;
  label: string;
  theoryPassed: boolean;
  practicalPassed: boolean;
  status: LicenceStatus;
  /** ISO date the licence became complete (both legs met), else null. */
  grantedAt: string | null;
}

/** Earliest ISO date in a list, or null. ISO strings compare lexicographically. */
function earliest(dates: string[]): string | null {
  return dates.length ? dates.reduce((a, b) => (a < b ? a : b)) : null;
}

export function summarizeLicencesByLevel(
  theory: LeveledTheory[],
  practical: LeveledPractical[],
): LevelLicence[] {
  const present = new Set<string | null>([
    ...theory.map((t) => t.level),
    ...practical.map((p) => p.level),
  ]);

  // The whole ladder, always — plus any off-ladder or null (legacy) buckets in use.
  const ladder: (string | null)[] = [...LICENSE_LEVEL_CODES];
  const extras = [...present].filter((l): l is string => l != null && !LICENSE_LEVEL_CODES.includes(l as never));
  const levels: (string | null)[] = [...ladder, ...extras];
  if (present.has(null)) levels.push(null);

  return levels
    .map((level) => {
      const th = theory.filter((t) => t.level === level);
      const pr = practical.filter((p) => p.level === level);
      const theoryPassed = th.some((t) => t.passed);
      const practicalPassed = pr.some((p) => p.status === 'final' && p.result_declared === true);
      const hasActivity = th.length > 0 || pr.length > 0;

      let status: LicenceStatus = 'not_started';
      let grantedAt: string | null = null;
      if (theoryPassed && practicalPassed) {
        status = 'granted';
        const tDate = earliest(th.filter((t) => t.passed).map((t) => t.date));
        const pDate = earliest(
          pr.filter((p) => p.status === 'final' && p.result_declared === true).map((p) => p.date),
        );
        // Complete when the later of the two first-passes happened. Use explicit
        // null checks (not truthiness) so an empty-string date is still compared.
        grantedAt =
          tDate != null && pDate != null ? (tDate > pDate ? tDate : pDate) : (tDate ?? pDate);
      } else if (hasActivity) {
        status = 'in_progress';
      }

      return { level, label: levelLabel(level), theoryPassed, practicalPassed, status, grantedAt };
    })
    .sort((a, b) => levelOrder(a.level) - levelOrder(b.level));
}
