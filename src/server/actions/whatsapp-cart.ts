"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { findFallbackProduct } from "@/lib/public-products";
import {
  buildWaMeLink,
  buildWhatsAppOrderMessage,
  type WhatsAppOrderInput,
  type WhatsAppOrderItem,
} from "@/lib/whatsapp-order";

export type WhatsAppCartInput = WhatsAppOrderInput;

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id
  );
}

function assertBasicInput(input: WhatsAppCartInput) {
  if (!input.items?.length) {
    throw new Error("El pedido no tiene productos");
  }
  if (!input.customerName?.trim()) {
    throw new Error("El nombre del cliente es obligatorio");
  }
  if (!input.customerPhone?.trim()) {
    throw new Error("El teléfono de contacto es obligatorio");
  }
  const phoneDigits = input.customerPhone.replace(/\D/g, "");
  if (phoneDigits.length < 8) {
    throw new Error("El teléfono de contacto no es válido");
  }
  if (!input.deliveryAddress?.trim()) {
    throw new Error("La dirección de entrega es obligatoria");
  }
  if (!input.deliveryProvince?.trim()) {
    throw new Error("La provincia es obligatoria");
  }
  if (!input.deliveryMunicipality?.trim()) {
    throw new Error("El municipio es obligatorio");
  }
}

/**
 * Resolve trusted item data:
 * - UUID → load from products table (price/name/store from DB)
 * - otherwise → fallback catalog by slug/id
 * - last resort → client payload (demo only)
 */
async function resolveItems(
  items: WhatsAppOrderItem[]
): Promise<WhatsAppOrderItem[]> {
  const admin = createAdminClient();
  const resolved: WhatsAppOrderItem[] = [];

  for (const item of items) {
    const qty = Math.max(1, Math.min(20, Math.floor(Number(item.quantity) || 1)));

    if (isUuid(item.productId)) {
      try {
        const { data } = await admin
          .from("products")
          .select(
            "id,name,slug,price,currency,stock,is_active,status,stores(name,status,is_active)"
          )
          .eq("id", item.productId)
          .maybeSingle();

        if (data) {
          const row = data as unknown as {
            id: string;
            name: string;
            slug: string;
            price: number | string;
            currency?: string | null;
            stock: number | string;
            is_active?: boolean;
            status?: string;
            stores?:
              | { name?: string; status?: string; is_active?: boolean }
              | { name?: string; status?: string; is_active?: boolean }[];
          };

          const store = Array.isArray(row.stores) ? row.stores[0] : row.stores;
          const active =
            row.is_active !== false &&
            (row.status == null || row.status === "activo") &&
            (store == null ||
              (store.status !== "pausado" && store.is_active !== false));

          if (active) {
            const stock = Number(row.stock);
            const maxQty = Number.isFinite(stock) && stock > 0 ? stock : 20;
            resolved.push({
              productId: row.id,
              name: row.name,
              price: Number(row.price),
              currency: row.currency ?? "USD",
              quantity: Math.min(qty, maxQty),
              store: store?.name ?? item.store ?? "Tienda VIP",
              slug: row.slug || item.slug,
            });
            continue;
          }
        }
      } catch {
        // fall through to client/fallback data
      }
    }

    // Fallback catalog (demo products)
    const fb =
      findFallbackProduct(item.slug) ||
      findFallbackProduct(item.productId) ||
      null;

    if (fb) {
      const stock = Number(fb.stock);
      const maxQty = Number.isFinite(stock) && stock > 0 ? stock : 20;
      resolved.push({
        productId: fb.id,
        name: fb.name,
        price: Number(fb.price),
        currency: (fb as { currency?: string }).currency ?? "USD",
        quantity: Math.min(qty, maxQty),
        store: fb.store,
        slug: fb.slug,
      });
      continue;
    }

    // Last resort: trust client payload (still clamped)
    const price = Number(item.price);
    if (!item.name?.trim() || !Number.isFinite(price) || price < 0) {
      throw new Error(`Producto inválido: ${item.name || item.productId}`);
    }
    resolved.push({
      productId: item.productId || crypto.randomUUID(),
      name: item.name.trim(),
      price,
      currency: item.currency || "USD",
      quantity: qty,
      store: item.store || "Tienda VIP",
      slug: item.slug || "",
    });
  }

  if (!resolved.length) {
    throw new Error("No se pudieron validar los productos del pedido");
  }

  return resolved;
}

export async function sendWhatsAppCart(input: WhatsAppCartInput) {
  assertBasicInput(input);

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  const admin = createAdminClient();

  let defaultWhatsApp = "";
  try {
    const { data: globalSetting } = await admin
      .from("settings")
      .select("value")
      .eq("key", "whatsapp_number")
      .maybeSingle();

    defaultWhatsApp = globalSetting
      ? (globalSetting.value as { number: string }).number
      : "";
  } catch {
    defaultWhatsApp = "";
  }

  if (!defaultWhatsApp?.trim()) {
    throw new Error(
      "El administrador aún no ha configurado el número de WhatsApp para recibir pedidos. Ve a Admin → Pedidos WhatsApp."
    );
  }

  const trustedItems = await resolveItems(input.items);
  const totalAmount = trustedItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const trustedInput: WhatsAppOrderInput = {
    ...input,
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    customerEmail: input.customerEmail?.trim() || undefined,
    deliveryAddress: input.deliveryAddress.trim(),
    deliveryProvince: input.deliveryProvince.trim(),
    deliveryMunicipality: input.deliveryMunicipality.trim(),
    beneficiaryName: input.beneficiaryName?.trim() || undefined,
    beneficiaryPhone: input.beneficiaryPhone?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    items: trustedItems,
    totalAmount,
  };

  const cartId = crypto.randomUUID();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  // Public tracking URL (works without admin login)
  const adminLink = `${siteUrl}/pedido-whatsapp/${cartId}`;
  const messageBody = buildWhatsAppOrderMessage(trustedInput, adminLink);
  const waMeLink = buildWaMeLink(defaultWhatsApp, messageBody);

  const { error: insertError } = await admin.from("whatsapp_carts").insert({
    id: cartId,
    user_id: userId,
    items: trustedItems,
    customer_name: trustedInput.customerName,
    customer_phone: trustedInput.customerPhone,
    customer_email: trustedInput.customerEmail ?? null,
    delivery_address: trustedInput.deliveryAddress,
    delivery_province: trustedInput.deliveryProvince,
    delivery_municipality: trustedInput.deliveryMunicipality,
    beneficiary_name: trustedInput.beneficiaryName ?? null,
    beneficiary_phone: trustedInput.beneficiaryPhone ?? null,
    total_amount: totalAmount,
    whatsapp_number: defaultWhatsApp,
    status: "enviado",
    admin_link: adminLink,
    admin_notes: messageBody,
  });

  if (insertError) {
    // Common cause: migration 015 not applied
    const hint =
      insertError.message?.includes("whatsapp_carts") ||
      insertError.code === "42P01"
        ? " (¿Aplicaste la migración 015_whatsapp_carts.sql en Supabase?)"
        : "";
    throw new Error("Error al guardar el pedido: " + insertError.message + hint);
  }

  return {
    cartId,
    adminLink,
    waMeLink,
    messageBody,
  };
}

export async function updateWhatsAppCartStatus(
  cartId: string,
  data: {
    status?: string;
    trackingCode?: string;
    feeAmount?: number;
    adminNotes?: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const admin = createAdminClient();
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.status) updateData.status = data.status;
  if (data.trackingCode !== undefined) updateData.tracking_code = data.trackingCode;
  if (data.feeAmount !== undefined) updateData.fee_amount = data.feeAmount;
  if (data.adminNotes !== undefined) updateData.admin_notes = data.adminNotes;

  const { error } = await admin.from("whatsapp_carts").update(updateData).eq("id", cartId);

  if (error) throw new Error("Error al actualizar: " + error.message);

  return { success: true };
}

export async function getWhatsAppCart(cartId: string) {
  if (!cartId?.trim()) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("whatsapp_carts")
    .select("*")
    .eq("id", cartId)
    .maybeSingle();

  if (error || !data) return null;

  // Mark viewed once (best-effort)
  try {
    await admin
      .from("whatsapp_carts")
      .update({ viewed_at: new Date().toISOString() })
      .eq("id", cartId)
      .is("viewed_at", null);
  } catch {
    // ignore
  }

  return data;
}

export async function getUserWhatsAppCarts() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("whatsapp_carts")
    .select("*")
    .eq("user_id", user.id)
    .order("sent_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

export async function getAllWhatsAppCarts() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("whatsapp_carts")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(50);

    return data ?? [];
  } catch {
    return [];
  }
}

export async function saveWhatsAppNumber(number: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: "No autorizado" };

  const cleaned = number.trim();
  if (!cleaned) return { success: false, message: "El número no puede estar vacío" };

  const digits = cleaned.replace(/\D/g, "");
  if (digits.length < 8) {
    return { success: false, message: "Número de WhatsApp inválido" };
  }

  const admin = createAdminClient();

  const { error: upsertError } = await admin.from("settings").upsert(
    {
      key: "whatsapp_number",
      value: { number: cleaned },
      description: "Número de WhatsApp para recibir pedidos del carrito",
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (upsertError) {
    console.error("Upsert error:", upsertError);
    const hint =
      upsertError.message?.includes("settings") || upsertError.code === "42P01"
        ? " Aplica la migración 015_whatsapp_carts.sql en Supabase."
        : "";
    return { success: false, message: upsertError.message + hint };
  }

  return { success: true };
}

export async function getWhatsAppNumber() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("settings")
      .select("value")
      .eq("key", "whatsapp_number")
      .maybeSingle();

    if (!data) return { number: "" };
    return data.value as { number: string };
  } catch {
    return { number: "" };
  }
}
