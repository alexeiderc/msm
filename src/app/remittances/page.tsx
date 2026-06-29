import { CircleDollarSign, FileCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { RemittanceForm } from "@/components/forms/remittance-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { receiveMethods, seedRemittanceMethods } from "@/lib/remittance-methods";

const steps = [
  ["Solicitud", "El cliente indica remitente, receptor en Cuba, monto, moneda y metodo MSM."],
  ["Pago revisado", "Economia valida comprobante, cuenta asignada, monto, pais y riesgo antifraude."],
  ["Entrega", "MSM coordina cierre auditable: efectivo, transferencia movil, tarjeta u otro metodo aprobado."]
];

type PublicMethod = {
  id: string;
  name: string;
  country: string;
  currency: string;
  type: string;
};

async function getRemittanceMethods(): Promise<PublicMethod[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("payment_methods")
      .select("id,country,currency,type,status,priority")
      .eq("status", "activo")
      .order("priority", { ascending: true });

    if (!data?.length) throw new Error("No methods");

    return data.map((method) => ({
      id: method.id,
      name: method.type,
      country: method.country,
      currency: method.currency,
      type: method.type
    }));
  } catch {
    return seedRemittanceMethods.map((method) => ({
      id: method.id,
      name: method.name,
      country: method.country,
      currency: method.currency,
      type: method.type
    }));
  }
}

export default async function RemittancesPage() {
  const methods = await getRemittanceMethods();

  return (
    <AppShell>
      <section className="border-b border-white/10 bg-msm-midnight text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-[1.1fr_0.9fr] md:py-14">
          <div>
            <Badge className="border-white/20 bg-white/10 text-msm-ice">Remesas MSM</Badge>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold md:text-6xl">
              Remesas con pago, revision y trazabilidad MSM.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-msm-ice/80">
              Un modulo financiero para enviar ayuda a Cuba con metodos activos, cuentas controladas,
              revision economica, alertas antifraude y registro auditable.
            </p>
          </div>
          <div className="msm-luminous-panel rounded-lg p-5">
            <CircleDollarSign className="text-msm-electric" size={30} />
            <h2 className="mt-4 text-xl font-bold">Control economico centralizado</h2>
            <p className="mt-2 text-sm leading-6 text-msm-ice/80">
              Las remesas no se mezclan con productos: quedan como operaciones financieras independientes
              con su propio numero, estado, metodo, cuenta y eventos.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 pb-24 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid gap-4">
          {steps.map(([title, detail], index) => (
            <article key={title} className="rounded-lg border border-msm-silver bg-white p-4 shadow-lift">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-msm-blue text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <h2 className="font-bold">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
                </div>
              </div>
            </article>
          ))}
          <article className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3 text-msm-ink">
              <ShieldCheck className="mt-1 text-msm-blue" size={20} />
              <p className="text-sm leading-6">
                Para crear remesas debes tener cuenta y KYC cliente. MSM puede pausar remesas por riesgo,
                metodo no disponible, pais/moneda no coincidente, capacidad diaria de cuenta o revision
                economica pendiente.
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold">
              <Link href="/auth/signup" className="text-msm-blue underline">
                Crear cuenta
              </Link>
              <Link href="/account/kyc" className="text-msm-blue underline">
                Completar KYC
              </Link>
            </div>
          </article>
          <article className="rounded-lg border border-msm-silver bg-white p-4 shadow-lift">
            <FileCheck className="text-msm-blue" size={24} />
            <h2 className="mt-3 font-bold">Comprobante obligatorio</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Despues de crear la remesa, MSM te muestra el acceso para subir captura, referencia, monto,
              fecha y nombre de quien envio el dinero. Economia aprueba, rechaza o pide nueva evidencia.
            </p>
          </article>
        </div>

        <div className="grid gap-5">
          <RemittanceForm methods={methods} />
          <section className="rounded-lg border border-msm-silver bg-white p-4 shadow-lift">
            <h2 className="text-lg font-bold">Metodos COMPRO disponibles</h2>
            <p className="mt-1 text-sm text-slate-600">
              Lista publica de pais, moneda y metodo. Las cuentas exactas se muestran solo dentro de una remesa creada.
            </p>
            <div className="mt-4 max-h-[520px] overflow-auto rounded-md border border-msm-line">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-msm-midnight text-white">
                  <tr>
                    <th className="px-3 py-2">Metodo</th>
                    <th className="px-3 py-2">Pais</th>
                    <th className="px-3 py-2">Moneda</th>
                    <th className="px-3 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {methods.map((method) => (
                    <tr key={method.id} className="border-t border-msm-line">
                      <td className="px-3 py-2 font-semibold">{method.name}</td>
                      <td className="px-3 py-2 text-slate-600">{method.country}</td>
                      <td className="px-3 py-2 text-slate-600">{method.currency}</td>
                      <td className="px-3 py-2 font-bold text-msm-blue">Activo</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="rounded-lg border border-msm-silver bg-white p-4 shadow-lift">
            <h2 className="text-lg font-bold">Metodos a recibir en Cuba</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {receiveMethods.map((method) => (
                <span key={method.value} className="rounded-md border border-msm-line bg-msm-cloud px-3 py-2 text-sm font-semibold">
                  {method.label}
                </span>
              ))}
            </div>
          </section>
        </div>
      </section>
    </AppShell>
  );
}
