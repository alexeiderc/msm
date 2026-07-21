"use client";

import { Cpu, Layers, AlertTriangle, Calendar, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

type PrototypeMapProps = {
  content?: string;
  onGenerate?: () => void;
  isGenerating?: boolean;
};

export function PrototypeMap({ content, onGenerate, isGenerating }: PrototypeMapProps) {
  const { t } = useI18n();
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = content ? JSON.parse(content) : null;
  } catch {
    parsed = null;
  }

  return (
    <div className="rounded-lg border border-futura-mint/20 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="text-futura-mint" size={20} />
        <h3 className="text-sm font-bold text-futura-mint uppercase tracking-wider">{t.prototype.title}</h3>
        {parsed && <Badge className="bg-futura-mint/10 text-futura-mint border-futura-mint/20 ml-auto">{t.prototype.generated}</Badge>}
      </div>

      {parsed ? (
        <div className="space-y-4">
          {typeof parsed.name === "string" && parsed.name && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">{t.prototype.name}</p>
              <p className="text-sm font-semibold text-msm-ink">{parsed.name}</p>
            </div>
          )}
          {typeof parsed.description === "string" && parsed.description && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">{t.prototype.description}</p>
              <p className="text-sm text-slate-600">{parsed.description}</p>
            </div>
          )}
          {Array.isArray(parsed.modules) && parsed.modules.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Layers size={12} /> {t.prototype.modules}</p>
              <div className="mt-1 grid gap-1">
                {(parsed.modules as Array<Record<string, string>>).map((m, i) => (
                  <div key={i} className="rounded-md bg-slate-50 p-2 text-xs">
                    <span className="font-bold text-msm-ink">{m.name ?? `${t.prototype.module} ${i + 1}`}</span>
                    {m.description && <span className="text-slate-500 ml-2">- {m.description}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {Array.isArray(parsed.roadmap) && parsed.roadmap.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12} /> {t.prototype.roadmap}</p>
              <div className="mt-1 grid gap-1">
                {(parsed.roadmap as Array<Record<string, string>>).map((r, i) => (
                  <div key={i} className="rounded-md bg-futura-glow/5 p-2 text-xs">
                    <span className="font-bold text-futura-glow">{r.phase ?? `${t.prototype.phase} ${i + 1}`}</span>
                    {r.duration && <span className="text-slate-500 ml-2">{r.duration}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {Array.isArray(parsed.risks) && parsed.risks.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><AlertTriangle size={12} /> {t.prototype.risks}</p>
              <div className="mt-1 grid gap-1">
                {(parsed.risks as Array<Record<string, string>>).map((r, i) => (
                  <div key={i} className="rounded-md bg-red-50 p-2 text-xs">
                    <span className="font-bold text-red-600">{r.risk ?? `${t.prototype.risk} ${i + 1}`}</span>
                    {r.mitigation && <span className="text-slate-500 ml-2">{t.prototype.mitigate}: {r.mitigation}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="text-futura-mint animate-spin" size={32} />
              <p className="text-sm text-slate-500">{t.prototype.generating}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-slate-400">{t.prototype.empty}</p>
              <Button onClick={onGenerate} className="bg-futura-mint text-futura-void shadow-none">
                <Cpu size={16} /> {t.prototype.generate}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
