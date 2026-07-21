import Link from "next/link";
import { ArrowRight, Bot, BrainCircuit, ExternalLink, Gem, Network, ShieldCheck, Sparkles } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { zafiroModule } from "@/lib/zafiro-sync";

export const metadata = {
  title: "ZAFIRO | MSM MY STORE",
  description: "ZAFIRO sincronizado como modulo de conocimiento, comunidad, reputacion y ELIANA dentro del ecosistema MSM."
};

export default function ZafiroPage() {
  return (
    <AppShell>
      <section className="relative overflow-hidden bg-msm-midnight text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(25,123,210,0.35),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(0,217,255,0.18),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-6 px-4 py-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <Badge className="border-white/20 bg-white/10 text-msm-ice">Ecosistema MSM</Badge>
            <h1 className="mt-4 text-4xl font-black md:text-6xl">ZAFIRO conectado a MSM MY STORE</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-msm-ice/85 md:text-lg">
              {zafiroModule.summary}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={zafiroModule.productionUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-msm-blue px-4 text-sm font-bold text-white shadow-glow"
              >
                Abrir ZAFIRO <ExternalLink size={17} />
              </a>
              <Link
                href="/eliana"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 text-sm font-bold text-white"
              >
                Hablar con ELIANA <Bot size={17} />
              </Link>
            </div>
          </div>

          <div className="msm-luminous-panel rounded-lg p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-msm-ice/75">Modulo sincronizado</p>
                <h2 className="mt-1 text-2xl font-black">{zafiroModule.name}</h2>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-md bg-white text-msm-blue">
                <Gem size={22} />
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-msm-ice/80">{zafiroModule.elianaRole}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {["Conocimiento", "Comunidad", "PTS", "ELIANA"].map((item) => (
                <span key={item} className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-center text-xs font-bold">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 pb-24 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg border border-msm-line bg-white p-5 shadow-lift">
          <div className="flex items-center gap-2">
            <Network className="text-msm-blue" size={22} />
            <h2 className="text-2xl font-bold text-msm-ink">Como se conecta con el marketplace</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {zafiroModule.marketplaceConnections.map((item) => (
              <article key={item} className="rounded-lg border border-msm-line bg-msm-cloud p-4">
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <article className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
            <BrainCircuit className="text-msm-blue" size={24} />
            <h3 className="mt-3 font-bold text-msm-ink">Pilares ZAFIRO</h3>
            <div className="mt-3 grid gap-2">
              {zafiroModule.pillars.map((pillar) => (
                <p key={pillar} className="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-msm-navy">
                  {pillar}
                </p>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
            <ShieldCheck className="text-msm-blue" size={24} />
            <h3 className="mt-3 font-bold text-msm-ink">Separacion correcta</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              MSM MY STORE mantiene las operaciones comerciales: productos, remesas, Saldo MSM,
              ordenes, entregas, ledger y soporte. ZAFIRO queda como conocimiento, comunidad,
              reputacion y perfil del ecosistema.
            </p>
          </article>

          <article className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
            <Sparkles className="text-msm-blue" size={24} />
            <h3 className="mt-3 font-bold text-msm-ink">Rutas conectadas</h3>
            <div className="mt-3 grid gap-2">
              {zafiroModule.routes.map((route) =>
                route.href.startsWith("http") ? (
                  <a key={route.href} href={route.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-msm-blue">
                    {route.label} <ArrowRight size={15} />
                  </a>
                ) : (
                  <Link key={route.href} href={route.href} className="inline-flex items-center gap-2 text-sm font-bold text-msm-blue">
                    {route.label} <ArrowRight size={15} />
                  </Link>
                )
              )}
            </div>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
