import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function MobileHero() {
  return (
    <section className="msm-hero-surface mx-3 mt-3 overflow-hidden rounded-lg p-5 text-white shadow-lift">
      <div className="max-w-[17rem]">
        <p className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white">
          <ShieldCheck size={13} /> Compra con confianza
        </p>
        <h1 className="mt-3 text-[28px] font-black leading-tight">MSM my store</h1>
        <p className="mt-2 text-sm font-semibold leading-5 text-msm-ice/90">Productos, servicios y remesas para Cuba y el mundo.</p>
        <Link href="/products" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-bold text-msm-navy shadow-soft">
          Ver productos <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
