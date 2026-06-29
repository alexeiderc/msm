import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";

const methods = [
  ["Estados Unidos", "Zelle", "activo"],
  ["Estados Unidos", "CashApp", "pausado"],
  ["España", "Bizum / IBAN", "activo"],
  ["México", "Oxxo", "pausado"],
  ["Global", "USDT", "activo"],
  ["Global", "PayPal", "oculto"]
];

export default function ActiveMethodsPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-8 pb-24">
        <Badge>Metodos activos</Badge>
        <h1 className="mt-3 text-3xl font-bold">Metodos de pago por pais</h1>
        <p className="mt-3 text-slate-600">
          Esta pagina solo muestra pais, metodo y estado. Las cuentas exactas se revelan dentro de una orden creada.
        </p>
        <div className="mt-6 overflow-hidden rounded-lg border border-msm-line bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">Pais</th>
                <th className="p-3">Metodo</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {methods.map(([country, method, status]) => (
                <tr key={`${country}-${method}`} className="border-t border-msm-line">
                  <td className="p-3 font-semibold">{country}</td>
                  <td className="p-3">{method}</td>
                  <td className="p-3"><Badge>{status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
