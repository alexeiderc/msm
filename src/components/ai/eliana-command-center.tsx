"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BrainCircuit, CircleDollarSign, Search, ShieldCheck, Sparkles, Store } from "lucide-react";
import { elianaCommandIntents, resolveElianaCommand } from "@/lib/ai/eliana-command";

const featuredCommands = [
  {
    label: "Comprar por zona",
    prompt: "Quiero comprar productos en Segundo Frente",
    icon: Search
  },
  {
    label: "Enviar remesa",
    prompt: "Quiero enviar una remesa con entrega local",
    icon: CircleDollarSign
  },
  {
    label: "Abrir tienda MSM",
    prompt: "Quiero ver la tienda oficial MSM en Segundo Frente",
    icon: Store
  },
  {
    label: "Compra segura",
    prompt: "Quiero crear cuenta y completar KYC",
    icon: ShieldCheck
  }
] as const;

export function ElianaCommandCenter({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [command, setCommand] = useState("");
  const [lastCommand, setLastCommand] = useState("Quiero comprar productos en Segundo Frente");

  const suggestion = useMemo(() => resolveElianaCommand(command || lastCommand), [command, lastCommand]);

  function runCommand(nextCommand: string) {
    const resolved = resolveElianaCommand(nextCommand);
    setCommand(nextCommand);
    setLastCommand(nextCommand);
    router.push(resolved.href);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runCommand(command || lastCommand);
  }

  return (
    <section
      className={
        compact
          ? "rounded-lg border border-white/15 bg-white/10 p-4 text-white shadow-glow backdrop-blur"
          : "overflow-hidden rounded-lg border border-msm-line bg-white shadow-lift"
      }
    >
      <div className={compact ? "" : "grid gap-5 p-5 md:grid-cols-[1fr_0.9fr] md:p-6"}>
        <div>
          <div
            className={
              compact
                ? "inline-flex items-center gap-2 rounded-md border border-msm-electric/25 bg-white/10 px-3 py-1 text-xs font-bold text-msm-ice"
                : "inline-flex items-center gap-2 rounded-md border border-msm-electric/25 bg-msm-blue/10 px-3 py-1 text-xs font-bold text-msm-blue"
            }
          >
            <BrainCircuit size={15} />
            Centro inteligente MSM
          </div>
          <h2 className={compact ? "mt-3 text-2xl font-bold" : "mt-3 text-3xl font-bold text-msm-ink"}>
            YO SOY ELIANA, dime que necesitas.
          </h2>
          <p className={compact ? "mt-2 text-sm leading-6 text-msm-ice/80" : "mt-2 leading-7 text-slate-600"}>
            Escribe una intencion sencilla y ELIANA abre el camino correcto: productos, remesas,
            tienda oficial, KYC, comprobantes, soporte o vendedores VIP.
          </p>

          <form onSubmit={onSubmit} className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-msm-blue" size={17} />
              <input
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                placeholder="Ejemplo: quiero comprar una nevera en Segundo Frente"
                className={
                  compact
                    ? "min-h-12 w-full rounded-md border border-white/15 bg-white/10 pl-10 pr-3 text-sm font-semibold text-white outline-none placeholder:text-white/55 focus:border-msm-electric"
                    : "min-h-12 w-full rounded-md border border-msm-silver bg-white pl-10 pr-3 text-sm font-semibold text-msm-ink outline-none placeholder:text-slate-400 focus:border-msm-blue focus:ring-2 focus:ring-blue-100"
                }
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-msm-blue px-4 text-sm font-bold text-white shadow-glow transition hover:bg-msm-electric"
            >
              Abrir
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {featuredCommands.map(({ label, prompt, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => runCommand(prompt)}
                className={
                  compact
                    ? "inline-flex min-h-9 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/15"
                    : "inline-flex min-h-9 items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 text-xs font-bold text-msm-blue transition hover:border-msm-blue hover:bg-white"
                }
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={compact ? "mt-4 rounded-lg border border-white/15 bg-white/10 p-4" : "rounded-lg border border-blue-100 bg-blue-50/70 p-4"}>
          <p className={compact ? "text-xs font-bold uppercase tracking-wide text-msm-ice/70" : "text-xs font-bold uppercase tracking-wide text-msm-blue"}>
            Ruta sugerida por ELIANA
          </p>
          <h3 className={compact ? "mt-2 text-xl font-bold text-white" : "mt-2 text-xl font-bold text-msm-ink"}>
            {suggestion.intent.label}
          </h3>
          <p className={compact ? "mt-2 text-sm leading-6 text-msm-ice/75" : "mt-2 text-sm leading-6 text-slate-600"}>
            {suggestion.reason}
          </p>
          <Link
            href={suggestion.href}
            className={
              compact
                ? "mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-bold text-msm-blue"
                : "mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-msm-midnight px-4 text-sm font-bold text-white transition hover:bg-msm-navy"
            }
          >
            Abrir ahora
            <ArrowRight size={16} />
          </Link>
          <div className="mt-4 grid gap-2">
            {elianaCommandIntents.slice(0, 5).map((intent) => (
              <Link
                key={intent.id}
                href={intent.href}
                className={
                  compact
                    ? "rounded-md border border-white/10 px-3 py-2 text-xs font-semibold text-msm-ice/80 transition hover:bg-white/10"
                    : "rounded-md border border-blue-100 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-msm-blue hover:text-msm-blue"
                }
              >
                {intent.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
