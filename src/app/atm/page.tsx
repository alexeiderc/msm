import Link from "next/link";
import { Activity, ArrowRight, MapPin, QrCode, WalletCards } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { AtmReservationSimulator } from "@/components/finance/atm-reservation-simulator";
import { demoAtmMachines } from "@/lib/atm-demo";

export default function AtmPage() {
  return (
    <AppShell>
      <section className="msm-hero-surface relative isolate overflow-hidden px-4 py-10 text-white">
        <div className="absolute inset-0 bg-msm-midnight/45" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <Badge className="border-white/20 bg-white/10 text-msm-ice">Fase 2 preparada</Badge>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold md:text-6xl">Cajeros MSM Digital</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-msm-ice/85">
              Primero software, despues hardware: reservas de efectivo, QR temporal, remesas,
              cambios, billetera, ledger y auditoria conectados al mismo cerebro MSM.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/wallet" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-msm-blue px-4 text-sm font-bold text-white shadow-glow">
                Abrir billetera <WalletCards size={17} />
              </Link>
              <Link href="/exchange" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 text-sm font-bold text-white">
                Cambio demo <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          <div className="msm-luminous-panel rounded-lg p-5">
            <p className="flex items-center gap-2 font-bold">
              <QrCode size={19} /> Flujo futuro conectado
            </p>
            <div className="mt-4 grid gap-2 text-sm text-msm-ice/85">
              <span>1. Cliente reserva efectivo o cambio.</span>
              <span>2. Economia aprueba pago y liquidez.</span>
              <span>3. VIP o Cajero MSM entrega con QR y evidencia.</span>
              <span>4. Ledger registra comision, saldo y auditoria.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 pb-24 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          {demoAtmMachines.map((atm) => (
            <article key={atm.id} className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-msm-blue">{atm.id}</p>
                  <h2 className="mt-1 text-xl font-bold text-msm-ink">{atm.name}</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <MapPin size={16} /> {atm.municipality}, {atm.province}
                  </p>
                </div>
                <Badge className={atm.status === "activo" ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
                  {atm.status}
                </Badge>
              </div>
              <div className="mt-4 grid gap-2">
                {atm.currencies.map((item) => (
                  <div key={`${atm.id}-${item.currency}`} className="grid gap-1 rounded-md bg-msm-cloud p-3 text-sm font-semibold text-slate-700">
                    <span>{item.currency}: {item.availability}</span>
                    <span className="text-xs text-slate-500">{item.amountLabel}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1"><Activity size={14} /> Sincronizacion: {atm.lastSync}</span>
                <span className="inline-flex items-center gap-1"><Activity size={14} /> Responsable: {atm.technician}</span>
              </div>
            </article>
          ))}
        </div>

        <AtmReservationSimulator />
      </section>
    </AppShell>
  );
}
