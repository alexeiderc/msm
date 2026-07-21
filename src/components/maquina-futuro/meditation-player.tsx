"use client";

import { useState } from "react";
import { Headphones, Play, Pause, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";

type MeditationPlayerProps = {
  content?: string;
  onGenerate?: () => void;
  isGenerating?: boolean;
};

export function MeditationPlayer({ content, onGenerate, isGenerating }: MeditationPlayerProps) {
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  function togglePlay() {
    if (!content) return;
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return p + 0.5;
        });
      }, 100);
    }
  }

  function reset() {
    setIsPlaying(false);
    setProgress(0);
  }

  return (
    <div className="rounded-lg border border-futura-pulse/20 bg-gradient-to-br from-futura-void to-futura-deep p-5">
      <div className="flex items-center gap-2 mb-4">
        <Headphones className="text-futura-pulse" size={20} />
        <h3 className="text-sm font-bold text-futura-pulse uppercase tracking-wider">{t.meditation.title}</h3>
        {content && <Badge className="bg-futura-mint/10 text-futura-mint border-futura-mint/20 ml-auto">{t.meditation.ready}</Badge>}
      </div>

      {content ? (
        <>
          <div className="mb-4 h-1 w-full rounded-full bg-futura-cosmic overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-futura-pulse to-futura-glow transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Button onClick={togglePlay} className="bg-futura-pulse shadow-none hover:bg-futura-pulse/80">
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? t.meditation.pause : t.meditation.play}
            </Button>
            <Button onClick={reset} className="bg-futura-cosmic text-futura-frost shadow-none hover:bg-futura-cosmic/80">
              <RotateCcw size={16} /> {t.meditation.restart}
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto rounded-md bg-futura-cosmic/50 p-4 text-sm leading-6 text-futura-frost/80">
            {content}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="text-futura-aura animate-spin" size={32} />
              <p className="text-sm text-futura-aura">{t.meditation.generating}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-futura-frost/60">{t.meditation.noMeditation}</p>
              <Button onClick={onGenerate} className="bg-futura-glow shadow-none">
                <Play size={16} /> {t.meditation.generateBtn}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
