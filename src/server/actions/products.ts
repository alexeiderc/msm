"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { productSchema, stockUpdateSchema } from "@/lib/validations";
import type { ActionResult } from "@/types/actions";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function parseCsv(value?: string | null) {
  return (value ?? "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function createVipProduct(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = productSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Producto invalido." };
  }

  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "Inicia sesion como vendedor VIP para guardar productos." };
    }

    const { data: seller } = await admin
      .from("sellers")
      .select("id,status")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!seller) {
      return { ok: false, message: "No encontramos un vendedor VIP enlazado a tu usuario." };
    }

    if (seller.status !== "aprobado") {
      return { ok: false, message: "Tu cuenta VIP debe estar aprobada antes de publicar productos." };
    }

    const { data: store } = await admin
      .from("stores")
      .select("id,province,municipality,delivery_zones,status,is_active")
      .eq("seller_id", seller.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!store) {
      return { ok: false, message: "Este vendedor aun no tiene tienda creada." };
    }

    let categoryId = parsed.data.categoryId || "";

    if (!categoryId && parsed.data.categorySlug) {
      const { data: category } = await admin
        .from("categories")
        .select("id")
        .eq("slug", parsed.data.categorySlug)
        .maybeSingle();
      categoryId = category?.id ?? "";
    }

    if (!categoryId) {
      return { ok: false, message: "Selecciona una categoria valida." };
    }

    const province = parsed.data.province || store.province || "";
    const municipality = parsed.data.municipality || store.municipality || "";
    const deliveryZone = parsed.data.deliveryZone || store.delivery_zones?.[0] || "";
    const publishable = Boolean(
      parsed.data.isActive === "on" &&
      parsed.data.status === "activo" &&
      province &&
      municipality &&
      store.status === "activo" &&
      store.is_active
    );

    const { data: product, error } = await admin
      .from("products")
      .insert({
        store_id: store.id,
        category_id: categoryId,
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        description: parsed.data.description || parsed.data.deliveryNotes || null,
        price: parsed.data.price,
        currency: parsed.data.currency,
        subcategory: parsed.data.subcategory || null,
        province: province || null,
        municipality: municipality || null,
        delivery_zone: deliveryZone || null,
        warranty: parsed.data.warranty || null,
        availability: parsed.data.availability || null,
        stock: parsed.data.stock,
        promised_sla: parsed.data.promisedSla,
        status: publishable ? "activo" : "borrador",
        featured: parsed.data.featured === "on",
        internal_notes: parsed.data.internalNotes || null,
        is_active: publishable
      })
      .select("id")
      .single();

    if (error) {
      return { ok: false, message: error.message };
    }

    if (parsed.data.imageUrl) {
      await admin.from("product_images").insert({
        product_id: product.id,
        url: parsed.data.imageUrl,
        alt: parsed.data.name,
        position: 0
      });
    }

    const galleryUrls = parseCsv(parsed.data.galleryUrls);
    if (galleryUrls.length) {
      await admin.from("product_images").insert(
        galleryUrls.map((url, index) => ({
          product_id: product.id,
          url,
          alt: parsed.data.name,
          position: index + 1
        }))
      );
    }

    await admin.from("audit_logs").insert({
      actor_id: user.id,
      action: "product.create",
      entity: "products",
      entity_id: product.id,
      after: {
        name: parsed.data.name,
        stock: parsed.data.stock,
        price: parsed.data.price,
        isActive: publishable,
        province,
        municipality,
        status: publishable ? "activo" : "borrador"
      }
    });

    revalidatePath("/dashboard/vip");
    revalidatePath("/products");
    return {
      ok: true,
      message: publishable
        ? "Producto publicado y conectado a la tienda VIP."
        : "Producto guardado como borrador porque falta ubicacion, tienda activa o estado activo.",
      id: product.id
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo guardar el producto." };
  }
}

export async function updateProductStock(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = stockUpdateSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Stock invalido." };
  }

  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "Sesion requerida." };
    }

    const { error } = await admin
      .from("products")
      .update({ stock: parsed.data.stock, updated_at: new Date().toISOString() })
      .eq("id", parsed.data.productId);

    if (error) {
      return { ok: false, message: error.message };
    }

    await admin.from("audit_logs").insert({
      actor_id: user.id,
      action: "product.stock_update",
      entity: "products",
      entity_id: parsed.data.productId,
      after: { stock: parsed.data.stock }
    });

    revalidatePath("/dashboard/vip");
    revalidatePath("/products");
    return { ok: true, message: "Stock actualizado." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo actualizar el stock." };
  }
}

export async function toggleProductActive(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const productId = formData.get("productId") as string;
  if (!productId) return { ok: false, message: "ID de producto requerido." };

  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "Sesion requerida." };

    const { data: product } = await admin
      .from("products")
      .select("is_active,status")
      .eq("id", productId)
      .maybeSingle();

    if (!product) return { ok: false, message: "Producto no encontrado." };

    const newIsActive = !product.is_active;
    const { error } = await admin
      .from("products")
      .update({
        is_active: newIsActive,
        status: newIsActive ? "activo" : "pausado",
        updated_at: new Date().toISOString()
      })
      .eq("id", productId);

    if (error) return { ok: false, message: error.message };

    await admin.from("audit_logs").insert({
      actor_id: user.id,
      action: "product.toggle_active",
      entity: "products",
      entity_id: productId,
      after: { is_active: newIsActive, status: newIsActive ? "activo" : "pausado" }
    });

    revalidatePath("/dashboard/vip");
    revalidatePath("/products");
    return { ok: true, message: newIsActive ? "Producto activado." : "Producto desactivado." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo actualizar el producto." };
  }
}

export async function updateVipProduct(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const productId = formData.get("productId") as string;
  if (!productId) return { ok: false, message: "ID de producto requerido." };

  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "Sesion requerida." };

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const price = formData.get("price");
    const name = formData.get("name");
    const description = formData.get("description");
    const stock = formData.get("stock");

    if (price) updates.price = Number(price);
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (stock) updates.stock = Number(stock);

    if (Object.keys(updates).length <= 1) return { ok: false, message: "No hay campos para actualizar." };

    const { error } = await admin.from("products").update(updates).eq("id", productId);
    if (error) return { ok: false, message: error.message };

    await admin.from("audit_logs").insert({
      actor_id: user.id,
      action: "product.update",
      entity: "products",
      entity_id: productId,
      after: updates
    });

    revalidatePath("/dashboard/vip");
    revalidatePath("/products");
    return { ok: true, message: "Producto actualizado." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo actualizar el producto." };
  }
}
