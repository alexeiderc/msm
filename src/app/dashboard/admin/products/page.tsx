import { Badge } from "@/components/ui/badge";
import { AdminStoreProductForm } from "@/components/dashboard/admin-forms";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getProducts() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("products")
      .select("id,name,slug,price,currency,stock,status,is_active,stores!inner(name)")
      .order("created_at", { ascending: false });
    return data ?? [];
  } catch { return []; }
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
      <Badge>Administracion</Badge>
      <h1 className="mt-3 text-3xl font-bold">Productos</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Crear producto</h2>
          <AdminStoreProductForm />
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Todos los productos ({products.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b text-slate-500"><th className="p-2">Producto</th><th className="p-2">Tienda</th><th className="p-2">Precio</th><th className="p-2">Stock</th><th className="p-2">Estado</th></tr></thead>
              <tbody>
                {products.map((p: Record<string, unknown>) => {
                  const store = p.stores as { name?: string } | { name?: string }[];
                  return (
                    <tr key={p.id as string} className="border-t">
                      <td className="p-2 font-medium">{p.name as string}</td>
                      <td className="p-2">{Array.isArray(store) ? store[0]?.name : store?.name}</td>
                      <td className="p-2">${Number(p.price ?? 0).toFixed(2)} {p.currency as string}</td>
                      <td className="p-2">{p.stock as number}</td>
                      <td className="p-2"><Badge>{(p.is_active as boolean) ? "Activo" : "Inactivo"} / {p.status as string}</Badge></td>
                    </tr>
                  );
                })}
                {products.length === 0 && <tr><td colSpan={5} className="p-4 text-slate-500">Sin productos.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
