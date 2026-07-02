import { Download, WalletCards } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/dashboard/metric-card";
import {
  InlinePaymentReviewForm,
  InlineRemittancePaymentReviewForm,
  PaymentAccountForm,
  PaymentMethodForm,
  PaymentReviewForm,
  PayoutForm,
  RemittancePaymentReviewForm,
  RemittanceStatusForm
} from "@/components/dashboard/economic-forms";
import { WalletLoadReviewButtons } from "@/components/wallet/wallet-forms";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getLedgerRows() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("ledger_entries")
      .select("id,type,amount,description,order_id,seller_id,created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    return data ?? [];
  } catch {
    return [];
  }
}

async function getRemittances() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("remittances")
      .select("id,remittance_number,status,sender_country,sender_currency,send_amount,net_amount,recipient_full_name,recipient_municipality,payout_method,created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    return data ?? [];
  } catch {
    return [];
  }
}

async function getPaymentProofs() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("payment_proofs")
      .select("id,order_id,status,amount,currency,country,sender_name,reference,image_url,created_at,orders(order_number,receiver_full_name,customer_risk_level,customer_risk_score,customer_risk_reasons)")
      .order("created_at", { ascending: false })
      .limit(20);

    return data ?? [];
  } catch {
    return [];
  }
}

async function getRemittanceProofs() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("remittance_payment_proofs")
      .select("id,remittance_id,status,amount,currency,country,sender_name,reference,created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    return data ?? [];
  } catch {
    return [];
  }
}

async function getWalletLoadRequests() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("wallet_load_requests")
      .select("id,load_number,status,amount,currency,country,sender_name,reference,proof_url,created_at,profiles(full_name,email)")
      .order("created_at", { ascending: false })
      .limit(25);

    return data ?? [];
  } catch {
    return [];
  }
}

export default async function EconomyDashboardPage() {
  const ledger = await getLedgerRows();
  const remittances = await getRemittances();
  const paymentProofs = await getPaymentProofs();
  const remittanceProofs = await getRemittanceProofs();
  const walletLoadRequests = await getWalletLoadRequests();
  const remittanceVolume = remittances.reduce((sum, row) => sum + Number(row.send_amount ?? 0), 0);
  const remittancePending = remittances.filter((row) => ["pendiente_pago", "pago_recibido", "en_revision"].includes(row.status)).length;
  const paymentProofsPending = paymentProofs.filter((row) => row.status === "recibido").length;
  const remittanceProofsPending = remittanceProofs.filter((row) => row.status === "recibido").length;
  const walletLoadsPending = walletLoadRequests.filter((row) => row.status === "pendiente_revision").length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge>Panel economico</Badge>
            <h1 className="mt-3 text-3xl font-bold">Ledger, cierres y pagos</h1>
          </div>
          <Link
            href="/api/ledger/export"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-msm-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-msm-ink"
          >
            <Download size={17} />Exportar CSV
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Venta bruta" value="$18,420" detail="Semana actual" />
          <MetricCard label="Comision MSM" value="$1,642" detail="Acumulado por cerrar" />
          <MetricCard label="Saldo pendiente" value="$11,904" detail="A vendedores" />
          <MetricCard label="Saldo pagado" value="$39,210" detail="Mes actual" />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Remesas recientes" value={`${remittances.length}`} detail="Ultimas 20 solicitudes" />
          <MetricCard label="Remesas pendientes" value={`${remittancePending}`} detail="Pago o revision" />
          <MetricCard label="Comprobantes ordenes" value={`${paymentProofsPending}`} detail="Recibidos sin decision" />
          <MetricCard label="Comprobantes remesa" value={`${remittanceProofsPending}`} detail="Recibidos sin decision" />
          <MetricCard label="Volumen remesas" value={`$${remittanceVolume.toFixed(2)}`} detail="Segun solicitudes recientes" />
          <MetricCard label="Cargas Saldo MSM" value={`${walletLoadsPending}`} detail="Pendientes de revision" />
        </div>

        <section className="mt-6 overflow-hidden rounded-lg border border-msm-line bg-white shadow-soft">
          <div className="border-b border-msm-line p-4">
            <h2 className="text-lg font-bold">Recargas de Saldo MSM</h2>
            <p className="mt-1 text-sm text-slate-600">
              Economia aprueba aqui las cargas. Al aprobar, el saldo se acredita y queda movimiento auditable.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-msm-midnight text-white">
                <tr>
                  <th className="p-3">Solicitud</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Monto</th>
                  <th className="p-3">Pais</th>
                  <th className="p-3">Enviado por</th>
                  <th className="p-3">Referencia</th>
                  <th className="p-3">Comprobante</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {walletLoadRequests.length ? walletLoadRequests.map((row) => {
                  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

                  return (
                    <tr key={row.id} className="border-t border-msm-line">
                      <td className="p-3">
                        <p className="font-semibold">{row.load_number}</p>
                        <p className="text-xs text-slate-500">{new Date(row.created_at).toLocaleString("es-US")}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold">{profile?.full_name ?? "Cliente MSM"}</p>
                        <p className="text-xs text-slate-500">{profile?.email ?? ""}</p>
                      </td>
                      <td className="p-3">{row.status}</td>
                      <td className="p-3">${Number(row.amount).toFixed(2)} {row.currency}</td>
                      <td className="p-3">{row.country}</td>
                      <td className="p-3">{row.sender_name}</td>
                      <td className="p-3">{row.reference}</td>
                      <td className="p-3">
                        {row.proof_url ? (
                          <a href={row.proof_url} target="_blank" className="font-bold text-msm-blue" rel="noreferrer">
                            Ver
                          </a>
                        ) : "Pendiente"}
                      </td>
                      <td className="p-3">
                        <WalletLoadReviewButtons requestId={row.id} />
                      </td>
                    </tr>
                  );
                }) : (
                  <tr className="border-t border-msm-line">
                    <td className="p-3 text-slate-600" colSpan={9}>Sin solicitudes de Saldo MSM todavia.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-lg border border-msm-line bg-white shadow-soft">
          <div className="border-b border-msm-line p-4">
            <h2 className="text-lg font-bold">Comprobantes de ordenes</h2>
            <p className="mt-1 text-sm text-slate-600">
              Economia revisa aqui sin copiar IDs: aprobar activa entrega VIP y registra ledger.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-msm-midnight text-white">
                <tr>
                  <th className="p-3">Orden</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Monto</th>
                  <th className="p-3">Origen</th>
                  <th className="p-3">Enviado por</th>
                  <th className="p-3">Referencia</th>
                  <th className="p-3">Riesgo</th>
                  <th className="p-3">Evidencia</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paymentProofs.length ? paymentProofs.map((row) => {
                  const order = Array.isArray(row.orders) ? row.orders[0] : row.orders;

                  return (
                    <tr key={row.id} className="border-t border-msm-line">
                      <td className="p-3">
                        <p className="font-semibold">{order?.order_number ?? row.order_id}</p>
                        <p className="text-xs text-slate-500">{order?.receiver_full_name ?? "Receptor"}</p>
                      </td>
                      <td className="p-3">{row.status}</td>
                      <td className="p-3">${Number(row.amount).toFixed(2)} {row.currency}</td>
                      <td className="p-3">{row.country}</td>
                      <td className="p-3">{row.sender_name}</td>
                      <td className="p-3">{row.reference}</td>
                      <td className="p-3">
                        <p className="font-bold">{order?.customer_risk_level ?? "normal"} / {order?.customer_risk_score ?? 0}</p>
                        <p className="max-w-xs text-xs text-slate-500">
                          {Array.isArray(order?.customer_risk_reasons)
                            ? order.customer_risk_reasons.slice(0, 2).join(" ")
                            : "Sin razones registradas"}
                        </p>
                      </td>
                      <td className="p-3">
                        {row.image_url ? (
                          <a href={row.image_url} target="_blank" className="font-bold text-msm-blue" rel="noreferrer">
                            Ver captura
                          </a>
                        ) : "Sin captura"}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <InlinePaymentReviewForm proofId={row.id} orderId={row.order_id} decision="aprobado" label="Aprobar" />
                          <InlinePaymentReviewForm proofId={row.id} orderId={row.order_id} decision="rechazado" label="Rechazar" />
                          <InlinePaymentReviewForm proofId={row.id} orderId={row.order_id} decision="nueva_evidencia" label="Pedir evidencia" />
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr className="border-t border-msm-line">
                    <td className="p-3 text-slate-600" colSpan={9}>Sin comprobantes de ordenes todavia.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="overflow-hidden rounded-lg border border-msm-line bg-white shadow-soft">
            <div className="border-b border-msm-line p-4">
              <h2 className="text-lg font-bold">Movimientos financieros</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-3">Orden</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Monto</th>
                    <th className="p-3">Contraparte</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.length ? ledger.map((row) => (
                    <tr key={row.id} className="border-t border-msm-line">
                      <td className="p-3 font-semibold">{row.order_id ?? row.id}</td>
                      <td className="p-3">{row.type}</td>
                      <td className="p-3">${Number(row.amount).toFixed(2)}</td>
                      <td className="p-3">{row.description}</td>
                    </tr>
                  )) : (
                    <tr className="border-t border-msm-line">
                      <td className="p-3 text-slate-600" colSpan={4}>Sin movimientos reales todavia. Aprueba un comprobante para crear ledger.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <WalletCards className="text-msm-blue" size={20} />
              <h2 className="text-lg font-bold">Registrar pago</h2>
            </div>
            <PayoutForm />
          </section>
        </div>

        <section className="mt-6 overflow-hidden rounded-lg border border-msm-line bg-white shadow-soft">
          <div className="border-b border-msm-line p-4">
            <h2 className="text-lg font-bold">Remesas MSM</h2>
            <p className="mt-1 text-sm text-slate-600">Solicitudes recientes, receptor, municipio, metodo de entrega y estado.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-msm-midnight text-white">
                <tr>
                  <th className="p-3">Numero</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Origen</th>
                  <th className="p-3">Monto</th>
                  <th className="p-3">Metodo a recibir</th>
                  <th className="p-3">Receptor</th>
                  <th className="p-3">Municipio</th>
                  <th className="p-3">Creada</th>
                </tr>
              </thead>
              <tbody>
                {remittances.length ? remittances.map((row) => (
                  <tr key={row.id} className="border-t border-msm-line">
                    <td className="p-3">
                      <p className="font-semibold">{row.remittance_number}</p>
                      <p className="text-xs text-slate-500">ID: {row.id}</p>
                    </td>
                    <td className="p-3">{row.status}</td>
                    <td className="p-3">{row.sender_country} / {row.sender_currency}</td>
                    <td className="p-3">${Number(row.send_amount).toFixed(2)}</td>
                    <td className="p-3">{row.payout_method}</td>
                    <td className="p-3">{row.recipient_full_name}</td>
                    <td className="p-3">{row.recipient_municipality}</td>
                    <td className="p-3">{new Date(row.created_at).toLocaleDateString("es-US")}</td>
                  </tr>
                )) : (
                  <tr className="border-t border-msm-line">
                    <td className="p-3 text-slate-600" colSpan={8}>Sin remesas reales todavia.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-lg border border-msm-line bg-white shadow-soft">
          <div className="border-b border-msm-line p-4">
            <h2 className="text-lg font-bold">Comprobantes de remesas</h2>
            <p className="mt-1 text-sm text-slate-600">Evidencias recibidas para aprobar, rechazar o pedir nueva evidencia.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Comprobante</th>
                  <th className="p-3">Remesa</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Monto</th>
                  <th className="p-3">Origen</th>
                  <th className="p-3">Enviado por</th>
                  <th className="p-3">Referencia</th>
                  <th className="p-3">Recibido</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {remittanceProofs.length ? remittanceProofs.map((row) => (
                  <tr key={row.id} className="border-t border-msm-line">
                    <td className="p-3">
                      <p className="font-semibold">{row.id}</p>
                    </td>
                    <td className="p-3">{row.remittance_id}</td>
                    <td className="p-3">{row.status}</td>
                    <td className="p-3">${Number(row.amount).toFixed(2)} {row.currency}</td>
                    <td className="p-3">{row.country}</td>
                    <td className="p-3">{row.sender_name}</td>
                    <td className="p-3">{row.reference}</td>
                    <td className="p-3">{new Date(row.created_at).toLocaleDateString("es-US")}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <InlineRemittancePaymentReviewForm proofId={row.id} remittanceId={row.remittance_id} decision="aprobado" label="Aprobar" />
                        <InlineRemittancePaymentReviewForm proofId={row.id} remittanceId={row.remittance_id} decision="rechazado" label="Rechazar" />
                        <InlineRemittancePaymentReviewForm proofId={row.id} remittanceId={row.remittance_id} decision="nueva_evidencia" label="Pedir evidencia" />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr className="border-t border-msm-line">
                    <td className="p-3 text-slate-600" colSpan={9}>Sin comprobantes de remesas todavia.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-5">
          <PaymentMethodForm />
          <PaymentAccountForm />
          <PaymentReviewForm />
          <RemittancePaymentReviewForm />
          <RemittanceStatusForm />
        </div>
      </section>
  );
}
