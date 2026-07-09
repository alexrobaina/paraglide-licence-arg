'use client';

import { useRouter } from 'next/navigation';
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
  LANG_COOKIE,
  LANG_STORAGE_KEY,
  SECTION_LABELS,
  interpolate,
  isLocale,
  type Locale,
  type MessageKey,
  type Vars,
} from './messages';
import type { Section } from '@/lib/types';

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey, vars?: Vars) => string;
  ts: (section: Section) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const ONE_YEAR = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  const hit = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  /** Viene del servidor (cookie), así el SSR y la hidratación coinciden. */
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (l: Locale) => {
      setLocaleState(l);
      document.cookie = `${LANG_COOKIE}=${l};path=/;max-age=${ONE_YEAR};samesite=lax`;
      // Los server components ya renderizados siguen en el idioma anterior:
      // refrescarlos es lo que hace que la página entera cambie de idioma.
      router.refresh();
    },
    [router]
  );

  // Migración única desde la versión que guardaba el idioma en localStorage.
  useEffect(() => {
    if (readCookie(LANG_COOKIE)) return;
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    } catch {
      /* sin acceso a storage: queda el idioma por defecto */
    }
    if (isLocale(saved) && saved !== locale) setLocale(saved);
  }, [locale, setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

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
