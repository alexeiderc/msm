"use client";

import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type VisionCardProps = {
  id: string;
  title: string;
  subtitle?: string;
  visionType: string;
  status: string;
  createdAt: string;
  onDelete?: (id: string) => void;
};

const typeColors: Record<string, string> = {
  INVENTION: "bg-futura-mint/10 text-futura-mint border-futura-mint/20",
  BOOK: "bg-futura-ember/10 text-futura-ember border-futura-ember/20",
  BUSINESS: "bg-futura-glow/10 text-futura-glow border-futura-glow/20",
  SPIRITUAL: "bg-futura-pulse/10 text-futura-pulse border-futura-pulse/20",
  PERSONAL: "bg-futura-aura/10 text-futura-aura border-futura-aura/20",
  TECHNOLOGY: "bg-futura-electric/10 text-msm-electric border-msm-electric/20"
};

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activa",
  COMPLETED: "Completada",
  ARCHIVED: "Archivada"
};

export function VisionCard({ id, title, subtitle, visionType, status, createdAt, onDelete }: VisionCardProps) {
  return (
    <article className="group rounded-lg border border-msm-line bg-white p-4 shadow-soft transition hover:shadow-glow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={typeColors[visionType] ?? ""}>{visionType}</Badge>
            <Badge>{statusLabels[status] ?? status}</Badge>
          </div>
          <h3 className="text-base font-bold text-msm-ink truncate">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-slate-500 line-clamp-2">{subtitle}</p>}
          <p className="mt-2 text-xs text-slate-400">{new Date(createdAt).toLocaleDateString("es-ES")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <Link
            href={`/dashboard/maquina-del-futuro/visions/${id}`}
            className="grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-blue-50 hover:text-msm-blue"
            aria-label="Ver vision"
          >
            <Eye size={16} />
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500"
              aria-label="Eliminar vision"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
