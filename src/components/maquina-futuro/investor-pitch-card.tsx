"use client";

import { TrendingUp, DollarSign, Users, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";

type InvestorPitchCardProps = {
  content?: string;
  onGenerate?: () => void;
  isGenerating?: boolean;
};

export function InvestorPitchCard({ content, onGenerate, isGenerating }: InvestorPitchCardProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-lg border border-msm-blue/20 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-msm-blue" size={20} />
        <h3 className="text-sm font-bold text-msm-blue uppercase tracking-wider">{t.pitch.title}</h3>
        {content && <Badge className="bg-futura-mint/10 text-futura-mint border-futura-mint/20 ml-auto">{t.pitch.generated}</Badge>}
      </div>

      {content ? (
        <div className="max-h-96 overflow-y-auto rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700 whitespace-pre-wrap prose prose-sm">
          {content}
        </div>
      ) : (
        <div className="text-center py-8">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="text-msm-blue animate-spin" size={32} />
              <p className="text-sm text-slate-500">{t.pitch.generating}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-4 text-slate-300">
                <DollarSign size={24} />
                <Users size={24} />
                <Target size={24} />
              </div>
              <p className="text-sm text-slate-400">{t.pitch.noPitch}</p>
              <Button onClick={onGenerate} className="bg-msm-blue shadow-none">
                <TrendingUp size={16} /> {t.pitch.generateBtn}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
