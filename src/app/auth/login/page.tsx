import { LogIn, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#eaf6ff_0%,#f7f9fb_45%,#ffffff_100%)] px-4 py-8">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-[0_22px_60px_rgba(7,17,30,0.10)]">
        <Link href="/" className="text-sm font-black text-msm-blue">
          MSM my store
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-msm-blue text-white shadow-glow">
            <LogIn size={20} />
          </span>
          <div>
            <h1 className="text-xl font-black text-msm-ink">Entrar a MSM</h1>
            <p className="text-sm font-semibold text-slate-600">Productos, pagos, remesas y ordenes.</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600">
          <span className="rounded-md border border-blue-100 bg-blue-50 p-3 text-msm-blue"><ShieldCheck className="mb-1" size={16} /> Acceso seguro</span>
          <span className="rounded-md border border-blue-100 bg-blue-50 p-3 text-msm-blue"><Sparkles className="mb-1" size={16} /> Compra segura</span>
        </div>
        <LoginForm next={params.next} error={params.error} />
        <p className="mt-4 text-center text-sm font-semibold text-slate-600">
          <Link href="/auth/forgot-password" className="text-msm-blue hover:text-msm-electric">
            Recuperar contrasena
          </Link>
        </p>
      </section>
    </main>
  );
}
