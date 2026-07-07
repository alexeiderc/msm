"use server";

import { revalidatePath } from "next/cache";
import { couponSchema } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";

export async function createCoupon(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = couponSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };

  try {
    const admin = createAdminClient();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "Sesion requerida." };

    const { error } = await admin.from("coupons").insert({
      code: parsed.data.code,
      description: parsed.data.description || null,
      discount_type: parsed.data.discountType,
      discount_value: parsed.data.discountValue,
      min_order_amount: parsed.data.minOrderAmount,
      max_uses: parsed.data.maxUses,
      starts_at: parsed.data.startsAt || null,
      expires_at: parsed.data.expiresAt || null,
      created_by: user.id
    });

    if (error) return { ok: false, message: error.message };
    revalidatePath("/dashboard/admin/coupons");
    return { ok: true, message: `Cupon ${parsed.data.code} creado.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al crear cupon." };
  }
}

export async function toggleCoupon(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("coupons").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return { ok: false, message: error.message };
    revalidatePath("/dashboard/admin/coupons");
    return { ok: true, message: isActive ? "Cupon activado." : "Cupon desactivado." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error." };
  }
}

export async function validateCoupon(code: string, subtotal: number) {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (!data) return { ok: false, message: "Cupon no encontrado." };
    if (data.expires_at && new Date(data.expires_at) < new Date()) return { ok: false, message: "Cupon expirado." };
    if (data.starts_at && new Date(data.starts_at) > new Date()) return { ok: false, message: "Cupon aun no disponible." };
    if (data.max_uses > 0 && data.used_count >= data.max_uses) return { ok: false, message: "Cupon agotado." };
    if (subtotal < Number(data.min_order_amount)) return { ok: false, message: `Minimo de compra $${Number(data.min_order_amount).toFixed(2)}.` };

    let discount = data.discount_type === "percentage"
      ? subtotal * (Number(data.discount_value) / 100)
      : Number(data.discount_value);
    discount = Math.min(discount, subtotal);

    return { ok: true, coupon: data, discount };
  } catch {
    return { ok: false, message: "Error al validar cupon." };
  }
}
