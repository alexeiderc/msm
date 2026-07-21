"use client";

import { Globe } from "lucide-react";
import { useI18n, LOCALE_LABELS, type Locale } from "@/lib/i18n/context";

const allLocales: Locale[] = ["en", "es", "pt", "fr"];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 transition hover:border-msm-blue hover:text-msm-blue"
        aria-label="Change language"
      >
        <Globe size={14} />
        {locale.toUpperCase()}
      </button>
      <div className="absolute right-0 top-full z-50 mt-1 hidden w-36 rounded-md border border-slate-200 bg-white shadow-lift group-hover:block">
        {allLocales.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold transition ${
              locale === loc ? "bg-msm-blue text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="w-5 text-center">{loc.toUpperCase()}</span>
            {LOCALE_LABELS[loc]}
          </button>
        ))}
      </div>
    </div>
  );
}
