"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VisionWizard } from "@/components/maquina-futuro/vision-wizard";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/maquina-futuro/language-switcher";
import { I18nProvider, useI18n } from "@/lib/i18n/context";

function NewVisionContent() {
  const { t } = useI18n();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleComplete(data: {
    title: string;
    idea: string;
    problem: string;
    finalScene: string;
    targetUsers: string;
    technologies: string;
    teamRequired: string;
    investmentNeeded: string;
    spiritualBase: string;
    visionType: string;
  }) {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/maquina-futuro/vision/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Error creating vision");
      }

      const { vision } = await res.json();
      router.push(`/dashboard/maquina-del-futuro/visions/${vision.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="fixed right-4 top-20 z-50">
        <LanguageSwitcher />
      </div>

      <div className="mb-6">
        <Badge className="bg-futura-glow/10 text-futura-glow border-futura-glow/20 mb-2">The Machine of the Future</Badge>
        <h1 className="text-2xl font-black text-msm-ink">{t.visions.createTitle}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.visions.createSubtitle}</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
      )}

      <VisionWizard onComplete={handleComplete} isLoading={isLoading} />
    </div>
  );
}

export default function NewVisionPage() {
  return (
    <I18nProvider>
      <NewVisionContent />
    </I18nProvider>
  );
}
