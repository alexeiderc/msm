"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Brain, BookOpen, MessageCircle, Cpu, Lock, Eye } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { ScriptureBanner } from "@/components/maquina-futuro/scripture-banner";
import { PrayerBlock } from "@/components/maquina-futuro/prayer-block";
import { LanguageSwitcher } from "@/components/maquina-futuro/language-switcher";
import { I18nProvider, useI18n } from "@/lib/i18n/context";

function LandingContent() {
  const { t } = useI18n();

  const features = [
    { icon: Brain, title: t.landing.modulesList.vision, desc: t.landing.modulesList.visionDesc },
    { icon: Eye, title: t.landing.modulesList.meditation, desc: t.landing.modulesList.meditationDesc },
    { icon: MessageCircle, title: t.landing.modulesList.interview, desc: t.landing.modulesList.interviewDesc },
    { icon: Cpu, title: t.landing.modulesList.inventor, desc: t.landing.modulesList.inventorDesc },
    { icon: Lock, title: t.landing.modulesList.investor, desc: t.landing.modulesList.investorDesc },
    { icon: BookOpen, title: t.landing.modulesList.book, desc: t.landing.modulesList.bookDesc }
  ];

  return (
    <AppShell>
      <div className="fixed right-4 top-20 z-50">
        <LanguageSwitcher />
      </div>

      <section className="relative overflow-hidden bg-futura-void text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(108,92,231,0.35),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(0,206,201,0.18),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-6 px-4 py-16 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <Badge className="border-white/20 bg-white/10 text-futura-aura">{t.landing.company}</Badge>
            <h1 className="mt-4 text-4xl font-black md:text-6xl leading-tight">
              {t.landing.hero}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-futura-frost/80 md:text-lg">
              {t.landing.heroSubtitle}
            </p>
            <p className="mt-2 text-sm text-futura-aura/70">
              {t.landing.heroDisclaimer}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/maquina-del-futuro"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-futura-glow px-5 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5"
              >
                {t.landing.ctaDashboard} <ArrowRight size={17} />
              </Link>
              <Link
                href="/dashboard/maquina-del-futuro/investor-room"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15"
              >
                {t.landing.ctaInvestor} <Lock size={17} />
              </Link>
            </div>
          </div>

          <div className="msm-luminous-panel rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="grid h-12 w-12 place-items-center rounded-md bg-futura-glow text-white shadow-glow">
                <Sparkles size={22} />
              </span>
              <div>
                <p className="text-sm font-bold text-futura-aura/75">MVP Platform</p>
                <h2 className="text-xl font-black">Vision + AI + Faith + Code</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["Visions", "Meditation", "Interview", "Prototype", "Pitch", "Book", "Investor Room", "Declarations"].map((item) => (
                <span key={item} className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-center text-xs font-bold">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <ScriptureBanner />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 pb-6">
        <h2 className="text-2xl font-black text-msm-ink mb-6">{t.landing.modules}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <article key={f.title} className="rounded-lg border border-msm-line bg-white p-5 shadow-soft transition hover:shadow-glow">
                <Icon className="text-futura-glow" size={24} />
                <h3 className="mt-3 font-bold text-msm-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-5 text-slate-500">{f.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 pb-16">
        <PrayerBlock />
      </section>
    </AppShell>
  );
}

export default function MaquinaDelFuturoPage() {
  return (
    <I18nProvider>
      <LandingContent />
    </I18nProvider>
  );
}
