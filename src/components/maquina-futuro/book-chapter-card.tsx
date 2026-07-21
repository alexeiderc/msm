"use client";

import { BookOpen, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

type BookChapterCardProps = {
  chapters?: Array<{
    id: string;
    chapterNumber: number;
    title: string;
    content?: string;
    status: string;
  }>;
  onGenerate?: (chapterNumber: number) => void;
  isGenerating?: boolean;
};

const BOOK_OUTLINE = [
  { num: 1, title: "In the Beginning God Created" },
  { num: 2, title: "The End Already Existed" },
  { num: 3, title: "Write the Vision" },
  { num: 4, title: "Great and Hidden Things" },
  { num: 5, title: "If You Do Not Understand the Earthly" },
  { num: 6, title: "The Fire of Humanity" },
  { num: 7, title: "The Stone, the Paint, and the First Memory" },
  { num: 8, title: "The Wheel, the Nut, and the Key" },
  { num: 9, title: "The Inventors Who Saw Before" },
  { num: 10, title: "The Mouth as Spiritual Technology" },
  { num: 11, title: "Meditation as an Invisible Laboratory" },
  { num: 12, title: "The Machine of the Future" },
  { num: 13, title: "The New Era of Inventions" },
  { num: 14, title: "Inventor Mode" },
  { num: 15, title: "The Final Interview" },
  { num: 16, title: "The Inventor's Prayer" },
  { num: 17, title: "Here Everything Begins" }
];

export function BookChapterCard({ chapters = [], onGenerate, isGenerating }: BookChapterCardProps) {
  const { t } = useI18n();
  const existingMap = new Map(chapters.map((c) => [c.chapterNumber, c]));

  return (
    <div className="rounded-lg border border-futura-ember/20 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="text-futura-ember" size={20} />
        <h3 className="text-sm font-bold text-futura-ember uppercase tracking-wider">{t.book.title}</h3>
      </div>

      <p className="text-xs text-slate-500 mb-4">{t.book.subtitle}</p>

      <div className="grid gap-2">
        {BOOK_OUTLINE.map((ch) => {
          const existing = existingMap.get(ch.num);
          return (
            <div key={ch.num} className="flex items-center gap-2 rounded-md bg-slate-50 p-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-futura-ember/10 text-xs font-bold text-futura-ember">
                {ch.num}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-msm-ink truncate">{ch.title}</p>
                {existing && (
                  <p className="text-xs text-slate-400 line-clamp-1">{existing.content?.slice(0, 80)}...</p>
                )}
              </div>
              {existing ? (
                <Badge className="bg-futura-mint/10 text-futura-mint border-futura-mint/20 shrink-0">
                  {existing.status === "COMPLETED" ? t.book.ready : t.book.draft}
                </Badge>
              ) : (
                <Button
                  onClick={() => onGenerate?.(ch.num)}
                  disabled={isGenerating}
                  className="bg-futura-ember text-futura-void shadow-none text-xs shrink-0"
                >
                  {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
