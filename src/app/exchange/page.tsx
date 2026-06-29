import Link from "next/link";
import { ArrowRight, ArrowRightLeft, CircleDollarSign, LockKeyhole, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { ExchangeQuoteSimulator } from "@/components/finance/exchange-quote-simulator";
import { demoExchangePairs } from "@/lib/atm-demo";

export default function ExchangePage() {
  return (
    <AppShell>
      <section className="msm-hero-surface relative isolate overflow-hidden px-4 py-10 text-white">
        <div className="absolute inset-0 bg-msm-midnight/50" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <Badge className="border-white/20 bg-white/10 text-msm-ice">Cambio de divisas MSM</Badge>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold md:text-6xl">Cambios con trazabilidad, zona y revision MSM.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-msm-ice/85">
            El modulo de cambio queda preparado para cotizacion segura, pago manual, cuenta rotativa,
            liquidez por zona, VIP o Cajero MSM disponible, comprobante y ledger.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/payment-methods" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-msm-blue px-4 text-sm font-bold text-white shadow-glow">
              Ver metodos <ArrowRight size={17} />
            </Link>
            <Link href="/atm" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 text-sm font-bold text-white">
              Cajeros MSM <ArrowRightLeft size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 pb-24 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          {demoExchangePairs.map((pair) => (
            <article key={`${pair.from}-${pair.to}`} className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-blue-50 text-msm-blue">
                  <CircleDollarSign size={21} />
                </span>
                <div>
                  <h2 className="font-bold text-msm-ink">{pair.from} -> {pair.to}</h2>
                  <p className="mt-1 text-sm text-slate-600">{pair.route}</p>
                </div>
              </div>
              <div className="mt-4 rounded-md border border-amber-100 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                {pair.status}. No se publican tasas reales fuera de una operacion MSM.
              </div>
            </article>
          ))}
          <article className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 font-bold text-msm-ink">
              <ShieldAlert size={19} className="text-msm-blue" /> Reglas antifraude
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              El sistema debe alertar si el pago viene por cuenta vieja, pais incorrecto, monto distinto,
              comprobante repetido, metodo pausado o cliente con riesgo elevado.
            </p>
          </article>
        </div>

        <div className="grid gap-5">
          <ExchangeQuoteSimulator />
          <article className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 font-bold text-msm-ink">
              <LockKeyhole size={19} className="text-msm-blue" /> Seguridad operativa
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Las instrucciones internas y cuentas exactas se muestran solamente dentro de una orden,
              remesa o reserva creada y asignada por MSM.
            </p>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
