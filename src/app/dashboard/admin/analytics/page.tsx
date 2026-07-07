import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { getDashboardStats, getRevenueByDay } from "@/server/actions/analytics";

export const dynamic = "force-dynamic";

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <p className="text-sm font-medium">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

export default async function AnalyticsPage() {
  const [stats, revenueByDay] = await Promise.all([getDashboardStats(), getRevenueByDay(14)]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
      <Badge>Analytics</Badge>
      <h1 className="mt-3 text-3xl font-bold">Dashboard de analytics</h1>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Ordenes hoy" value={String(stats.ordersToday)} icon={<ShoppingCart size={16} />} />
        <StatCard label="Ingresos 30d" value={`$${Number(stats.revenue30d).toLocaleString()}`} icon={<DollarSign size={16} />} />
        <StatCard label="Ordenes totales" value={String(stats.totalOrders)} icon={<Package size={16} />} />
        <StatCard label="Productos" value={String(stats.totalProducts)} icon={<TrendingUp size={16} />} />
        <StatCard label="Usuarios" value={String(stats.totalUsers)} icon={<Users size={16} />} />
        <StatCard label="Pendientes" value={String(stats.pendingOrders)} icon={<Package size={16} />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Ingresos diarios (14 dias)</h2>
          <div className="space-y-1">
            {revenueByDay.map((d: { date: string; revenue: number; commission: number; count: number }) => (
              <div key={d.date} className="flex items-center justify-between py-1 text-sm border-b last:border-0">
                <span className="font-medium">{new Date(d.date).toLocaleDateString()}</span>
                <div className="flex gap-4">
                  <span className="text-green-600 font-medium">${d.revenue.toFixed(0)}</span>
                  <span className="text-blue-600">${d.commission.toFixed(0)}</span>
                  <span className="text-slate-500">{d.count} ord</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Top productos (30 dias)</h2>
          <div className="space-y-1">
            {stats.topProducts.map((p: { name: string; quantity: number }, i: number) => (
              <div key={i} className="flex items-center justify-between py-1 text-sm border-b last:border-0">
                <span className="font-medium">{p.name}</span>
                <span className="text-slate-600">{p.quantity} vendidos</span>
              </div>
            ))}
            {stats.topProducts.length === 0 && <p className="text-slate-500">Sin datos.</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Ordenes recientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b text-slate-500"><th className="p-2">#</th><th className="p-2">Cliente</th><th className="p-2">Total</th><th className="p-2">Estado</th><th className="p-2">Fecha</th></tr></thead>
            <tbody>
              {stats.recentOrders.map((o: Record<string, unknown>) => {
                const profile = o.profiles as { full_name?: string } | { full_name?: string }[];
                return (
                  <tr key={o.id as string} className="border-t">
                    <td className="p-2 font-mono">{o.order_number as string}</td>
                    <td className="p-2">{Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name}</td>
                    <td className="p-2">${Number(o.subtotal ?? 0).toFixed(2)}</td>
                    <td className="p-2">{o.status as string}</td>
                    <td className="p-2">{new Date(o.created_at as string).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
