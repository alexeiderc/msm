import { Activity, CircleDollarSign, PackageCheck, ShieldAlert, Store, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/dashboard/metric-card";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getExecutiveMetrics() {
  try {
    const admin = createAdminClient();
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const [
      { data: todayOrders },
      { data: weekOrders },
      { data: proofs },
      { data: delivered },
      { data: sellers },
      { data: tickets },
      { data: accounts },
      { data: ledger },
      { data: items },
      { data: remittances },
      { data: atmReservations },
      { data: atmMachines },
      { data: walletTransactions }
    ] = await Promise.all([
      admin.from("orders").select("subtotal,msm_commission,payment_country").gte("created_at", todayStart.toISOString()),
      admin.from("orders").select("subtotal,msm_commission,payment_country").gte("created_at", weekStart.toISOString()),
      admin.from("payment_proofs").select("id").eq("status", "recibido"),
      admin.from("orders").select("id").eq("status", "entregada").gte("updated_at", todayStart.toISOString()),
      admin.from("sellers").select("id").eq("status", "aprobado"),
      admin.from("support_tickets").select("id").in("status", ["abierto", "esperando_cliente", "esperando_vip", "en_revision"]),
      admin.from("payment_accounts").select("id").eq("status", "activa"),
      admin.from("ledger_entries").select("type,amount").gte("created_at", weekStart.toISOString()),
      admin.from("order_items").select("name,quantity").limit(200),
      admin.from("remittances").select("send_amount,status,sender_country").gte("created_at", weekStart.toISOString()),
      admin.from("atm_reservations").select("amount,status,currency,province,municipality").gte("created_at", weekStart.toISOString()),
      admin.from("atm_machines").select("id,status"),
      admin.from("wallet_transactions").select("amount,status,currency").gte("created_at", weekStart.toISOString())
    ]);

    const salesToday = (todayOrders ?? []).reduce((sum, order) => sum + Number(order.subtotal ?? 0), 0);
    const salesWeek = (weekOrders ?? []).reduce((sum, order) => sum + Number(order.subtotal ?? 0), 0);
    const msmCommission = (weekOrders ?? []).reduce((sum, order) => sum + Number(order.msm_commission ?? 0), 0);
    const netVip = (ledger ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
    const countryCounts = new Map<string, number>();
    const remittanceCountryCounts = new Map<string, number>();
    const productCounts = new Map<string, number>();
    const remittanceVolume = (remittances ?? []).reduce((sum, row) => sum + Number(row.send_amount ?? 0), 0);
    const remittancePending = (remittances ?? []).filter((row) =>
      ["pendiente_pago", "pago_recibido", "en_revision"].includes(row.status)
    ).length;
    const remittanceDelivered = (remittances ?? []).filter((row) =>
      ["entregada", "cerrada"].includes(row.status)
    ).length;
    const atmReservedVolume = (atmReservations ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
    const activeAtms = (atmMachines ?? []).filter((atm) => atm.status === "activo").length;
    const walletVolume = (walletTransactions ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

    for (const order of weekOrders ?? []) {
      if (order.payment_country) {
        countryCounts.set(order.payment_country, (countryCounts.get(order.payment_country) ?? 0) + 1);
      }
    }

    for (const item of items ?? []) {
      productCounts.set(item.name, (productCounts.get(item.name) ?? 0) + Number(item.quantity ?? 0));
    }

    for (const remittance of remittances ?? []) {
      if (remittance.sender_country) {
        remittanceCountryCounts.set(
          remittance.sender_country,
          (remittanceCountryCounts.get(remittance.sender_country) ?? 0) + 1
        );
      }
    }

    return {
      salesToday,
      todayCount: todayOrders?.length ?? 0,
      salesWeek,
      proofsToReview: proofs?.length ?? 0,
      deliveredToday: delivered?.length ?? 0,
      activeSellers: sellers?.length ?? 0,
      incidents: tickets?.length ?? 0,
      msmCommission,
      netVip,
      activeAccounts: accounts?.length ?? 0,
      remittanceVolume,
      remittanceCount: remittances?.length ?? 0,
      remittancePending,
      remittanceDelivered,
      atmReservedVolume,
      atmReservationsCount: atmReservations?.length ?? 0,
      activeAtms,
      walletVolume,
      walletTransactionsCount: walletTransactions?.length ?? 0,
      topProducts: [...productCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name),
      topCountries: [...countryCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name]) => name),
      topRemittanceCountries: [...remittanceCountryCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name]) => name)
    };
  } catch {
    return {
      salesToday: 0,
      todayCount: 0,
      salesWeek: 0,
      proofsToReview: 0,
      deliveredToday: 0,
      activeSellers: 0,
      incidents: 0,
      msmCommission: 0,
      netVip: 0,
      activeAccounts: 0,
      remittanceVolume: 0,
      remittanceCount: 0,
      remittancePending: 0,
      remittanceDelivered: 0,
      atmReservedVolume: 0,
      atmReservationsCount: 0,
      activeAtms: 0,
      walletVolume: 0,
      walletTransactionsCount: 0,
      topProducts: ["Sin ventas reales aun"],
      topCountries: ["Sin movimiento real aun"],
      topRemittanceCountries: ["Sin remesas reales aun"]
    };
  }
}

function usd(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default async function ExecutiveDashboardPage() {
  const metrics = await getExecutiveMetrics();

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
        <Badge>Reporte ejecutivo</Badge>
        <h1 className="mt-3 text-3xl font-bold">Panel para Don Miguel</h1>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Ventas del dia" value={usd(metrics.salesToday)} detail={`${metrics.todayCount} ordenes creadas`} />
          <MetricCard label="Ventas de la semana" value={usd(metrics.salesWeek)} detail="Ultimos 7 dias" />
          <MetricCard label="Pagos por revisar" value={String(metrics.proofsToReview)} detail="Comprobantes recibidos" />
          <MetricCard label="Incidencias" value={String(metrics.incidents)} detail="Tickets abiertos" />
          <MetricCard label="Entregadas" value={String(metrics.deliveredToday)} detail="Hoy" />
          <MetricCard label="Vendedores activos" value={String(metrics.activeSellers)} detail="VIP operando" />
          <MetricCard label="Comision MSM" value={usd(metrics.msmCommission)} detail="Semana actual" />
          <MetricCard label="Neto a VIP" value={usd(metrics.netVip)} detail="Ledger semanal" />
          <MetricCard label="Volumen remesas" value={usd(metrics.remittanceVolume)} detail={`${metrics.remittanceCount} remesas semanales`} />
          <MetricCard label="Remesas pendientes" value={String(metrics.remittancePending)} detail="Pago o revision" />
          <MetricCard label="Remesas entregadas" value={String(metrics.remittanceDelivered)} detail="Entregadas o cerradas" />
          <MetricCard label="Origen remesas" value={metrics.topRemittanceCountries.length ? metrics.topRemittanceCountries[0] : "N/A"} detail={metrics.topRemittanceCountries.join(", ")} />
          <MetricCard label="Reservas Cajero MSM" value={String(metrics.atmReservationsCount)} detail={usd(metrics.atmReservedVolume)} />
          <MetricCard label="Cajeros activos" value={String(metrics.activeAtms)} detail="Fase digital/fisica" />
          <MetricCard label="Volumen billetera" value={usd(metrics.walletVolume)} detail={`${metrics.walletTransactionsCount} movimientos`} />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <section className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="flex items-center gap-2 font-bold"><PackageCheck size={18} />Productos mas vendidos</h2>
            <div className="mt-3 grid gap-2 text-sm">
              {metrics.topProducts.map((product) => <span key={product}>{product}</span>)}
            </div>
          </section>
          <section className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="flex items-center gap-2 font-bold"><WalletCards size={18} />Cuentas activas</h2>
            <p className="mt-3 text-sm text-slate-600">{metrics.activeAccounts} cuentas activas para pagos manuales.</p>
          </section>
          <section className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="flex items-center gap-2 font-bold"><Activity size={18} />Paises con movimiento</h2>
            <p className="mt-3 text-sm text-slate-600">{metrics.topCountries.join(", ")}</p>
          </section>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Badge className="justify-center"><CircleDollarSign size={15} /> Ledger actualizado</Badge>
          <Badge className="justify-center"><Store size={15} /> VIP activos</Badge>
          <Badge className="justify-center"><ShieldAlert size={15} /> Alertas antifraude</Badge>
        </div>
      </section>
  );
}
