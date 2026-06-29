import { AppShell } from "@/components/ui/shell";
import { SellerApplicationForm } from "@/components/forms/seller-application-form";

export default function SellerApplicationPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-4xl px-4 py-8 pb-24">
        <h1 className="text-3xl font-bold">Solicitud vendedor VIP</h1>
        <p className="mt-3 text-slate-600">
          MSM revisa identidad, comunidad, evidencia de producto, zona de entrega, capacidad y acuerdo vendedor.
        </p>
        <SellerApplicationForm />
      </section>
    </AppShell>
  );
}
