import { Badge } from "@/components/ui/badge";
import { ShippingRateForm } from "@/components/dashboard/shipping-rate-form";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getShippingRates() {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("shipping_rates").select("*").order("country").order("province");
    return data ?? [];
  } catch { return []; }
}

export default async function ShippingRatesPage() {
  const rates = await getShippingRates();

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
      <Badge>Administracion</Badge>
      <h1 className="mt-3 text-3xl font-bold">Tarifas de envio</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Nueva tarifa</h2>
          <ShippingRateForm />
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Tarifas ({rates.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b text-slate-500"><th className="p-2">Zona</th><th className="p-2">Costo</th><th className="p-2">Min. orden</th><th className="p-2">ETA</th><th className="p-2">Estado</th></tr></thead>
              <tbody>
                {rates.map((r: Record<string, unknown>) => (
                  <tr key={r.id as string} className="border-t">
                    <td className="p-2 font-medium">{[r.country, r.province, r.municipality].filter(Boolean).join(" / ")}</td>
                    <td className="p-2">${Number(r.cost ?? 0).toFixed(2)}</td>
                    <td className="p-2">${Number(r.min_order_amount ?? 0).toFixed(2)}</td>
                    <td className="p-2">{r.estimated_days as string}</td>
                    <td className="p-2"><Badge>{(r.is_active as boolean) ? "Activo" : "Inactivo"}</Badge></td>
                  </tr>
                ))}
                {rates.length === 0 && <tr><td colSpan={5} className="p-4 text-slate-500">Sin tarifas configuradas.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
