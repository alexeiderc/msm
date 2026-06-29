import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ElianaFloatingAssistant } from "@/components/ai/eliana-floating-assistant";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#eaf6ff_0%,#f7f9fb_45%,#ffffff_100%)] px-4 py-8">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-[0_22px_60px_rgba(7,17,30,0.10)]">
        <Link href="/" className="text-sm font-black text-msm-blue">
          MSM my store
        </Link>
        <div className="mt-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-msm-blue text-white shadow-glow">
            <KeyRound size={20} />
          </span>
          <div>
            <h1 className="text-xl font-black text-msm-ink">Recuperar acceso</h1>
            <p className="text-sm font-semibold text-slate-600">Te enviamos un enlace seguro por correo.</p>
          </div>
        </div>
        <div className="mt-5 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm font-semibold leading-6 text-msm-blue">
          <ShieldCheck size={16} className="mr-1 inline" />
          Por seguridad, MSM nunca pide claves por WhatsApp ni por cuentas externas.
        </div>
        <ForgotPasswordForm />
      </section>
      <ElianaFloatingAssistant />
    </main>
  );
}
