import Link from "next/link";
import { ClipboardList, Search } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getCustomerOrders() {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return [];

    const admin = createAdminClient();
    const { data } = await admin
      .from("orders")
      .select("id,order_number,status,receiver_full_name,created_at,payment_method_id,payment_account_id,payment_methods(type,country,currency,visible_instructions),payment_accounts(visible_name)")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    return data ?? [];
  } catch {
    return [];
  }
}

export default async function OrdersPage() {
  const orders = await getCustomerOrders();

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-8 pb-24">
        <Badge>Seguimiento</Badge>
        <div className="mt-3 flex items-center gap-2">
          <ClipboardList className="text-msm-blue" size={26} />
          <h1 className="text-3xl font-bold">Ordenes MSM my store</h1>
        </div>
        <p className="mt-3 text-slate-600">
          Consulta estado de pago, asignacion VIP, entrega, evidencia, soporte y cierre auditable.
        </p>
        <label className="relative mt-6 block">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <Input className="pl-10" placeholder="Buscar por numero de orden, telefono o receptor" />
        </label>
        <div className="mt-5 grid gap-3">
          {orders.length ? orders.map((order) => (
            <article key={order.id} className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-bold">{order.order_number}</p>
                  <p className="mt-1 text-sm text-slate-600">Receptor: {order.receiver_full_name}</p>
                  {(() => {
                    const row = order as typeof order & {
                      payment_methods?: { type?: string; country?: string; currency?: string; visible_instructions?: string } | { type?: string; country?: string; currency?: string; visible_instructions?: string }[];
                      payment_accounts?: { visible_name?: string } | { visible_name?: string }[];
                    };
                    const method = Array.isArray(row.payment_methods) ? row.payment_methods[0] : row.payment_methods;
                    const account = Array.isArray(row.payment_accounts) ? row.payment_accounts[0] : row.payment_accounts;

                    return (
                      <div className="mt-2 rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                        <p className="font-semibold text-slate-800">Pago asignado dentro de esta orden</p>
                        <p>Metodo: {method?.type ?? "Pendiente"} {method?.country ? `- ${method.country}` : ""} {method?.currency ? `(${method.currency})` : ""}</p>
                        <p>Cuenta: {account?.visible_name ?? "Pendiente de asignacion"}</p>
                        <p>ID metodo: {order.payment_method_id ?? "N/A"}</p>
                        <p>ID cuenta: {order.payment_account_id ?? "N/A"}</p>
                        {method?.visible_instructions ? <p>{method.visible_instructions}</p> : null}
                      </div>
                    );
                  })()}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{order.status}</Badge>
                  <Link
                    href={`/orders/${order.id}`}
                    className="rounded-md border border-msm-line px-3 py-2 text-sm font-semibold"
                  >
                    Detalle
                  </Link>
                  <Link
                    href={`/ordenes/${order.id}/comprobante`}
                    className="rounded-md border border-msm-line px-3 py-2 text-sm font-semibold"
                  >
                    Comprobante
                  </Link>
                </div>
              </div>
            </article>
          )) : (
            <article className="rounded-lg border border-msm-line bg-white p-4 text-sm text-slate-600 shadow-soft">
              Inicia sesion y crea una orden para verla aqui con su estado real.
            </article>
          )}
        </div>
      </section>
    </AppShell>
  );
}
