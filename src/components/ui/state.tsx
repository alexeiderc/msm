import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingState({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
      <div>
        <LoaderCircle className="mx-auto animate-spin text-msm-blue" size={28} />
        <p className="mt-3 text-sm font-bold text-slate-600">{label}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  title = "No hay resultados",
  detail = "Ajusta los filtros o vuelve a intentar."
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <div className="grid min-h-40 place-items-center rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
      <div>
        <Inbox className="mx-auto text-msm-blue" size={30} />
        <h2 className="mt-3 font-black text-msm-ink">{title}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-600">{detail}</p>
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Algo no cargo",
  detail = "Revisa la conexion o intenta nuevamente.",
  className
}: {
  title?: string;
  detail?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-red-100 bg-red-50 p-4 text-red-800", className)}>
      <p className="flex items-center gap-2 font-black">
        <AlertCircle size={18} />
        {title}
      </p>
      <p className="mt-1 text-sm font-semibold leading-6">{detail}</p>
    </div>
  );
}
