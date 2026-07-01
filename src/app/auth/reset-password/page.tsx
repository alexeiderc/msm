import Link from "next/link";
import { KeyRound } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#eaf6ff_0%,#f7f9fb_45%,#ffffff_100%)] px-4 py-8">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-[0_22px_60px_rgba(7,17,30,0.10)]">
        <Link href="/" className="text-sm font-black text-msm-blue">MSM my store</Link>
        <div className="mt-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-msm-blue text-white"><KeyRound size={20} /></span>
          <div>
            <h1 className="text-xl font-black text-msm-ink">Nueva contrasena</h1>
            <p className="text-sm font-semibold text-slate-600">Crea una clave segura para tu cuenta.</p>
          </div>
        </div>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
