import { notFound } from "next/navigation";
import Link from "next/link";
import { PackageCheck, Truck, Clock, XCircle, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { getWhatsAppCart } from "@/server/actions/whatsapp-cart";

export const dynamic = "force-dynamic";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: typeof PackageCheck }
> = {
  enviado: {
    label: "Enviado",
    color: "border-blue-200 bg-blue-50 text-blue-700",
    icon: Clock,
  },
  procesando: {
    label: "Procesando",
    color: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Truck,
  },
  completado: {
    label: "Completado",
    color: "border-green-200 bg-green-50 text-green-700",
    icon: PackageCheck,
  },
  cancelado: {
    label: "Cancelado",
    color: "border-red-200 bg-red-50 text-red-700",
    icon: XCircle,
  },
};

export default async function PublicWhatsAppOrderPage({
  params,
}: {
  params: Promise<{ cartId: string }>;
}) {
  const { cartId } = await params;
  const cart = await getWhatsAppCart(cartId);
  if (!cart) notFound();

  const row = cart as unknown as {
    id: string;
    items?: Array<{
      name: string;
      price: number;
      quantity: number;
      currency: string;
      store: string;
    }> | null;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    delivery_address?: string;
    delivery_province?: string;
    delivery_municipality?: string;
    beneficiary_name?: string;
    beneficiary_phone?: string;
    total_amount: number | string;
    status: string;
    tracking_code?: string;
    fee_amount?: number | string | null;
    sent_at: string;
  };

  const items = Array.isArray(row.items) ? row.items : [];
  const status = statusConfig[row.status] ?? statusConfig.enviado;
  const StatusIcon = status.icon;
  const itemTotal = items.reduce(
    (sum, i) => sum + Number(i.price) * Number(i.quantity),
    0
  );
  const fee = row.fee_amount != null ? Number(row.fee_amount) : 0;
  const finalTotal = fee ? itemTotal + fee : Number(row.total_amount) || itemTotal;

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-4 py-8 pb-24">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-bold text-msm-blue"
        >
          <ArrowLeft size={16} /> Volver al catálogo
        </Link>

        <Badge className={`mt-4 ${status.color}`}>{status.label}</Badge>
        <h1 className="mt-3 text-3xl font-bold">Pedido #{row.id.slice(0, 8)}</h1>
        <p className="mt-2 text-slate-600">
          Enviado el{" "}
          {new Date(row.sent_at).toLocaleDateString("es-CU", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="flex items-center gap-2 font-bold">
              <StatusIcon size={18} /> Estado del pedido
            </h2>
            <p className="mt-2 text-2xl font-bold capitalize">{row.status}</p>
            {row.tracking_code ? (
              <p className="mt-2 text-sm">
                <span className="font-semibold">Código de rastreo:</span>{" "}
                {row.tracking_code}
              </p>
            ) : null}
          </div>

          <div className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="font-bold">Resumen</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-bold">${itemTotal.toFixed(2)} USD</span>
              </div>
              {fee ? (
                <div className="flex justify-between">
                  <span className="text-slate-600">Fee</span>
                  <span className="font-bold">${fee.toFixed(2)} USD</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-msm-line pt-2 text-base">
                <span className="font-bold">Total</span>
                <span className="font-bold">${finalTotal.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="font-bold">Cliente</h2>
            <div className="mt-3 space-y-1 text-sm">
              <p>
                <span className="font-semibold">Nombre:</span> {row.customer_name}
              </p>
              <p>
                <span className="font-semibold">Teléfono:</span>{" "}
                {row.customer_phone}
              </p>
              {row.customer_email ? (
                <p>
                  <span className="font-semibold">Email:</span> {row.customer_email}
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="font-bold">Entrega</h2>
            <div className="mt-3 space-y-1 text-sm">
              <p>{row.delivery_address}</p>
              <p>
                {row.delivery_municipality}, {row.delivery_province}
              </p>
              {row.beneficiary_name ? (
                <>
                  <p className="mt-2 font-semibold">Beneficiario</p>
                  <p>{row.beneficiary_name}</p>
                  {row.beneficiary_phone ? <p>{row.beneficiary_phone}</p> : null}
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-msm-line bg-white shadow-soft">
          <div className="border-b border-msm-line bg-slate-50 px-4 py-3">
            <h2 className="font-bold">Productos ({items.length})</h2>
          </div>
          {items.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Sin productos registrados</p>
          ) : (
            items.map((item, i) => (
              <div
                key={`${item.name}-${i}`}
                className="flex items-center justify-between border-b border-msm-line px-4 py-3 last:border-0"
              >
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.store} · x{item.quantity}
                  </p>
                </div>
                <p className="font-bold">
                  ${(Number(item.price) * Number(item.quantity)).toFixed(2)}{" "}
                  {item.currency || "USD"}
                </p>
              </div>
            ))
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Si tienes dudas sobre este pedido, escribe al WhatsApp de MSM con el
          código <strong>#{row.id.slice(0, 8)}</strong>.
        </p>
      </section>
    </AppShell>
  );
}
