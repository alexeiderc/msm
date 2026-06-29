import { AppShell } from "@/components/ui/shell";
import { SupportTicketForm } from "@/components/forms/support-ticket-form";

export default async function SupportPage({ searchParams }: { searchParams?: Promise<{ orderId?: string }> }) {
  const params = searchParams ? await searchParams : {};

  return (
    <AppShell>
      <section className="mx-auto max-w-4xl px-4 py-8 pb-24">
        <h1 className="text-3xl font-bold">Soporte y reclamaciones</h1>
        <p className="mt-3 text-slate-600">
          Abre un ticket por orden. Administracion puede asignar responsable, pedir evidencia al VIP y cerrar con resolucion documentada.
        </p>
        <SupportTicketForm orderId={params.orderId} />
      </section>
    </AppShell>
  );
}
