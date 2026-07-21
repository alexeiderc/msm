import { AppShell } from "@/components/ui/shell";
import { CheckoutForm } from "@/components/marketplace/checkout-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { currency } from "@/lib/utils";
import Link from "next/link";

type CheckoutSummary = {
  name: string;
  price: number;
  store: string;
  stock: number;
};

async function getCheckoutSummary(productId: string): Promise<CheckoutSummary | null> {
  if (!productId) return null;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("products")
      .select("name,price,stock,status,is_active,stores(name,status,is_active,province,municipality)")
      .eq("id", productId)
      .eq("status", "activo")
      .eq("is_active", true)
      .maybeSingle();

    if (!data) return null;

    const row = data as unknown as {
      name: string;
      price: number | string;
      stock: number | string;
      stores?: { name?: string; status?: string; is_active?: boolean; province?: string | null; municipality?: string | null } | { name?: string; status?: string; is_active?: boolean; province?: string | null; municipality?: string | null }[];
    };
    const store = Array.isArray(row.stores) ? row.stores[0] : row.stores;

    if (store?.status !== "activo" || store?.is_active !== true || !store?.province || !store?.municipality) {
      return null;
    }

    return {
      name: row.name,
      price: Number(row.price),
      stock: Number(row.stock),
      store: store.name ?? "Tienda VIP"
    };
  } catch {
    return null;
  }
}

async function getCustomerTrustStatus() {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return { signedIn: false, ready: false, status: "sin cuenta", risk: "pendiente" };
    }

    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("full_name,phone,country,address,customer_kyc_status,customer_risk_level,identity_document_type,identity_document_last4,payment_account_owner,chargeback_policy_accepted_at")
      .eq("id", user.id)
      .maybeSingle();

    const ready = Boolean(
      data?.full_name &&
        data.phone &&
        data.country &&
        data.address &&
        data.identity_document_type &&
        data.identity_document_last4 &&
        data.payment_account_owner &&
        data.chargeback_policy_accepted_at
    );

    return {
      signedIn: true,
      ready,
      status: data?.customer_kyc_status ?? "pendiente",
      risk: data?.customer_risk_level ?? "normal"
    };
  } catch {
    return { signedIn: false, ready: false, status: "modo local", risk: "pendiente" };
  }
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const params = await searchParams;
  const requestedProductId = params.product ?? "";
  const productId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    requestedProductId
  )
    ? requestedProductId
    : "";
  const summary = await getCheckoutSummary(productId);
  const customerTrust = await getCustomerTrustStatus();

  return (
    <AppShell>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 pb-24 lg:grid-cols-[1fr_380px]">
        <CheckoutForm productId={productId} />

        <aside className="grid h-fit gap-4">
          <article className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="text-lg font-bold">Confianza del cliente</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <span>Cuenta: {customerTrust.signedIn ? "iniciada" : "datos requeridos al confirmar"}</span>
              {customerTrust.signedIn ? <span>KYC: {customerTrust.status}</span> : null}
              {customerTrust.signedIn ? <span>Riesgo: {customerTrust.risk}</span> : null}
            </div>
            {customerTrust.signedIn && !customerTrust.ready ? (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                Para pagar, primero completa KYC y acepta la politica contra reclamos falsos.
                <div className="mt-2 flex flex-wrap gap-3 font-bold">
                  <Link href="/account/kyc" className="text-msm-blue underline">
                    Completar KYC
                  </Link>
                </div>
              </div>
            ) : null}
            {customerTrust.signedIn && customerTrust.ready ? (
              <p className="mt-3 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm font-semibold text-msm-blue">
                KYC basico enviado. Economia puede revisar comprobante y riesgo antes de liberar entrega.
              </p>
            ) : null}
            {!customerTrust.signedIn ? (
              <p className="mt-3 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-slate-600">
                Puedes hacer el pedido sin iniciar sesion. Recibiras confirmacion por correo electronico.
              </p>
            ) : null}
          </article>

          <article className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="text-lg font-bold">Resumen</h2>
            <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>{summary?.name ?? "Combo familiar basico"}</span>
              <strong>{currency(summary?.price ?? 58)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{summary?.store ?? "Bodega VIP Santiago"}</span>
              <span>{summary ? `${summary.stock} disponibles` : "Producto seleccionado"}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Comision MSM</span>
              <span>Incluida</span>
            </div>
            <div className="flex justify-between border-t border-msm-line pt-3 text-base font-bold">
              <span>Total</span>
              <span>{currency(summary?.price ?? 58)}</span>
            </div>
            </div>
          </article>
        </aside>
      </section>
    </AppShell>
  );
}
