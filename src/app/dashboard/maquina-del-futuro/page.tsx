"use client";

import Link from "next/link";
import { Eye, Headphones, MessageCircle, Cpu, TrendingUp, BookOpen, Mic, Flame, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScriptureBanner } from "@/components/maquina-futuro/scripture-banner";
import { LanguageSwitcher } from "@/components/maquina-futuro/language-switcher";
import { I18nProvider, useI18n } from "@/lib/i18n/context";

function DashboardContent() {
  const { t } = useI18n();

  const cards = [
    { icon: Eye, title: t.dashboard.visionCount, value: "0", href: "/dashboard/maquina-del-futuro/visions", color: "text-futura-glow" },
    { icon: Headphones, title: t.dashboard.lastMeditation, value: t.dashboard.noMeditation, href: "/dashboard/maquina-del-futuro/visions", color: "text-futura-pulse" },
    { icon: MessageCircle, title: t.dashboard.lastInterview, value: t.dashboard.noInterview, href: "/dashboard/maquina-del-futuro/visions", color: "text-futura-ember" },
    { icon: Cpu, title: t.dashboard.activePrototypes, value: "0", href: "/dashboard/maquina-del-futuro/visions", color: "text-futura-mint" },
    { icon: TrendingUp, title: t.dashboard.investorRoom, value: t.common.create, href: "/dashboard/maquina-del-futuro/investor-room", color: "text-msm-blue" },
    { icon: BookOpen, title: t.dashboard.book, value: "0 chapters", href: "/dashboard/maquina-del-futuro/book", color: "text-futura-ember" },
    { icon: Mic, title: t.dashboard.declarations, value: "0", href: "/dashboard/maquina-del-futuro/visions", color: "text-futura-mint" },
    { icon: Flame, title: t.dashboard.prayerVerses, value: "4 verses", href: "/maquina-del-futuro", color: "text-futura-pulse" }
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="fixed right-4 top-20 z-50">
        <LanguageSwitcher />
      </div>

      <div className="mb-6">
        <Badge className="bg-futura-glow/10 text-futura-glow border-futura-glow/20 mb-2">The Machine of the Future</Badge>
        <h1 className="text-2xl font-black text-msm-ink">{t.dashboard.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.dashboard.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.title}
              href={c.href}
              className="group rounded-lg border border-msm-line bg-white p-4 shadow-soft transition hover:shadow-glow"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={c.color} size={20} />
                <ArrowRight size={14} className="text-slate-300 transition group-hover:text-msm-blue" />
              </div>
              <p className="text-xs text-slate-500">{c.title}</p>
              <p className="text-lg font-black text-msm-ink">{c.value}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-bold text-msm-ink mb-4">Quick Actions</h2>
          <div className="grid gap-3">
            <Link
              href="/dashboard/maquina-del-futuro/visions/new"
              className="group flex items-center gap-3 rounded-lg border border-futura-glow/20 bg-futura-glow/5 p-4 transition hover:bg-futura-glow/10"
            >
              <span className="grid h-10 w-10 place-items-center rounded-md bg-futura-glow text-white"><Eye size={18} /></span>
              <div>
                <p className="font-bold text-msm-ink">{t.dashboard.createVision}</p>
                <p className="text-xs text-slate-500">{t.dashboard.createVisionDesc}</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-futura-glow" />
            </Link>
            <Link
              href="/dashboard/maquina-del-futuro/investor-room"
              className="group flex items-center gap-3 rounded-lg border border-msm-blue/20 bg-msm-blue/5 p-4 transition hover:bg-msm-blue/10"
            >
              <span className="grid h-10 w-10 place-items-center rounded-md bg-msm-blue text-white"><TrendingUp size={18} /></span>
              <div>
                <p className="font-bold text-msm-ink">{t.dashboard.investorRoomTitle}</p>
                <p className="text-xs text-slate-500">{t.dashboard.investorRoomDesc}</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-msm-blue" />
            </Link>
            <Link
              href="/dashboard/maquina-del-futuro/book"
              className="group flex items-center gap-3 rounded-lg border border-futura-ember/20 bg-futura-ember/5 p-4 transition hover:bg-futura-ember/10"
            >
              <span className="grid h-10 w-10 place-items-center rounded-md bg-futura-ember text-futura-void"><BookOpen size={18} /></span>
              <div>
                <p className="font-bold text-msm-ink">{t.dashboard.writeBook}</p>
                <p className="text-xs text-slate-500">{t.dashboard.writeBookDesc}</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-futura-ember" />
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-msm-ink mb-4">{t.dashboard.spiritualFoundation}</h2>
          <ScriptureBanner
            title={t.scriptures.title}
            verses={[
              { ref: "Genesis 1:1", text: t.scriptures.verses.genesis },
              { ref: "Habakkuk 2:2", text: t.scriptures.verses.habakkuk },
              { ref: "Jeremiah 33:3", text: t.scriptures.verses.jeremiah },
              { ref: "John 3:12", text: t.scriptures.verses.john }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default function MaquinaDelFuturoDashboard() {
  return (
    <I18nProvider>
      <DashboardContent />
    </I18nProvider>
  );
}
