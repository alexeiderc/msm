import { Badge } from "@/components/ui/badge";
import { ReturnReviewForm } from "@/components/dashboard/return-review-form";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ReturnRow = {
  id: string;
  return_number: string;
  status: string;
  reason: string;
  description: string | null;
  created_at: string;
  profiles: { full_name: string; email: string } | { full_name: string; email: string }[];
  orders: { order_number: string } | { order_number: string }[];
};

async function getReturns(): Promise<ReturnRow[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("returns")
      .select("*, profiles!inner(full_name,email), orders!inner(order_number)")
      .order("created_at", { ascending: false })
      .limit(30);
    return (data ?? []) as unknown as ReturnRow[];
  } catch { return []; }
}

const statusColors: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  aprobado: "bg-green-100 text-green-800",
  rechazado: "bg-red-100 text-red-800",
  en_transito: "bg-blue-100 text-blue-800",
  recibido: "bg-purple-100 text-purple-800",
  reembolsado: "bg-emerald-100 text-emerald-800"
};

export default async function ReturnsPage() {
  const returns = await getReturns();

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
      <Badge>Administracion</Badge>
      <h1 className="mt-3 text-3xl font-bold">Devoluciones y reembolsos</h1>

      <div className="mt-6 space-y-4">
        {returns.map((r) => {
          const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
          const o = Array.isArray(r.orders) ? r.orders[0] : r.orders;

          return (
            <div key={r.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold font-mono">{r.return_number}</p>
                  <p className="text-sm text-slate-500">{p?.full_name ?? ""} — Orden {o?.order_number ?? ""}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColors[r.status] ?? "bg-slate-100"}`}>{r.status}</span>
              </div>
              <p className="mt-2 text-sm"><span className="font-medium">Motivo:</span> {r.reason}</p>
              {r.description && <p className="mt-1 text-sm text-slate-600">{r.description}</p>}
              <div className="mt-3">
                <ReturnReviewForm returnId={r.id} currentStatus={r.status} />
              </div>
            </div>
          );
        })}
        {returns.length === 0 && <p className="text-slate-500">Sin solicitudes de devolucion.</p>}
      </div>
    </section>
  );
}
