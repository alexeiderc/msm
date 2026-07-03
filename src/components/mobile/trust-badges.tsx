import { ShieldCheck, Truck, Headphones, BadgeCheck } from "lucide-react";

const badges = [
  ["Compra segura", "Pagos auditados", ShieldCheck],
  ["Envíos a Cuba", "Entrega local", Truck],
  ["Soporte MSM", "Respuesta rápida", Headphones],
  ["Garantía MSM", "Post-venta", BadgeCheck],
] as const;

export function TrustBadges() {
  return (
    <section className="mt-4 overflow-x-auto px-3 scrollbar-hide">
      <div className="flex gap-2">
        {badges.map(([title, subtitle, Icon]) => (
          <div
            key={title}
            className="flex shrink-0 items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-3.5 py-3 shadow-sm"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-50 to-violet-50 text-msm-blue">
              <Icon size={18} />
            </span>
            <div>
              <p className="text-xs font-extrabold text-slate-800">{title}</p>
              <p className="text-[10px] font-semibold text-slate-500">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
