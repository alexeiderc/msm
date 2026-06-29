import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/ui/shell";

export default function CartPage() {
  return (
    <AppShell>
      <section className="mx-auto grid max-w-4xl gap-5 px-4 py-6 pb-24">
        <div className="flex items-center gap-2">
          <ShoppingBag className="text-msm-blue" size={24} />
          <h1 className="text-3xl font-bold">Carrito y compra</h1>
        </div>

        <article className="rounded-lg border border-msm-line bg-white p-6 shadow-soft">
          <h2 className="text-xl font-bold">Flujo MVP activo</h2>
          <p className="mt-3 leading-7 text-slate-600">
            En esta version, cada compra se crea como una orden auditada desde un producto o desde checkout.
            Esto permite asignar cuenta de pago, revisar comprobante, activar al VIP, registrar evidencia,
            ledger y payout sin mezclar productos de distintos vendedores en una misma orden.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-msm-blue px-4 text-sm font-semibold text-white"
            >
              Elegir producto
            </Link>
            <Link
              href="/checkout"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-msm-line px-4 text-sm font-semibold"
            >
              Crear orden directa
            </Link>
          </div>
        </article>

        <article className="rounded-lg border border-msm-line bg-msm-ink p-6 text-white">
          <h2 className="text-lg font-bold">Siguiente fase del carrito</h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            Para produccion avanzada, el carrito persistente debe agrupar productos por vendedor VIP,
            zona de entrega y cuenta de pago asignada, evitando mezclar entregas incompatibles.
          </p>
        </article>
      </section>
    </AppShell>
  );
}
