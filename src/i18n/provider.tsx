'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DICT,
  DEFAULT_LOCALE,
  LANG_STORAGE_KEY,
  SECTION_LABELS,
  type Locale,
  type MessageKey,
} from './messages';
import type { Section } from '@/lib/types';

type Vars = Record<string, string | number>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey, vars?: Vars) => string;
  ts: (section: Section) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Arranca en el idioma por defecto (coincide con SSR); se ajusta tras montar.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      // Español por defecto; solo cambia si el usuario eligió otro idioma antes.
      const saved = window.localStorage.getItem(LANG_STORAGE_KEY) as Locale | null;
      if (saved === 'es' || saved === 'en') {
        setLocaleState(saved);
      }
    } catch {
      /* sin acceso a storage: queda el idioma por defecto (es) */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => interpolate(DICT[key]?.[locale] ?? key, vars),
      ts: (section) => SECTION_LABELS[section]?.[locale] ?? section,
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n debe usarse dentro de <I18nProvider>');
  return ctx;
}

/** Atajo: devuelve la función de traducción. */
export function useT() {
  return useI18n().t;
}
