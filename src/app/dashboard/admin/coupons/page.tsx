import Link from "next/link";
import { Plus, Tags } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CouponForm } from "@/components/dashboard/coupon-form";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getCoupons() {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("coupons").select("*").order("created_at", { ascending: false });
    return data ?? [];
  } catch { return []; }
}

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
      <Badge>Administracion</Badge>
      <h1 className="mt-3 text-3xl font-bold">Cupones y descuentos</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Plus size={18} /> Nuevo cupon</h2>
          <CouponForm />
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Tags size={18} /> Cupones ({coupons.length})</h2>
          <div className="mt-4 space-y-3">
            {coupons.length === 0 && <p className="text-sm text-slate-500">Sin cupones creados.</p>}
            {coupons.map((coupon: { id: string; code: string; description: string | null; discount_type: string; discount_value: number; min_order_amount: number | null; max_uses: number; used_count: number; is_active: boolean; expires_at: string | null }) => (
              <div key={coupon.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold font-mono">{coupon.code}</p>
                  <Badge>{coupon.is_active ? "Activo" : "Inactivo"}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{coupon.description ?? "Sin descripcion"}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>{coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}</span>
                  <span>Min: ${Number(coupon.min_order_amount ?? 0).toFixed(2)}</span>
                  <span>Usos: {coupon.used_count}/{coupon.max_uses}</span>
                  {coupon.expires_at && <span>Expira: {new Date(coupon.expires_at).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
