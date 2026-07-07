import { Badge } from "@/components/ui/badge";
import { InventoryForm } from "@/components/dashboard/inventory-form";
import { getLowStockProducts } from "@/server/actions/inventory";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type InventoryTx = {
  id: string;
  quantity_change: number;
  reason: string;
  note: string | null;
  created_at: string;
  products: { name: string } | { name: string }[];
  profiles: { full_name: string } | { full_name: string }[];
};

type LowStockProduct = {
  id: string;
  name: string;
  stock: number;
  low_stock_threshold: number;
};

async function getInventoryLog(): Promise<InventoryTx[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("inventory_transactions")
      .select("*, products!inner(name), profiles!inner(full_name)")
      .order("created_at", { ascending: false })
      .limit(30);
    return (data ?? []) as unknown as InventoryTx[];
  } catch { return []; }
}

export default async function InventoryPage() {
  const [lowStock, log] = await Promise.all([getLowStockProducts() as Promise<LowStockProduct[]>, getInventoryLog()]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
      <Badge>Administracion</Badge>
      <h1 className="mt-3 text-3xl font-bold">Inventario</h1>

      {lowStock.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="font-bold text-amber-800">Stock bajo ({lowStock.length} productos)</h2>
          <div className="mt-2 space-y-1">
            {lowStock.map((p) => (
              <p key={p.id} className="text-sm text-amber-700">{p.name} — {p.stock} uds (umbral: {p.low_stock_threshold})</p>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Ajustar stock</h2>
          <InventoryForm />
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Movimientos recientes</h2>
          <div className="space-y-2 text-sm">
            {log.map((t) => {
              const product = Array.isArray(t.products) ? t.products[0] : t.products;
              const profile = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
              return (
                <div key={t.id} className="flex items-center justify-between rounded border p-2">
                  <div>
                    <p className="font-medium">{product?.name ?? "Producto"}</p>
                    <p className="text-xs text-slate-500">{t.reason}{t.note ? ` — ${t.note}` : ""}</p>
                    <p className="text-xs text-slate-400">{profile?.full_name ?? ""} — {new Date(t.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`font-bold ${t.quantity_change > 0 ? "text-green-600" : "text-red-600"}`}>
                    {t.quantity_change > 0 ? "+" : ""}{t.quantity_change}
                  </span>
                </div>
              );
            })}
            {log.length === 0 && <p className="text-slate-500">Sin movimientos.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
