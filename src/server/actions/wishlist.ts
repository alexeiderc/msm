"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";

export async function toggleWishlist(productId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "Inicia sesion." };

    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("wishlist_items")
      .select("id")
      .eq("profile_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      await admin.from("wishlist_items").delete().eq("id", existing.id);
      revalidatePath("/products");
      return { ok: true, message: "Eliminado de favoritos." };
    }

    await admin.from("wishlist_items").insert({ profile_id: user.id, product_id: productId });
    revalidatePath("/products");
    return { ok: true, message: "Agregado a favoritos." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error." };
  }
}

export async function getWishlist() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const admin = createAdminClient();
    const { data } = await admin
      .from("wishlist_items")
      .select("product_id, products!inner(id,name,slug,price,currency,stock,product_images(url))")
      .eq("profile_id", user.id);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function isInWishlist(productId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const admin = createAdminClient();
    const { data } = await admin
      .from("wishlist_items")
      .select("id")
      .eq("profile_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}
