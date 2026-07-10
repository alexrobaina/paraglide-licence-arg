// ============================================================================
// FAVL — Cuestionario para la rendición del examen práctico.
//
// The planilla is a legal instrument (declaración jurada), so its shape is
// versioned: a stored exam carries the `form_version` it was filled under and
// renders through that definition forever. Bump the version, add a new const —
// never edit a published one.
//
// This module is the single source of truth for the form: rendering (UI),
// validation (schema.ts) and evaluation (evaluate.ts) all read from it.
// ============================================================================

export const PRACTICAL_FORM_VERSION = 1;

export type Terrain = 'llanura' | 'montana';

export const ITEM_LABELS = {
  PREPARACION: 'Preparación',
  CHEQUEO: 'Chequeo',
  DESPEGUE: 'Despegue',
  CONOS: 'Conos',
  VUELO_1: 'Vuelo 1',
  VUELO_2: 'Vuelo 2',
  CIRC_APROX: 'Circ. de aprox.',
} as const;

export type ItemCode = keyof typeof ITEM_LABELS;

export const TERRAIN_LABELS: Record<Terrain, string> = {
  llanura: 'Llanura',
  montana: 'Montaña',
};

export const NOTE_VUELO_1 =
  'Programa del vuelo: sin interrupción, dos giros sucesivos o rotaciones completas hacia el ' +
  'mismo lado, todo progresivo y amortiguado, iniciando y finalizando sobre un eje dado, en un ' +
  'tiempo máximo de 25 segundos.';

export const NOTE_VUELO_2 =
  'Programa del vuelo: un giro completo hacia la derecha, seguido sin interrupción de un giro ' +
  'completo hacia la izquierda, todo progresivo y amortiguado, iniciando y finalizando cada giro ' +
  'sobre un eje dado, en un tiempo máximo de 35 segundos. El ejercicio debe realizarse cerca de ' +
  'la zona de observación y comenzarse en el eje y altura determinados por el examinador.';

export type TestNo = 1 | 2 | 3;

export interface SectionDef {
  readonly key: SectionKey;
  readonly testNo: TestNo;
  readonly repetition: boolean;
  readonly terrain: Terrain | null;
  readonly items: readonly ItemCode[];
  readonly note?: string;
}

const TERRAIN_ITEMS = {
  llanura: ['PREPARACION', 'CHEQUEO', 'DESPEGUE', 'CONOS'],
  montana: ['PREPARACION', 'CHEQUEO', 'DESPEGUE'],
} as const satisfies Record<Terrain, readonly ItemCode[]>;

// Item order follows the printed planilla top-to-bottom, not chronology.
const FLIGHT_ITEMS = {
  1: ['VUELO_1', 'CIRC_APROX', 'DESPEGUE'],
  2: ['VUELO_2', 'CIRC_APROX', 'DESPEGUE'],
} as const;

export const PRACTICAL_FORM_V1 = [
  { key: 't1-llanura', testNo: 1, repetition: false, terrain: 'llanura', items: TERRAIN_ITEMS.llanura },
  { key: 't1-montana', testNo: 1, repetition: false, terrain: 'montana', items: TERRAIN_ITEMS.montana },
  { key: 't1r-llanura', testNo: 1, repetition: true, terrain: 'llanura', items: TERRAIN_ITEMS.llanura },
  { key: 't1r-montana', testNo: 1, repetition: true, terrain: 'montana', items: TERRAIN_ITEMS.montana },
  { key: 't2', testNo: 2, repetition: false, terrain: null, items: FLIGHT_ITEMS[1], note: NOTE_VUELO_1 },
  { key: 't2r', testNo: 2, repetition: true, terrain: null, items: FLIGHT_ITEMS[1], note: NOTE_VUELO_1 },
  { key: 't3', testNo: 3, repetition: false, terrain: null, items: FLIGHT_ITEMS[2], note: NOTE_VUELO_2 },
  { key: 't3r', testNo: 3, repetition: true, terrain: null, items: FLIGHT_ITEMS[2], note: NOTE_VUELO_2 },
] as const satisfies readonly SectionDef[];

export type SectionKey =
  | 't1-llanura' | 't1-montana' | 't1r-llanura' | 't1r-montana'
  | 't2' | 't2r' | 't3' | 't3r';

export const SECTION_KEYS = PRACTICAL_FORM_V1.map((s) => s.key) as readonly SectionKey[];

const BY_KEY = new Map<SectionKey, SectionDef>(PRACTICAL_FORM_V1.map((s) => [s.key, s]));

export function sectionDef(key: SectionKey): SectionDef {
  const def = BY_KEY.get(key);
  if (!def) throw new Error(`unknown section: ${key}`);
  return def;
}

/** The repetition section that rescues `key`, or null if `key` already is one. */
export function repetitionOf(key: SectionKey): SectionKey | null {
  const def = sectionDef(key);
  if (def.repetition) return null;
  return SECTION_KEYS.find(
    (k) => k !== key && sectionDef(k).repetition
      && sectionDef(k).testNo === def.testNo
      && sectionDef(k).terrain === def.terrain,
  ) ?? null;
}

/** The non-repetition sections a test is made of. Prueba 1 has two terrains. */
export function baseSectionsOf(testNo: TestNo): SectionKey[] {
  return SECTION_KEYS.filter((k) => sectionDef(k).testNo === testNo && !sectionDef(k).repetition);
}

/** `true` = SI, `false` = NO, `null` = still blank. */
export type ItemValue = boolean | null;

export interface SectionValue {
  items: Partial<Record<ItemCode, ItemValue>>;
  observations: string;
}

export type SectionsValue = Record<SectionKey, SectionValue>;

export function emptySections(): SectionsValue {
  const out = {} as SectionsValue;
  for (const def of PRACTICAL_FORM_V1) {
    const items: Partial<Record<ItemCode, ItemValue>> = {};
    for (const code of def.items) items[code] = null;
    out[def.key] = { items, observations: '' };
  }
  return out;
}
