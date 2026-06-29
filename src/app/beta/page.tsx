import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";

export default function BetaPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-4 py-10 pb-24">
        <Badge>Beta privada</Badge>
        <div className="mt-4 rounded-lg border border-msm-line bg-white p-6 shadow-soft">
          <LockKeyhole className="text-msm-blue" size={32} />
          <h1 className="mt-3 text-3xl font-bold">Acceso controlado por MSM</h1>
          <p className="mt-3 leading-7 text-slate-600">
            MSM my store puede operar primero en beta privada. Solo clientes, vendedores VIP y personal aprobado por MSM deben entrar antes del lanzamiento publico.
          </p>
          <div className="mt-5 grid gap-2 text-sm text-slate-600">
            <span>Configuracion: `BETA_MODE=true`.</span>
            <span>Tabla: `beta_access` con estado pendiente, aprobado o rechazado.</span>
            <span>Cookie interna de preview: `msm_beta_preview` para pruebas controladas.</span>
          </div>
          <Link href="/support" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-msm-navy px-4 text-sm font-semibold text-white">
            Solicitar acceso
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
