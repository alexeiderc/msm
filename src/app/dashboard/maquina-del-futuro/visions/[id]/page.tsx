"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ScriptureBanner } from "@/components/maquina-futuro/scripture-banner";
import { PrayerBlock } from "@/components/maquina-futuro/prayer-block";
import { MeditationPlayer } from "@/components/maquina-futuro/meditation-player";
import { FutureInterview } from "@/components/maquina-futuro/future-interview";
import { DeclarationPanel } from "@/components/maquina-futuro/declaration-panel";
import { PrototypeMap } from "@/components/maquina-futuro/prototype-map";
import { InvestorPitchCard } from "@/components/maquina-futuro/investor-pitch-card";
import { Loader2 } from "lucide-react";

type Vision = {
  id: string;
  title: string;
  subtitle?: string;
  vision_type: string;
  status: string;
  final_scene?: string;
  divine_purpose?: string;
  problem_statement?: string;
  solution_statement?: string;
  target_users?: string;
  vision_json?: Record<string, unknown>;
  created_at: string;
};

type Session = {
  id: string;
  session_type: string;
  output_text?: string;
  created_at: string;
};

type Declaration = {
  id: string;
  declaration_text: string;
  category: string;
};

type Tab = "resumen" | "meditacion" | "entrevista" | "prototipo" | "pitch" | "declaraciones" | "oracion";

const TABS: Array<{ key: Tab; label: string }> = [
  { key: "resumen", label: "Resumen" },
  { key: "meditacion", label: "Meditacion" },
  { key: "entrevista", label: "Entrevista" },
  { key: "prototipo", label: "Prototipo" },
  { key: "pitch", label: "Pitch" },
  { key: "declaraciones", label: "Declaraciones" },
  { key: "oracion", label: "Oracion" }
];

export default function VisionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [tab, setTab] = useState<Tab>("resumen");
  const [vision, setVision] = useState<Vision | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/maquina-futuro/vision/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setVision(data.vision);
        setSessions(data.sessions ?? []);
        setDeclarations(data.declarations ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function generateSession(type: string) {
    setGenerating(type);
    try {
      const res = await fetch(`/api/maquina-futuro/${type}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visionId: id })
      });
      if (res.ok) {
        const data = await res.json();
        setSessions((prev) => [data.session, ...prev]);
      }
    } catch {}
    setGenerating("");
  }

  async function saveDeclaration(text: string, category: string) {
    try {
      const res = await fetch("/api/maquina-futuro/declaration/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visionId: id, text, category })
      });
      if (res.ok) {
        const data = await res.json();
        setDeclarations((prev) => [data.declaration, ...prev]);
      }
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="text-futura-glow animate-spin" size={32} />
      </div>
    );
  }

  if (!vision) {
    return <div className="p-8 text-center text-slate-500">Vision no encontrada</div>;
  }

  const meditationSession = sessions.find((s) => s.session_type === "MEDITATION");
  const interviewSession = sessions.find((s) => s.session_type === "INTERVIEW");
  const prototypeSession = sessions.find((s) => s.session_type === "PROTOTYPE");
  const pitchSession = sessions.find((s) => s.session_type === "PITCH");

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-futura-glow/10 text-futura-glow border-futura-glow/20">{vision.vision_type}</Badge>
          <Badge>{vision.status}</Badge>
        </div>
        <h1 className="text-2xl font-black text-msm-ink">{vision.title}</h1>
        {vision.subtitle && <p className="mt-1 text-sm text-slate-500">{vision.subtitle}</p>}
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-md px-3 py-2 text-xs font-bold transition ${
              tab === t.key ? "bg-futura-glow text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "resumen" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {vision.problem_statement && (
              <div className="rounded-lg border border-msm-line bg-white p-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Problema</p>
                <p className="text-sm text-slate-700">{vision.problem_statement}</p>
              </div>
            )}
            {vision.solution_statement && (
              <div className="rounded-lg border border-msm-line bg-white p-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Solucion</p>
                <p className="text-sm text-slate-700">{vision.solution_statement}</p>
              </div>
            )}
            {vision.target_users && (
              <div className="rounded-lg border border-msm-line bg-white p-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Usuarios Objetivo</p>
                <p className="text-sm text-slate-700">{vision.target_users}</p>
              </div>
            )}
            {vision.final_scene && (
              <div className="rounded-lg border border-msm-line bg-white p-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Escena Final</p>
                <p className="text-sm text-slate-700">{vision.final_scene}</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <ScriptureBanner />
            <PrayerBlock />
          </div>
        </div>
      )}

      {tab === "meditacion" && (
        <MeditationPlayer
          content={meditationSession?.output_text}
          onGenerate={() => generateSession("meditation")}
          isGenerating={generating === "meditation"}
        />
      )}

      {tab === "entrevista" && (
        <FutureInterview
          content={interviewSession?.output_text}
          onGenerate={() => generateSession("interview")}
          isGenerating={generating === "interview"}
        />
      )}

      {tab === "prototipo" && (
        <PrototypeMap
          content={prototypeSession?.output_text}
          onGenerate={() => generateSession("prototype")}
          isGenerating={generating === "prototype"}
        />
      )}

      {tab === "pitch" && (
        <InvestorPitchCard
          content={pitchSession?.output_text}
          onGenerate={() => generateSession("pitch")}
          isGenerating={generating === "pitch"}
        />
      )}

      {tab === "declaraciones" && (
        <DeclarationPanel
          declarations={declarations.map((d) => ({ id: d.id, text: d.declaration_text, category: d.category }))}
          onSave={saveDeclaration}
        />
      )}

      {tab === "oracion" && (
        <div className="space-y-6">
          <PrayerBlock />
          <ScriptureBanner />
        </div>
      )}
    </div>
  );
}
