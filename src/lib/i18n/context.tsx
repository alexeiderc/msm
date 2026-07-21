"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import en from "./locales/en.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";
import fr from "./locales/fr.json";

export type Locale = "en" | "es" | "pt" | "fr";

const locales: Record<Locale, typeof en> = { en, es, pt, fr };

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Espanol",
  pt: "Portugues",
  fr: "Francais"
};

type I18nContextValue = {
  locale: Locale;
  t: typeof en;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  t: en,
  setLocale: () => {}
});

export function I18nProvider({ children, defaultLocale = "en" }: { children: ReactNode; defaultLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("mf-locale", newLocale);
      document.documentElement.lang = newLocale;
    }
  }, []);

  const value: I18nContextValue = {
    locale,
    t: locales[locale],
    setLocale
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem("mf-locale") as Locale | null;
  if (saved && locales[saved]) return saved;
  const browserLang = navigator.language.slice(0, 2) as Locale;
  if (locales[browserLang]) return browserLang;
  return "en";
}
