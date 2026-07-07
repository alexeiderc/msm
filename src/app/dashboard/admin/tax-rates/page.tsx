import { Badge } from "@/components/ui/badge";
import { TaxRateForm } from "@/components/dashboard/tax-rate-form";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getTaxRates() {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("tax_rates").select("*").order("country").order("province");
    return data ?? [];
  } catch { return []; }
}

export default async function TaxRatesPage() {
  const rates = await getTaxRates();

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
      <Badge>Administracion</Badge>
      <h1 className="mt-3 text-3xl font-bold">Impuestos (IVA/VAT)</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Nueva tasa</h2>
          <TaxRateForm />
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Tasas configuradas ({rates.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b text-slate-500"><th className="p-2">Pais</th><th className="p-2">Provincia</th><th className="p-2">Tasa</th><th className="p-2">Estado</th></tr></thead>
              <tbody>
                {rates.map((r: Record<string, unknown>) => (
                  <tr key={r.id as string} className="border-t">
                    <td className="p-2 font-medium">{r.country as string}</td>
                    <td className="p-2">{r.province as string ?? "Todas"}</td>
                    <td className="p-2">{r.rate_percent as number}% {(r.tax_name as string)}</td>
                    <td className="p-2"><Badge>{(r.is_active as boolean) ? "Activo" : "Inactivo"}</Badge></td>
                  </tr>
                ))}
                {rates.length === 0 && <tr><td colSpan={4} className="p-4 text-slate-500">Sin tasas configuradas.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
