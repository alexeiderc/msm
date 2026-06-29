"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sellerApplicationSchema } from "@/lib/validations";
import type { ActionResult } from "@/types/actions";

const sellerAgreementText =
  "El vendedor VIP declara que es responsable por veracidad, disponibilidad, precio, entrega, calidad, garantia, evidencia de entrega, tiempos de respuesta y cumplimiento. MSM cobra comision, organiza la plataforma, controla pagos y puede suspender al vendedor por fraude, incumplimiento, reclamaciones repetidas o datos falsos.";

export async function submitSellerApplication(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = sellerApplicationSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Solicitud invalida." };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("seller_applications").insert({
    profile_id: user?.id,
    full_name: parsed.data.fullName,
    phone: parsed.data.phone,
    country: parsed.data.country,
    province: parsed.data.province,
    municipality: parsed.data.municipality,
    origin_community: parsed.data.originCommunity,
    contact_handle: parsed.data.contactHandle,
    categories: parsed.data.categories.split(",").map((item) => item.trim()).filter(Boolean),
    video_url: parsed.data.videoUrl || null,
    product_photo_urls: parsed.data.productPhotoUrls
      ? parsed.data.productPhotoUrls.split(",").map((item) => item.trim()).filter(Boolean)
      : [],
    delivery_zone: parsed.data.deliveryZone,
    weekly_hours: parsed.data.weeklyHours,
    daily_capacity: parsed.data.dailyCapacity,
    offered_warranty: parsed.data.offeredWarranty,
    agreement_accepted: true
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/vendedores/solicitud");
  revalidatePath("/dashboard/admin");
  return { ok: true, message: "Solicitud VIP enviada para revision de MSM." };
}

export async function acceptSellerAgreement(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const version = String(formData.get("version") ?? "vip-2026-06");
  const sellerId = String(formData.get("sellerId") ?? "") || null;
  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesion requerida." };

  const { error } = await admin.from("seller_agreements").insert({
    seller_id: sellerId,
    user_id: user.id,
    version,
    agreement_text: sellerAgreementText
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: "seller_agreement.accept",
    entity: "seller_agreements",
    entity_id: sellerId,
    after: { version }
  });

  revalidatePath("/dashboard/vip");
  return { ok: true, message: "Acuerdo VIP aceptado y guardado." };
}
