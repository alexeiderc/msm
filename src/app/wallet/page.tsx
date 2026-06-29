import Link from "next/link";
import { ArrowRight, BadgeCheck, CircleDollarSign, History, QrCode, ShieldCheck, WalletCards } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { demoWallet } from "@/lib/atm-demo";

const walletTrustItems = [
  ["Pagos protegidos", "El saldo real solo se acredita despues de revision economica.", ShieldCheck],
  ["Conectado al ledger", "Cada movimiento debe generar asiento auditable.", CircleDollarSign],
  ["Preparado para Cajeros", "La billetera puede reservar efectivo y generar QR temporal.", QrCode],
  ["Confianza MSM", "KYC, riesgo, evidencia y soporte quedan unidos al usuario.", BadgeCheck]
] as const;

export default function WalletPage() {
  return (
    <AppShell>
      <section className="border-b border-white/10 bg-msm-midnight text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <Badge className="border-white/20 bg-white/10 text-msm-ice">Billetera digital MSM</Badge>
            <h1 className="mt-4 text-4xl font-bold md:text-5xl">Wallet MSM para pagos, reservas y confianza.</h1>
            <p className="mt-4 max-w-2xl leading-8 text-msm-ice/85">
              Esta primera version muestra la estructura para saldo, credito interno, reservas con QR,
              pagos manuales aprobados por Economia, remesas, cambios y futuros Cajeros MSM.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/atm" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-msm-blue px-4 text-sm font-bold text-white shadow-glow">
                Reservar efectivo <QrCode size={17} />
              </Link>
              <Link href="/payment-methods" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 text-sm font-bold text-white">
                Metodos activos <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          <div className="msm-luminous-panel rounded-lg p-5">
            <p className="flex items-center gap-2 font-bold">
              <WalletCards size={19} /> {demoWallet.owner}
            </p>
            <p className="mt-2 text-sm text-msm-ice/80">{demoWallet.status}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {demoWallet.balances.map((balance) => (
                <div key={balance.currency} className="rounded-lg border border-white/15 bg-white/10 p-3">
                  <p className="text-xs font-bold text-msm-ice/70">{balance.label}</p>
                  <p className="mt-2 text-2xl font-bold">{balance.amount}</p>
                  <p className="text-sm text-msm-ice/70">{balance.currency}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 pb-24 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg border border-msm-line bg-white p-5 shadow-lift">
          <h2 className="flex items-center gap-2 text-xl font-bold text-msm-ink">
            <History size={20} /> Movimientos demo
          </h2>
          <div className="mt-4 grid gap-3">
            {demoWallet.transactions.map((transaction) => (
              <article key={transaction.id} className="rounded-lg border border-msm-line bg-msm-cloud p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-msm-blue">{transaction.id}</p>
                    <h3 className="mt-1 font-bold text-msm-ink">{transaction.type}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{transaction.detail}</p>
                  </div>
                  <Badge>{transaction.status}</Badge>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {walletTrustItems.map(([title, detail, Icon]) => (
            <article key={title} className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
              <Icon className="text-msm-blue" size={22} />
              <h3 className="mt-3 font-bold text-msm-ink">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
