import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Sparkles, Store } from "lucide-react";
import { ElianaFloatingAssistant } from "@/components/ai/eliana-floating-assistant";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;

  return (
    <>
      {/* Mobile: app-like fullscreen form */}
      <main className="min-h-screen bg-white md:bg-msm-midnight">
        <div className="md:hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <Link href="/" aria-label="MSM my store inicio">
              <Image
                src="/brand/msm-my-store-logo.jpeg"
                alt="MSM my store"
                width={100}
                height={55}
                priority
                quality={65}
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>
          <div className="px-4 pb-8 pt-6">
            <h1 className="text-2xl font-extrabold text-msm-ink">Crear cuenta</h1>
            <p className="mt-1 text-sm text-slate-500">
              Compra, envía remesas y sigue tus órdenes con trazabilidad.
            </p>
            <SignupForm next={params.next} />
          </div>
        </div>

        {/* Desktop: two-column brand + card */}
        <section className="mx-auto hidden min-h-screen max-w-6xl items-center gap-8 px-4 py-8 md:grid md:grid-cols-[1fr_0.9fr]">
          <div>
            <Link href="/" aria-label="MSM my store inicio">
              <Image
                src="/brand/msm-my-store-logo.jpeg"
                alt="MSM my store"
                width={190}
                height={105}
                priority
                quality={65}
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="mt-8 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-msm-ice">
              <Sparkles size={16} /> Rapidez - Excelencia - Seguridad
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-bold md:text-6xl">
              Crea tu cuenta y entra a MSM my store con trazabilidad.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-msm-ice/80">
              Compra productos, solicita remesas, sube comprobantes, sigue tus ordenes y conversa con
              YO SOY ELIANA. Si eres vendedor, aqui empieza tu camino para solicitar perfil VIP.
            </p>
            <div className="mt-6 grid gap-3 text-sm font-semibold text-msm-ice/85 sm:grid-cols-3">
              <span className="rounded-lg border border-white/15 bg-white/10 p-3">
                <ShieldCheck className="mb-2" size={18} /> Pagos dentro de orden
              </span>
              <span className="rounded-lg border border-white/15 bg-white/10 p-3">
                <Store className="mb-2" size={18} /> Tiendas VIP verificadas
              </span>
              <span className="rounded-lg border border-white/15 bg-white/10 p-3">
                <Sparkles className="mb-2" size={18} /> ELIANA te guia
              </span>
            </div>
          </div>

          <section className="rounded-lg border border-msm-line bg-white p-6 text-msm-ink shadow-lift">
            <div>
              <h2 className="text-2xl font-bold">Crear cuenta</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Usa datos reales cuando conectes produccion. En localhost puedes probar el flujo sin dinero real.
              </p>
            </div>
            <SignupForm next={params.next} />
          </section>
        </section>
      </main>
      <ElianaFloatingAssistant />
    </>
  );
}
