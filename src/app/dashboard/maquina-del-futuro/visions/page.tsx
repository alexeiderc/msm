"use client";

import Link from "next/link";
import { Plus, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VisionCard } from "@/components/maquina-futuro/vision-card";
import { LanguageSwitcher } from "@/components/maquina-futuro/language-switcher";
import { I18nProvider, useI18n } from "@/lib/i18n/context";
import { useEffect, useState } from "react";

type Vision = {
  id: string;
  title: string;
  subtitle: string;
  vision_type: string;
  status: string;
  created_at: string;
};

function VisionsContent() {
  const { t } = useI18n();
  const [visions, setVisions] = useState<Vision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/maquina-futuro/vision/list")
      .then((r) => r.json())
      .then((data) => setVisions(data.visions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="fixed right-4 top-20 z-50">
        <LanguageSwitcher />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <Badge className="bg-futura-glow/10 text-futura-glow border-futura-glow/20 mb-2">The Machine of the Future</Badge>
          <h1 className="text-2xl font-black text-msm-ink">{t.visions.title}</h1>
        </div>
        <Link
          href="/dashboard/maquina-del-futuro/visions/new"
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-futura-glow px-4 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5"
        >
          <Plus size={16} /> {t.visions.newVision}
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-futura-glow border-t-transparent" />
        </div>
      ) : visions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visions.map((v) => (
            <VisionCard
              key={v.id}
              id={v.id}
              title={v.title}
              subtitle={v.subtitle}
              visionType={v.vision_type}
              status={v.status}
              createdAt={v.created_at}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-msm-line bg-white p-12 text-center">
          <Eye className="mx-auto text-slate-300" size={48} />
          <h2 className="mt-4 text-lg font-bold text-msm-ink">{t.visions.noVisions}</h2>
          <p className="mt-2 text-sm text-slate-500">{t.visions.noVisionsDesc}</p>
          <Link
            href="/dashboard/maquina-del-futuro/visions/new"
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-md bg-futura-glow px-4 text-sm font-bold text-white shadow-glow"
          >
            <Plus size={16} /> {t.visions.createFirst}
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VisionsPage() {
  return (
    <I18nProvider>
      <VisionsContent />
    </I18nProvider>
  );
}
