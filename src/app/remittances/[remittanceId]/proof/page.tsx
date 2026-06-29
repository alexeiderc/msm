import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { RemittanceProofForm } from "@/components/forms/remittance-proof-form";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type RemittanceProofDefaults = {
  id: string;
  remittance_number: string;
  sender_full_name: string;
  sender_country: string;
  sender_currency: string;
  send_amount: string | number;
  payment_method_id: string;
  payment_account_id: string | null;
  payment_accounts?: {
    visible_name?: string | null;
    internal_alias?: string | null;
  } | null;
};

async function getRemittance(remittanceId: string): Promise<RemittanceProofDefaults | null> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("remittances")
      .select(
        "id,remittance_number,sender_full_name,sender_country,sender_currency,send_amount,payment_method_id,payment_account_id,payment_accounts(visible_name,internal_alias)"
      )
      .eq("id", remittanceId)
      .maybeSingle();

    return data as RemittanceProofDefaults | null;
  } catch {
    return null;
  }
}

export default async function RemittanceProofPage({ params }: { params: Promise<{ remittanceId: string }> }) {
  const { remittanceId } = await params;
  const remittance = await getRemittance(remittanceId);

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-4 py-8 pb-24">
        <Badge>Remesas MSM</Badge>
        <h1 className="mt-3 text-3xl font-bold">Subir comprobante de remesa</h1>
        <p className="mt-3 leading-7 text-slate-600">
          La remesa queda en pendiente de pago hasta que economia revise el comprobante. Si se aprueba,
          pasa automaticamente a pago_recibido y queda lista para coordinar entrega.
        </p>

        {remittance ? (
          <div className="mt-5 rounded-lg border border-msm-line bg-msm-cloud p-4 text-sm">
            <p className="font-bold">{remittance.remittance_number}</p>
            <p className="mt-1 text-slate-600">
              Monto: {Number(remittance.send_amount).toFixed(2)} {remittance.sender_currency} desde{" "}
              {remittance.sender_country}
            </p>
            <p className="mt-1 text-slate-600">
              Cuenta asignada: {remittance.payment_accounts?.visible_name ?? "se muestra dentro de economia"}
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            No pude cargar los datos de la remesa. Puedes pegar manualmente el metodo y la cuenta asignada.
          </div>
        )}

        <RemittanceProofForm
          remittanceId={remittanceId}
          paymentMethodId={remittance?.payment_method_id}
          paymentAccountId={remittance?.payment_account_id}
          amount={remittance?.send_amount}
          currency={remittance?.sender_currency}
          country={remittance?.sender_country}
          senderName={remittance?.sender_full_name}
        />
      </section>
    </AppShell>
  );
}
