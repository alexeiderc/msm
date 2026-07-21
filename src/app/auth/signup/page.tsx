import Link from "next/link";
import { ShieldCheck, UserPlus } from "lucide-react";
import { SignupForm } from "@/components/auth/signup-form";
import { isBetaMode } from "@/lib/beta";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;

  const betaMode = isBetaMode();

  return (
    <main className="min-h-screen bg-msm-cloud px-4 py-8">
      <section className="mx-auto w-full max-w-xl rounded-lg border border-msm-line bg-white p-5 shadow-lift sm:p-8">
        <Link href="/" className="text-sm font-black text-msm-blue">MSM my store</Link>
        <div className="mt-4 flex items-center gap-3 border-b border-msm-line pb-5">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-msm-blue text-white"><UserPlus size={20} /></span>
          <div>
            <h1 className="text-2xl font-black text-msm-ink">Crear cuenta</h1>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600"><ShieldCheck size={15} className="text-msm-blue" /> Cuenta personal protegida por MSM</p>
          </div>
        </div>
        {betaMode ? (
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-800">
            Beta controlada: puedes crear tu cuenta ahora. MSM revisara el perfil antes de habilitar pagos y operaciones.
          </div>
        ) : null}
        <SignupForm next={params.next} />
      </section>
    </main>
  );
}
