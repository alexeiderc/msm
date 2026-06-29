import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { SellerReviewForm } from "@/components/forms/seller-review-form";

export default async function NewReviewPage({
  searchParams
}: {
  searchParams: Promise<{ sellerId?: string; orderId?: string }>;
}) {
  const params = await searchParams;

  return (
    <AppShell>
      <section className="mx-auto grid max-w-3xl gap-5 px-4 py-6 pb-24">
        <div>
          <Badge>Confianza VIP</Badge>
          <h1 className="mt-3 text-3xl font-bold">Calificar experiencia de compra</h1>
          <p className="mt-2 text-slate-600">
            Las calificaciones alimentan reputacion por cumplimiento, calidad y atencion del vendedor.
          </p>
        </div>
        <SellerReviewForm sellerId={params.sellerId} orderId={params.orderId} />
      </section>
    </AppShell>
  );
}
