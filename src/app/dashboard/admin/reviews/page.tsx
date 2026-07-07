import { Badge } from "@/components/ui/badge";
import { ReviewModerationForm } from "@/components/dashboard/review-moderation-form";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ReviewRow = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  profiles: { full_name: string } | { full_name: string }[];
  products: { name: string } | { name: string }[];
};

async function getPendingReviews(): Promise<ReviewRow[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("product_reviews")
      .select("*, profiles!inner(full_name), products!inner(name)")
      .eq("is_approved", false)
      .order("created_at", { ascending: false });
    return (data ?? []) as unknown as ReviewRow[];
  } catch { return []; }
}

async function getApprovedReviews(): Promise<ReviewRow[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("product_reviews")
      .select("*, profiles!inner(full_name), products!inner(name)")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(20);
    return (data ?? []) as unknown as ReviewRow[];
  } catch { return []; }
}

function Stars({ rating }: { rating: number }) {
  return <span className="text-amber-500">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>;
}

export default async function ReviewsPage() {
  const [pending, approved] = await Promise.all([getPendingReviews(), getApprovedReviews()]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
      <Badge>Administracion</Badge>
      <h1 className="mt-3 text-3xl font-bold">Reseñas de productos</h1>

      <div className="mt-6">
        <h2 className="text-lg font-bold mb-3">Pendientes ({pending.length})</h2>
        <div className="space-y-3">
          {pending.map((r) => {
            const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
            const product = Array.isArray(r.products) ? r.products[0] : r.products;
            return (
              <div key={r.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">{product?.name}</p>
                    <p className="text-sm text-slate-500">{profile?.full_name}</p>
                  </div>
                  <Stars rating={r.rating} />
                </div>
                {r.title && <p className="mt-2 text-sm font-semibold">{r.title}</p>}
                {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
                <div className="mt-3"><ReviewModerationForm reviewId={r.id} /></div>
              </div>
            );
          })}
          {pending.length === 0 && <p className="text-slate-500">Sin reseñas pendientes.</p>}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold mb-3">Aprobadas ({approved.length})</h2>
        <div className="space-y-2">
          {approved.map((r) => {
            const product = Array.isArray(r.products) ? r.products[0] : r.products;
            return (
              <div key={r.id} className="rounded border bg-white p-3 text-sm">
                <p className="font-medium">{product?.name} — <Stars rating={r.rating} /></p>
                {r.comment && <p className="text-slate-600">{r.comment}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
