import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { WhatsAppNumberConfig } from "@/components/dashboard/whatsapp-config";
import { WhatsAppCartsTable } from "@/components/dashboard/whatsapp-carts-table";
import { getAllWhatsAppCarts } from "@/server/actions/whatsapp-cart";

export const dynamic = "force-dynamic";

export default async function AdminWhatsAppCartsPage() {
  const carts = await getAllWhatsAppCarts();

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
        <Badge>WhatsApp</Badge>
        <h1 className="mt-3 text-3xl font-bold">Pedidos por WhatsApp</h1>
        <p className="mt-2 text-slate-600">
          Gestiona los pedidos enviados por los clientes a través del carrito de WhatsApp.
        </p>

        <div className="mt-6">
          <WhatsAppNumberConfig />
        </div>

        <div className="mt-6">
          <WhatsAppCartsTable carts={carts} />
        </div>
      </section>
    </AppShell>
  );
}
