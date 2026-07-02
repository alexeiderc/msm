"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sellerKycSchema, sellerKycReviewSchema, sellerApplicationSchema } from "@/lib/validations";
import type { ActionResult } from "@/types/actions";

const adminRoles = new Set(["administrador", "administrador_economico", "superadmin"]);

const sellerAgreementText =
  "El vendedor VIP declara que es responsable por veracidad, disponibilidad, precio, entrega, calidad, garantia, evidencia de entrega, tiempos de respuesta y cumplimiento. MSM cobra comision, organiza la plataforma, controla pagos y puede suspender al vendedor por fraude, incumplimiento, reclamaciones repetidas o datos falsos.";

async function requireAdminActor() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, message: "Sesion requerida." };

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !adminRoles.has(profile.role)) {
    return { ok: false as const, message: "No tienes permiso administrativo." };
  }

  return { ok: true as const, user, admin };
}

export async function submitSellerApplication(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = sellerApplicationSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Solicitud invalida." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
  const { data: { user } } = await supabase.auth.getUser();
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

export async function updateSellerKyc(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = sellerKycSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "KYC vendedor invalido." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Debes iniciar sesion." };

  const { data: profile } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return { ok: false, message: "Perfil no encontrado." };

  const { data: seller } = await admin
    .from("sellers")
    .select("id, status")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!seller) return { ok: false, message: "No tienes perfil de vendedor. Solicita ser vendedor VIP primero." };

  const { data: existingKyc } = await admin
    .from("seller_kyc")
    .select("id, status")
    .eq("seller_id", seller.id)
    .maybeSingle();

  const kycData = {
    seller_id: seller.id,
    full_name: parsed.data.fullName,
    phone: parsed.data.phone,
    document: parsed.data.document,
    location: parsed.data.location,
    operation_zone: parsed.data.operationZone,
    video_url: parsed.data.videoUrl || null,
    community_verification_vip: parsed.data.communityVerificationVip || null,
    status: existingKyc?.status === "rechazado" ? "pendiente" : "pendiente",
  };

  if (existingKyc) {
    const { error } = await admin.from("seller_kyc").update(kycData).eq("id", existingKyc.id);
    if (error) return { ok: false, message: error.message };
  } else {
    const { error } = await admin.from("seller_kyc").insert(kycData);
    if (error) return { ok: false, message: error.message };
  }

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: "seller_kyc.update",
    entity: "seller_kyc",
    entity_id: seller.id,
    after: { fullName: parsed.data.fullName, status: "pendiente" },
  });

  revalidatePath("/account/kyc");
  revalidatePath("/dashboard/vip");
  return { ok: true, message: "KYC vendedor enviado. Pendiente de revision." };
}

export async function reviewSellerKyc(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = sellerKycReviewSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Revision invalida." };
  }

  const actor = await requireAdminActor();
  if (!actor.ok) return actor;

  const { error } = await actor.admin
    .from("seller_kyc")
    .update({
      status: parsed.data.status,
      reviewed_at: new Date().toISOString(),
    })
    .eq("seller_id", parsed.data.sellerId);

  if (error) return { ok: false, message: error.message };

  if (parsed.data.status === "aprobado") {
    await actor.admin.from("sellers").update({ status: "aprobado" }).eq("id", parsed.data.sellerId);
  }

  await actor.admin.from("audit_logs").insert({
    actor_id: actor.user.id,
    action: `seller_kyc.${parsed.data.status}`,
    entity: "seller_kyc",
    entity_id: parsed.data.sellerId,
    after: { status: parsed.data.status, adminNote: parsed.data.adminNote },
  });

  revalidatePath("/dashboard/admin");
  return { ok: true, message: `KYC vendedor ${parsed.data.status}.` };
}

export async function getSellerKyc(sellerId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("seller_kyc")
    .select("*")
    .eq("seller_id", sellerId)
    .maybeSingle();
  return data ?? null;
}

export async function getAllSellerKycPending() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("seller_kyc")
    .select("*, sellers(profile_id, profiles!inner(full_name, email, phone))")
    .neq("status", "aprobado")
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}
