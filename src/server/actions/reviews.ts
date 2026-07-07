"use server";

import { revalidatePath } from "next/cache";
import { productReviewSchema, sellerReviewSchema } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";

/* ---- Seller Reviews (original) ---- */

export async function submitSellerReview(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = sellerReviewSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "Sesion requerida." };

    const admin = createAdminClient();
    const { error } = await admin.from("reviews").insert({
      seller_id: parsed.data.sellerId,
      order_id: parsed.data.orderId || null,
      customer_id: user.id,
      compliance: parsed.data.compliance,
      quality: parsed.data.quality,
      attention: parsed.data.attention,
      comment: parsed.data.comment || null
    });

    if (error) return { ok: false, message: error.message };
    revalidatePath("/products");
    return { ok: true, message: "Reseña enviada. Gracias por tu opinion." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error." };
  }
}

/* ---- Product Reviews (new) ---- */

export async function submitProductReview(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = productReviewSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "Sesion requerida." };

    const admin = createAdminClient();
    const images = parsed.data.images ? parsed.data.images.split("\n").filter(Boolean) : [];

    await admin.from("product_reviews").insert({
      product_id: parsed.data.productId,
      order_id: parsed.data.orderId,
      customer_id: user.id,
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      comment: parsed.data.comment || null,
      images: images.length ? images : null,
      is_verified_purchase: true
    });

    revalidatePath(`/products/${parsed.data.productId}`);
    return { ok: true, message: "Reseña enviada. Pendiente de aprobacion." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al enviar reseña." };
  }
}

export async function moderateReview(id: string, isApproved: boolean): Promise<ActionResult> {
  try {
    const admin = createAdminClient();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await admin.from("product_reviews").update({
      is_approved: isApproved,
      moderated_by: user?.id,
      moderated_at: new Date().toISOString()
    }).eq("id", id);

    revalidatePath("/dashboard/admin/reviews");
    return { ok: true, message: isApproved ? "Reseña aprobada." : "Reseña rechazada." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error." };
  }
}

export async function getProductReviews(productId: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("product_reviews")
      .select("*, profiles!inner(full_name)")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(20);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getProductRating(productId: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("product_reviews")
      .select("rating")
      .eq("product_id", productId)
      .eq("is_approved", true);
    if (!data?.length) return { average: 0, count: 0 };
    const sum = data.reduce((a, b) => a + b.rating, 0);
    return { average: Number((sum / data.length).toFixed(1)), count: data.length };
  } catch {
    return { average: 0, count: 0 };
  }
}
