import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, CreditCard, Heart, MapPin, Package, RotateCcw, Truck } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { currency } from "@/lib/utils";
import { OrderReviewForm } from "@/components/reviews/order-review-form";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  pendiente_pago: "Pendiente de pago",
  pago_confirmado: "Pago confirmado",
  asignada_vip: "Asignada a VIP",
  confirmada_vip: "VIP confirmo disponibilidad",
  preparando: "En preparacion",
  en_ruta: "En ruta de entrega",
  entregada: "Entregada",
  cerrada: "Cerrada",
  incidencia: "Incidencia",
  cancelada: "Cancelada"
};

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AppShell>
        <section className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-2xl font-bold">Inicia sesion para ver esta orden.</h1>
          <Link href="/auth/login" className="mt-4 inline-flex text-msm-blue underline">Iniciar sesion</Link>
        </section>
      </AppShell>
    );
  }

  const { data: order } = await admin
    .from("orders")
    .select("id,order_number,status,subtotal,msm_commission,gateway_commission,seller_net,receiver_full_name,receiver_phone,address,references,delivery_window,note,payment_country,payment_currency,payment_method_id,payment_account_id,customer_risk_level,delivery_otp_required,delivery_otp_verified_at,vip_delivery_unlocked_at,created_at,updated_at,payment_methods(type,country,currency,visible_instructions),payment_accounts(visible_name)")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) notFound();

  const { data: events } = await admin
    .from("order_events")
    .select("status,note,created_at,actor_id")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  const { data: items } = await admin
    .from("order_items")
    .select("name,quantity,unit_price,total,product_id")
    .eq("order_id", orderId);

  const method = Array.isArray(order.payment_methods) ? order.payment_methods[0] : order.payment_methods;
  const account = Array.isArray(order.payment_accounts) ? order.payment_accounts[0] : order.payment_accounts;
  const canReview = order.status === "entregada" || order.status === "cerrada";

  return (
    <AppShell>
      <section className="mx-auto max-w-4xl px-4 py-8 pb-24">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-bold text-msm-blue">
          <ArrowLeft size={16} /> Volver a ordenes
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{order.order_number}</h1>
            <p className="mt-1 text-slate-600">Creada el {new Date(order.created_at).toLocaleDateString("es-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          <Badge>{statusLabels[order.status] ?? order.status}</Badge>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="grid gap-5">
            <article className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
              <h2 className="flex items-center gap-2 font-bold"><Package size={18} /> Productos</h2>
              <div className="mt-3 grid gap-2">
                {items?.length ? items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm">
                    <span className="font-semibold">{item.name} x{item.quantity}</span>
                    <span>{currency(Number(item.total))}</span>
                  </div>
                )) : <p className="text-sm text-slate-600">Sin items registrados.</p>}
                <div className="border-t border-msm-line pt-3 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{currency(Number(order.subtotal))}</span></div>
                  <div className="flex justify-between"><span>Comision MSM</span><span>-{currency(Number(order.msm_commission))}</span></div>
                  <div className="flex justify-between font-bold"><span>Neto vendedor</span><span>{currency(Number(order.seller_net))}</span></div>
                </div>
              </div>
            </article>

            <article className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
              <h2 className="flex items-center gap-2 font-bold"><MapPin size={18} /> Datos de entrega</h2>
              <div className="mt-3 grid gap-2 text-sm">
                <p><span className="font-semibold">Receptor:</span> {order.receiver_full_name}</p>
                <p><span className="font-semibold">Telefono:</span> {order.receiver_phone}</p>
                <p><span className="font-semibold">Direccion:</span> {order.address}</p>
                {order.references ? <p><span className="font-semibold">Referencias:</span> {order.references}</p> : null}
                <p><span className="font-semibold">Horario:</span> {order.delivery_window}</p>
                {order.note ? <p><span className="font-semibold">Nota:</span> {order.note}</p> : null}
              </div>
            </article>

            <article className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
              <h2 className="flex items-center gap-2 font-bold"><Clock size={18} /> Timeline de eventos</h2>
              <div className="mt-3 grid gap-3">
                {events?.length ? events.map((event, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-msm-blue" />
                    <div>
                      <p className="font-semibold">{statusLabels[event.status] ?? event.status}</p>
                      {event.note ? <p className="text-slate-600">{event.note}</p> : null}
                      <p className="text-xs text-slate-400">{new Date(event.created_at).toLocaleString("es-US")}</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-600">Sin eventos registrados.</p>}
              </div>
            </article>

            {canReview && items?.length ? items.map((item) => (
              <article key={item.product_id} className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
                <h2 className="flex items-center gap-2 font-bold"><Heart size={18} /> Reseña</h2>
                <div className="mt-3">
                  <OrderReviewForm productId={item.product_id} productName={item.name} orderId={orderId} />
                </div>
              </article>
            )) : null}
          </div>

          <div className="grid gap-4">
            <article className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
              <h2 className="flex items-center gap-2 font-bold"><CreditCard size={18} /> Pago</h2>
              <div className="mt-3 grid gap-2 text-sm">
                <p><span className="font-semibold">Metodo:</span> {method ? `${method.type} - ${method.country} / ${method.currency}` : "Pendiente"}</p>
                <p><span className="font-semibold">Cuenta:</span> {account?.visible_name ?? "Pendiente"}</p>
                <p><span className="font-semibold">Pais:</span> {order.payment_country ?? "N/A"}</p>
                <p><span className="font-semibold">Moneda:</span> {order.payment_currency ?? "N/A"}</p>
                {order.vip_delivery_unlocked_at ? (
                  <p className="mt-2 rounded-md bg-green-50 p-2 text-xs text-green-700">
                    Entrega desbloqueada: {new Date(order.vip_delivery_unlocked_at).toLocaleString("es-US")}
                  </p>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/ordenes/${orderId}/comprobante`} className="rounded-md border border-msm-line px-3 py-2 text-xs font-bold">
                  Subir comprobante
                </Link>
                <Link href={`/support?orderId=${orderId}`} className="rounded-md border border-msm-line px-3 py-2 text-xs font-bold">
                  Abrir soporte
                </Link>
              </div>
            </article>

            {canReview ? (
              <article className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
                <h2 className="flex items-center gap-2 font-bold"><RotateCcw size={18} /> Devolucion</h2>
                <p className="mt-2 text-sm text-slate-600">¿No estas conforme? Puedes solicitar una devolucion.</p>
                <Link
                  href={`/orders/${orderId}/return`}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-msm-blue px-3 py-2 text-xs font-bold text-white"
                >
                  <RotateCcw size={14} /> Solicitar devolucion
                </Link>
              </article>
            ) : null}

            <article className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
              <h2 className="flex items-center gap-2 font-bold"><Truck size={18} /> Entrega</h2>
              <div className="mt-3 grid gap-2 text-sm">
                <p><span className="font-semibold">Estado:</span> {statusLabels[order.status] ?? order.status}</p>
                {order.delivery_otp_required ? (
                  <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-700">
                    Se requiere codigo OTP para confirmar entrega.
                    {order.delivery_otp_verified_at ? " Verificado." : ""}
                  </p>
                ) : null}
              </div>
            </article>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
