import { cookies } from 'next/headers';
import {
  DICT,
  DEFAULT_LOCALE,
  LANG_COOKIE,
  SECTION_LABELS,
  interpolate,
  isLocale,
  type Locale,
  type MessageKey,
  type Vars,
} from './messages';
import type { Section } from '@/lib/types';

/**
 * Idioma elegido por el visitante, leído de la cookie. Es el equivalente en
 * servidor de useI18n(): permite que los server components rendericen ya
 * traducidos, en vez de pintar español y corregir tras hidratar.
 *
 * Ojo: usar cookies() marca la petición como dinámica.
 */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Traductor para server components. Misma API que useI18n(), pero async. */
export async function getT(): Promise<{
  locale: Locale;
  t: (key: MessageKey, vars?: Vars) => string;
  ts: (section: Section) => string;
}> {
  const locale = await getLocale();
  return {
    locale,
    t: (key, vars) => interpolate(DICT[key]?.[locale] ?? key, vars),
    ts: (section) => SECTION_LABELS[section]?.[locale] ?? section,
  };
}
