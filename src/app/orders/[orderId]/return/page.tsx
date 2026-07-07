import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ReturnRequestForm } from "@/components/reviews/return-request-form";

export const dynamic = "force-dynamic";

export default async function ReturnPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=" + encodeURIComponent(`/orders/${orderId}/return`));
  }

  const { data: order } = await admin
    .from("orders")
    .select("id,order_number,status,created_at")
    .eq("id", orderId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!order) notFound();

  const allowed = order.status === "entregada" || order.status === "cerrada";
  if (!allowed) {
    return (
      <AppShell>
        <section className="mx-auto max-w-2xl px-4 py-12">
          <h1 className="text-2xl font-bold">Devolucion no disponible</h1>
          <p className="mt-2 text-slate-600">
            Solo puedes solicitar devolucion para ordenes entregadas o cerradas.
          </p>
          <Link href={`/orders/${orderId}`} className="mt-4 inline-flex text-msm-blue underline">
            Volver a la orden
          </Link>
        </section>
      </AppShell>
    );
  }

  const { data: items } = await admin
    .from("order_items")
    .select("id,name,quantity,product_id")
    .eq("order_id", orderId);

  return (
    <AppShell>
      <section className="mx-auto max-w-2xl px-4 py-8 pb-24">
        <Link href={`/orders/${orderId}`} className="inline-flex items-center gap-2 text-sm font-bold text-msm-blue">
          <ArrowLeft size={16} /> Volver a orden {order.order_number}
        </Link>

        <div className="mt-4 flex items-center gap-2">
          <RotateCcw size={22} className="text-msm-blue" />
          <h1 className="text-2xl font-bold">Solicitar devolucion</h1>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Orden {order.order_number} &middot; Creada {new Date(order.created_at).toLocaleDateString("es-US")}
        </p>

        <div className="mt-6 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
          <ReturnRequestForm orderId={orderId} items={items ?? []} />
        </div>
      </section>
    </AppShell>
  );
}
