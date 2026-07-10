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
// A student climbs the FAVL ladder; each level is its own licence. These group
// theory + practical by level so N3 theory never counts toward an N4 licence.

import { levelLabel, levelOrder } from './levels';

export interface LeveledTheory extends TheoryLike {
  level: string | null;
}
export interface LeveledPractical extends PracticalLike {
  level: string | null;
}

export interface LevelLicence extends LicenceSummary {
  level: string | null;
  label: string;
}

export function summarizeLicencesByLevel(
  theory: LeveledTheory[],
  practical: LeveledPractical[],
): LevelLicence[] {
  const levels = new Set<string | null>();
  for (const t of theory) levels.add(t.level);
  for (const p of practical) levels.add(p.level);

  return [...levels]
    .map((level) => {
      const summary = summarizeLicence(
        theory.filter((t) => t.level === level),
        practical.filter((p) => p.level === level),
      );
      return { level, label: levelLabel(level), ...summary };
    })
    .sort((a, b) => levelOrder(a.level) - levelOrder(b.level));
}
