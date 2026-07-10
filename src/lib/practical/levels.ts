// ============================================================================
// The FAVL licence ladder — single source of truth for the app AND the DB CHECK
// constraint (keep supabase/migrations in sync with LICENSE_LEVEL_CODES).
//
// Labels are intentionally plain ("Nivel 3"); rename them here to the official
// FAVL names in one place and every screen follows.
// ============================================================================

export const LICENSE_LEVELS = [
  { code: 'N1', label: 'Nivel 1', order: 1 },
  { code: 'N2', label: 'Nivel 2', order: 2 },
  { code: 'N3', label: 'Nivel 3', order: 3 },
  { code: 'N4', label: 'Nivel 4', order: 4 },
  { code: 'N5', label: 'Nivel 5', order: 5 },
] as const;

export type LicenseLevel = (typeof LICENSE_LEVELS)[number]['code'];

export const LICENSE_LEVEL_CODES = LICENSE_LEVELS.map((l) => l.code) as LicenseLevel[];

const BY_CODE = new Map(LICENSE_LEVELS.map((l) => [l.code, l]));

export function isLicenseLevel(value: unknown): value is LicenseLevel {
  return typeof value === 'string' && BY_CODE.has(value as LicenseLevel);
}

export function levelLabel(code: string | null | undefined): string {
  if (!code) return 'Sin nivel';
  return BY_CODE.get(code as LicenseLevel)?.label ?? code;
}

/** Ladder position; null (unassigned) sorts after every real level. */
export function levelOrder(code: string | null | undefined): number {
  if (!code) return Number.MAX_SAFE_INTEGER;
  return BY_CODE.get(code as LicenseLevel)?.order ?? Number.MAX_SAFE_INTEGER - 1;
}
