import Link from "next/link";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";

export default function BetaPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-4 py-10 pb-24">
        <Badge>Beta privada</Badge>
        <div className="mt-4 rounded-lg border border-msm-line bg-white p-6 shadow-soft">
          <ShieldCheck className="text-msm-blue" size={32} />
          <h1 className="mt-3 text-3xl font-black text-msm-ink">Acceso beta de MSM MY STORE</h1>
          <p className="mt-3 leading-7 text-slate-600">
            Estamos abriendo el acceso de forma gradual para cuidar cada cuenta, pago y orden. Puedes crear tu cuenta ahora; el equipo MSM revisara los perfiles antes de habilitar operaciones.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/auth/signup" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-msm-blue px-4 text-sm font-bold text-white shadow-sm transition hover:bg-msm-navy">
              <UserPlus size={18} /> Crear o solicitar cuenta
            </Link>
            <Link href="/auth/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-msm-line bg-white px-4 text-sm font-bold text-msm-ink transition hover:border-msm-blue hover:text-msm-blue">
              <LogIn size={18} /> Ya tengo acceso
            </Link>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500">
            Necesitas ayuda? <Link href="/support" className="text-msm-blue underline underline-offset-4">Habla con soporte MSM</Link>.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
