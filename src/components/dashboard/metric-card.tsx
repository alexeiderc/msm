import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  detail,
  className
}: {
  label: string;
  value: string;
  detail: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-msm-silver bg-white p-4 shadow-lift", className)}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-msm-ink">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}
