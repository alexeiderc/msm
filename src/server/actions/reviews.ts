"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sellerReviewSchema } from "@/lib/validations";
import type { ActionResult } from "@/types/actions";

export async function submitSellerReview(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = sellerReviewSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Calificacion invalida." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Debes iniciar sesion para calificar al vendedor." };
  }

  if (parsed.data.orderId) {
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("customer_id,seller_id,status")
      .eq("id", parsed.data.orderId)
      .maybeSingle();

    if (orderError) {
      return { ok: false, message: orderError.message };
    }

    if (!order || order.customer_id !== user.id || order.seller_id !== parsed.data.sellerId) {
      return { ok: false, message: "La orden no coincide con tu cuenta y vendedor." };
    }
  }

  const { data, error } = await admin
    .from("reviews")
    .insert({
      seller_id: parsed.data.sellerId,
      order_id: parsed.data.orderId || null,
      compliance: parsed.data.compliance,
      quality: parsed.data.quality,
      attention: parsed.data.attention,
      comment: parsed.data.comment || null
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: "seller_review.create",
    entity: "reviews",
    entity_id: data.id,
    after: {
      sellerId: parsed.data.sellerId,
      orderId: parsed.data.orderId || null,
      compliance: parsed.data.compliance,
      quality: parsed.data.quality,
      attention: parsed.data.attention
    }
  });

  revalidatePath("/orders");
  revalidatePath("/verified-sellers");
  return { ok: true, message: "Calificacion guardada. Gracias por ayudar a medir la confianza VIP." };
}
