"use server";

import { revalidatePath } from "next/cache";
import { inventoryAdjustmentSchema } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";

export async function adjustInventory(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = inventoryAdjustmentSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };

  try {
    const admin = createAdminClient();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "Sesion requerida." };

    const { data: product } = await admin
      .from("products")
      .select("id,stock,store_id,name")
      .eq("id", parsed.data.productId)
      .maybeSingle();

    if (!product) return { ok: false, message: "Producto no encontrado." };

    const stockBefore = Number(product.stock);
    const stockAfter = Math.max(stockBefore + parsed.data.quantityChange, 0);

    const { error: updateError } = await admin
      .from("products")
      .update({ stock: stockAfter, last_inventory_update: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", parsed.data.productId);

    if (updateError) return { ok: false, message: updateError.message };

    await admin.from("inventory_transactions").insert({
      product_id: parsed.data.productId,
      store_id: product.store_id,
      quantity_change: parsed.data.quantityChange,
      stock_before: stockBefore,
      stock_after: stockAfter,
      reason: parsed.data.reason,
      note: parsed.data.note || null,
      created_by: user.id
    });

    const threshold = (product as unknown as { low_stock_threshold?: number }).low_stock_threshold ?? 5;
    if (stockAfter <= threshold) {
      await admin.from("notifications").insert({
        user_id: user.id,
        title: "Stock bajo",
        body: `${product.name} tiene ${stockAfter} unidades.`,
        type: "inventory_alert"
      });
    }

    revalidatePath("/dashboard/admin/inventory");
    revalidatePath("/products");
    return { ok: true, message: `Stock de ${product.name} actualizado: ${stockBefore} → ${stockAfter}.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error." };
  }
}

export async function getLowStockProducts() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("products")
      .select("id,name,slug,stock,low_stock_threshold,stores(name)")
      .eq("is_active", true)
      .order("stock", { ascending: true })
      .limit(20);
    return data ?? [];
  } catch {
    return [];
  }
}
