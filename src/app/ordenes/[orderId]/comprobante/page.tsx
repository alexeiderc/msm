import { AppShell } from "@/components/ui/shell";
import { PaymentProofForm } from "@/components/forms/payment-proof-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { currency } from "@/lib/utils";

async function getOrderPaymentContext(orderId: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("orders")
      .select("id,order_number,subtotal,payment_country,payment_currency,payment_method_id,payment_account_id,payment_methods(type,country,currency),payment_accounts(visible_name)")
      .eq("id", orderId)
      .maybeSingle();

    if (!data) return null;

    const row = data as typeof data & {
      payment_methods?: { type?: string; country?: string; currency?: string } | { type?: string; country?: string; currency?: string }[];
      payment_accounts?: { visible_name?: string } | { visible_name?: string }[];
    };
    const method = Array.isArray(row.payment_methods) ? row.payment_methods[0] : row.payment_methods;
    const account = Array.isArray(row.payment_accounts) ? row.payment_accounts[0] : row.payment_accounts;

    return {
      orderNumber: row.order_number as string,
      amount: Number(row.subtotal ?? 0),
      country: (row.payment_country as string | null) ?? method?.country ?? "",
      currencyCode: (row.payment_currency as string | null) ?? method?.currency ?? "USD",
      paymentMethodId: row.payment_method_id as string | null,
      paymentAccountId: row.payment_account_id as string | null,
      methodLabel: method ? `${method.type ?? "Metodo"} - ${method.country ?? ""} / ${method.currency ?? ""}` : null,
      accountLabel: account?.visible_name ?? null
    };
  } catch {
    return null;
  }
}

export default async function PaymentProofPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await getOrderPaymentContext(orderId);

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-4 py-8 pb-24">
        <h1 className="text-3xl font-bold">Subir comprobante de pago</h1>
        <p className="mt-3 text-slate-600">
          La orden queda en pendiente_pago hasta revision economica. Si se aprueba, cambia automaticamente a pago_confirmado.
        </p>
        {order ? (
          <div className="mt-5 rounded-lg border border-msm-line bg-white p-4 text-sm shadow-soft">
            <p className="font-bold">{order.orderNumber}</p>
            <p className="mt-1 text-slate-600">
              Total a comprobar: {currency(order.amount)} {order.currencyCode !== "USD" ? order.currencyCode : ""}
            </p>
            <p className="text-slate-600">Metodo: {order.methodLabel ?? "Asignado dentro de la orden"}</p>
            <p className="text-slate-600">Cuenta: {order.accountLabel ?? "Pendiente o no asignada"}</p>
          </div>
        ) : null}
        <PaymentProofForm
          orderId={orderId}
          paymentMethodId={order?.paymentMethodId}
          paymentAccountId={order?.paymentAccountId}
          amount={order?.amount}
          currency={order?.currencyCode}
          country={order?.country}
          methodLabel={order?.methodLabel}
          accountLabel={order?.accountLabel}
        />
      </section>
    </AppShell>
  );
}
