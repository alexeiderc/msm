"use client";

import { MessageCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

type FutureInterviewProps = {
  content?: string;
  onGenerate?: () => void;
  isGenerating?: boolean;
};

export function FutureInterview({ content, onGenerate, isGenerating }: FutureInterviewProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-lg border border-futura-ember/20 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="text-futura-ember" size={20} />
        <h3 className="text-sm font-bold text-futura-ember uppercase tracking-wider">{t.interview.title}</h3>
        {content && <Badge className="bg-futura-mint/10 text-futura-mint border-futura-mint/20 ml-auto">{t.interview.generated}</Badge>}
      </div>

      {content ? (
        <div className="max-h-80 overflow-y-auto rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700 whitespace-pre-wrap">
          {content}
        </div>
      ) : (
        <div className="text-center py-8">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="text-futura-ember animate-spin" size={32} />
              <p className="text-sm text-slate-500">{t.interview.generating}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-slate-400">{t.interview.empty}</p>
              <Button onClick={onGenerate} className="bg-futura-ember text-futura-void shadow-none hover:bg-futura-ember/80">
                <MessageCircle size={16} /> {t.interview.generate}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
