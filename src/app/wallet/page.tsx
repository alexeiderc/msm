import Link from "next/link";
import { ArrowRight, BadgeCheck, CircleDollarSign, History, ShieldCheck, WalletCards } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { WalletLoadRequestForm } from "@/components/wallet/wallet-forms";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const walletTrustItems = [
  ["Saldo interno", "El cliente carga Saldo MSM y compra dentro de MSM con una sola logica.", WalletCards],
  ["Revision economica", "Cada carga necesita aprobacion manual antes de acreditarse.", ShieldCheck],
  ["Ledger auditable", "Credito, debito, orden, comision y saldo quedan trazados.", CircleDollarSign],
  ["Reputacion futura", "Los eventos alimentan SAFYLO y Life Score cuando se conecte.", BadgeCheck]
] as const;

async function getWalletData() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, wallets: [], transactions: [], loadRequests: [], methods: [] };
  }

  const [wallets, transactions, loadRequests, methods] = await Promise.all([
    supabase.from("wallet_accounts").select("id,currency,balance,reserved_balance,status,risk_hold").eq("user_id", user.id),
    supabase
      .from("wallet_transactions")
      .select("id,type,status,amount,currency,note,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("wallet_load_requests")
      .select("id,load_number,amount,currency,country,status,reference,proof_url,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("payment_methods")
      .select("id,country,currency,type,status")
      .eq("status", "activo")
      .order("country", { ascending: true })
  ]);

  return {
    user,
    wallets: wallets.data ?? [],
    transactions: transactions.data ?? [],
    loadRequests: loadRequests.data ?? [],
    methods: methods.data ?? []
  };
}

export default async function WalletPage() {
  const { user, wallets, transactions, loadRequests, methods } = await getWalletData();
  const primaryWallet = wallets.find((wallet) => wallet.currency === "USD") ?? wallets[0];

  return (
    <AppShell>
      <section className="border-b border-white/10 bg-msm-midnight text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <Badge className="border-white/20 bg-white/10 text-msm-ice">Saldo MSM beta controlada</Badge>
            <h1 className="mt-4 text-4xl font-bold md:text-5xl">Carga Saldo MSM y compra dentro de la plataforma.</h1>
            <p className="mt-4 max-w-2xl leading-8 text-msm-ice/85">
              Los metodos externos se usan para cargar saldo. Despues de la revision economica,
              compras productos, servicios, remesas y reservas usando Saldo MSM.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/checkout" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-msm-blue px-4 text-sm font-bold text-white shadow-glow">
                Comprar con saldo <ArrowRight size={17} />
              </Link>
              <Link href="/payment-methods" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 text-sm font-bold text-white">
                Metodos para cargar <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          <div className="msm-luminous-panel rounded-lg p-5">
            <p className="flex items-center gap-2 font-bold">
              <WalletCards size={19} /> Mi Saldo MSM
            </p>
            {!user ? (
              <div className="mt-4 rounded-lg border border-white/15 bg-white/10 p-4">
                <p className="text-sm leading-6 text-msm-ice/85">Crea cuenta o inicia sesion para ver y cargar tu saldo.</p>
                <Link href="/auth/login?next=/wallet" className="mt-4 inline-flex rounded-md bg-white px-4 py-2 text-sm font-bold text-msm-navy">
                  Entrar
                </Link>
              </div>
            ) : (
              <>
                <p className="mt-2 text-sm text-msm-ice/80">
                  Estado: {primaryWallet?.status ?? "sin saldo creado"} {primaryWallet?.risk_hold ? " / revision" : ""}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {(wallets.length ? wallets : [{ currency: "USD", balance: 0, reserved_balance: 0, status: "pendiente", id: "empty" }]).map((balance) => (
                    <div key={balance.id} className="rounded-lg border border-white/15 bg-white/10 p-3">
                      <p className="text-xs font-bold text-msm-ice/70">Disponible</p>
                      <p className="mt-2 text-2xl font-bold">{Number(balance.balance ?? 0).toFixed(2)}</p>
                      <p className="text-sm text-msm-ice/70">{balance.currency}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 pb-24 lg:grid-cols-[1fr_0.8fr]">
        <div className="grid gap-5">
          <div className="rounded-lg border border-msm-line bg-white p-5 shadow-lift">
            <h2 className="flex items-center gap-2 text-xl font-bold text-msm-ink">
              <CircleDollarSign size={20} /> Cargar Saldo MSM
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              En beta, la carga se revisa manualmente por Economia. No uses datos reales de clientes hasta activar produccion.
            </p>
            <div className="mt-4">
              {user ? <WalletLoadRequestForm methods={methods} /> : <Link className="font-bold text-msm-blue underline" href="/auth/signup?next=/wallet">Crear cuenta para cargar saldo</Link>}
            </div>
          </div>

          <div className="rounded-lg border border-msm-line bg-white p-5 shadow-lift">
            <h2 className="flex items-center gap-2 text-xl font-bold text-msm-ink">
              <History size={20} /> Movimientos reales
            </h2>
            <div className="mt-4 grid gap-3">
              {transactions.length ? transactions.map((transaction) => (
                <article key={transaction.id} className="rounded-lg border border-msm-line bg-msm-cloud p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-msm-blue">{new Date(transaction.created_at).toLocaleString("es-US")}</p>
                      <h3 className="mt-1 font-bold text-msm-ink">{transaction.type} / {transaction.status}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{transaction.note ?? "Movimiento Saldo MSM"}</p>
                    </div>
                    <Badge>{Number(transaction.amount).toFixed(2)} {transaction.currency}</Badge>
                  </div>
                </article>
              )) : (
                <p className="rounded-lg border border-dashed border-msm-line p-4 text-sm text-slate-600">
                  Todavia no hay movimientos. Crea una solicitud de carga y apruebala desde Economia.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <article className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h3 className="font-bold text-msm-ink">Solicitudes de carga</h3>
            <div className="mt-3 grid gap-3">
              {loadRequests.length ? loadRequests.map((request) => (
                <div key={request.id} className="rounded-lg border border-msm-line bg-msm-cloud p-3 text-sm">
                  <p className="font-bold text-msm-blue">{request.load_number}</p>
                  <p className="mt-1">{Number(request.amount).toFixed(2)} {request.currency} / {request.country}</p>
                  <p className="text-slate-600">Estado: {request.status}</p>
                  <p className="text-slate-500">Ref: {request.reference}</p>
                </div>
              )) : <p className="text-sm text-slate-600">Sin solicitudes todavia.</p>}
            </div>
          </article>

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
