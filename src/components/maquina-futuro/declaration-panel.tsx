"use client";

import { useState } from "react";
import { Mic, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";

type Declaration = {
  id: string;
  text: string;
  category: string;
};

type DeclarationPanelProps = {
  declarations?: Declaration[];
  onSave?: (text: string, category: string) => void;
  onDelete?: (id: string) => void;
  isSaving?: boolean;
};

export function DeclarationPanel({ declarations = [], onSave, onDelete, isSaving }: DeclarationPanelProps) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [category, setCategory] = useState("YO_SOY");

  const CATEGORIES = [
    { value: "YO_SOY", label: t.declarations.categories.YO_SOY },
    { value: "DECLARO", label: t.declarations.categories.DECLARO },
    { value: "RECIBO", label: t.declarations.categories.RECIBO },
    { value: "CONSTRUYO", label: t.declarations.categories.CONSTRUYO }
  ];

  function handleSave() {
    if (!text.trim() || !onSave) return;
    onSave(text.trim(), category);
    setText("");
  }

  return (
    <div className="rounded-lg border border-futura-mint/20 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <Mic className="text-futura-mint" size={20} />
        <h3 className="text-sm font-bold text-futura-mint uppercase tracking-wider">{t.declarations.title}</h3>
      </div>

      <div className="flex gap-2 mb-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="min-h-10 rounded-md border border-msm-silver bg-white px-3 text-sm font-semibold text-msm-ink"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.declarations.placeholder}
          className="flex-1"
        />
        <Button onClick={handleSave} disabled={isSaving || !text.trim()} className="bg-futura-mint text-futura-void shadow-none">
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        </Button>
      </div>

      {declarations.length > 0 ? (
        <div className="grid gap-2">
          {declarations.map((d) => (
            <div key={d.id} className="flex items-center gap-2 rounded-md bg-slate-50 p-3">
              <Badge className="bg-futura-mint/10 text-futura-mint border-futura-mint/20 shrink-0">{d.category}</Badge>
              <span className="flex-1 text-sm text-slate-700">{d.text}</span>
              {onDelete && (
                <button onClick={() => onDelete(d.id)} className="text-slate-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-slate-400 py-4">{t.declarations.noDeclarations}</p>
      )}
    </div>
  );
}
