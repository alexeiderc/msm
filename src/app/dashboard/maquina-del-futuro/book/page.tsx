"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookChapterCard } from "@/components/maquina-futuro/book-chapter-card";

type Chapter = {
  id: string;
  chapter_number: number;
  title: string;
  content?: string;
  status: string;
};

export default function BookPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/maquina-futuro/book/list")
      .then((r) => r.json())
      .then((data) => setChapters(data.chapters ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function generateChapter(chapterNumber: number) {
    setGenerating(true);
    try {
      const res = await fetch("/api/maquina-futuro/book/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterNumber })
      });
      if (res.ok) {
        const data = await res.json();
        setChapters((prev) => {
          const exists = prev.find((c) => c.chapter_number === chapterNumber);
          if (exists) return prev.map((c) => c.chapter_number === chapterNumber ? data.chapter : c);
          return [...prev, data.chapter].sort((a, b) => a.chapter_number - b.chapter_number);
        });
      }
    } catch {}
    setGenerating(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="text-futura-ember animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Badge className="bg-futura-ember/10 text-futura-ember border-futura-ember/20 mb-2">La Maquina del Futuro</Badge>
        <h1 className="text-2xl font-black text-msm-ink">Libro</h1>
        <p className="mt-1 text-sm text-slate-500">
          La Maquina del Futuro: Vision, palabra, fe, inteligencia artificial y tecnologia para una nueva era de inventos revelados por Dios
        </p>
      </div>

      <BookChapterCard
        chapters={chapters.map((c) => ({
          id: c.id,
          chapterNumber: c.chapter_number,
          title: c.title,
          content: c.content,
          status: c.status
        }))}
        onGenerate={generateChapter}
        isGenerating={generating}
      />
    </div>
  );
}
