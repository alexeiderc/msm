"use server";

import { revalidatePath } from "next/cache";
import { notifyKycStatusChange } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  adminStoreProductSchema,
  adminVipStoreSchema,
  adminCreateUserSchema,
  customerKycReviewSchema,
  orderReassignmentSchema,
  sellerApplicationReviewSchema,
  sellerApprovalSchema,
  sellerCommissionSchema
} from "@/lib/validations";
import type { ActionResult } from "@/types/actions";

const adminRoles = new Set(["administrador", "administrador_economico", "superadmin"]);

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

async function requireAdminActor() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, message: "Sesion requerida." };
  }

  const { data: profile, error } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false as const, message: error.message };
  }

  if (!profile || !adminRoles.has(profile.role)) {
    return { ok: false as const, message: "No tienes permiso administrativo para esta accion." };
  }

  return { ok: true as const, user, admin };
}

export async function reviewCustomerKyc(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = customerKycReviewSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Revision KYC cliente invalida." };
  }

  const actor = await requireAdminActor();
  if (!actor.ok) return actor;

  const paymentMethodValid = parsed.data.paymentMethodValid === "on";
  const checkedAt = parsed.data.status === "aprobado" ? new Date().toISOString() : null;

  const { error } = await actor.admin
    .from("profiles")
    .update({
      customer_kyc_status: parsed.data.status,
      customer_risk_level: parsed.data.riskLevel,
      payment_method_valid: paymentMethodValid,
      kyc_checked_at: checkedAt,
      account_hold_reason:
        parsed.data.riskLevel === "bloqueado" || parsed.data.status === "rechazado"
          ? parsed.data.decisionNote || "Cuenta requiere bloqueo/revision administrativa."
          : null
    })
    .eq("id", parsed.data.profileId);

  if (error) {
    return { ok: false, message: error.message };
  }

  await actor.admin.from("customer_kyc_reviews").insert({
    profile_id: parsed.data.profileId,
    reviewer_id: actor.user.id,
    status: parsed.data.status,
    risk_level: parsed.data.riskLevel,
    provider: "manual_msm_admin",
    decision_note: parsed.data.decisionNote || null,
    metadata: {
      paymentMethodValid,
      checkedAt
    }
  });

  await actor.admin.from("audit_logs").insert({
    actor_id: actor.user.id,
    action: "customer_kyc.review",
    entity: "profiles",
    entity_id: parsed.data.profileId,
    after: {
      status: parsed.data.status,
      riskLevel: parsed.data.riskLevel,
      paymentMethodValid,
      decisionNote: parsed.data.decisionNote || null
    }
  });

  if (parsed.data.status === "aprobado" || parsed.data.status === "rechazado") {
    const { data: profile } = await actor.admin
      .from("profiles")
      .select("email,phone,full_name")
      .eq("id", parsed.data.profileId)
      .maybeSingle();
    if (profile) {
      notifyKycStatusChange({
        userId: parsed.data.profileId,
        status: parsed.data.status,
        email: profile.email,
        phone: profile.phone,
        fullName: profile.full_name,
        reason: parsed.data.decisionNote || null,
      }).catch(() => {});
    }
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/account/kyc");
  return { ok: true, message: "KYC cliente revisado y auditado." };
}

export async function createManualVipStore(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = adminVipStoreSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Perfil VIP invalido." };
  }

  const actor = await requireAdminActor();
  if (!actor.ok) return actor;

  const email = parsed.data.email || `${slugify(parsed.data.commercialName)}-${crypto.randomUUID().slice(0, 8)}@msm-vip.local`;
  const profileId = crypto.randomUUID();

  const { data: profile, error: profileError } = await actor.admin
    .from("profiles")
    .insert({
      id: profileId,
      email,
      full_name: parsed.data.ownerName,
      phone: parsed.data.phone,
      role: "vendedor_vip",
      address: parsed.data.address || `${parsed.data.municipality}, ${parsed.data.province}, ${parsed.data.country}`
    })
    .select("id")
    .single();

  if (profileError) {
    return { ok: false, message: profileError.message };
  }

  const { data: seller, error: sellerError } = await actor.admin
    .from("sellers")
    .insert({
      profile_id: profile.id,
      level: parsed.data.level,
      status: parsed.data.status === "activo" ? "aprobado" : "pendiente",
      commission_rate: parsed.data.commissionRate,
      daily_capacity: parsed.data.dailyCapacity,
      operation_zone: parsed.data.deliveryZones
    })
    .select("id")
    .single();

  if (sellerError) {
    return { ok: false, message: sellerError.message };
  }

  const storeSlug = `${slugify(parsed.data.commercialName)}-${slugify(parsed.data.municipality)}`;
  const { data: store, error: storeError } = await actor.admin
    .from("stores")
    .insert({
      seller_id: seller.id,
      name: parsed.data.commercialName,
      slug: storeSlug,
      type: parsed.data.type,
      status: parsed.data.status,
      owner_name: parsed.data.ownerName,
      company_name: parsed.data.companyName || null,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp || parsed.data.phone,
      email,
      country: parsed.data.country,
      province: parsed.data.province,
      municipality: parsed.data.municipality,
      address: parsed.data.address || null,
      description: parsed.data.description,
      warranty: parsed.data.warranty || null,
      categories: parseCsv(parsed.data.categories),
      services_active: parseCsv(parsed.data.servicesActive),
      pickup_available: true,
      delivery_available: true,
      transfer_available: true,
      remittances_active: parsed.data.remittancesActive === "on",
      remittance_delivery_methods: parseCsv(parsed.data.remittanceDeliveryMethods),
      remittance_municipalities: parseCsv(parsed.data.deliveryZones),
      cash_available: parsed.data.cashAvailable ?? null,
      remittance_daily_limit: parsed.data.remittanceDailyLimit ?? null,
      remittance_eta: parsed.data.remittanceEta || null,
      remittance_evidence_mode: "Foto, firma, mensaje o codigo OTP",
      reputation_label: parsed.data.reputationLabel || null,
      is_featured: parsed.data.isFeatured === "on",
      is_active: parsed.data.status === "activo",
      delivery_zones: parseCsv(parsed.data.deliveryZones),
      weekly_hours: { default: "Por confirmar con el VIP" }
    })
    .select("id")
    .single();

  if (storeError) {
    return { ok: false, message: storeError.message };
  }

  await actor.admin.from("audit_logs").insert({
    actor_id: actor.user.id,
    action: "vip_store.manual_create",
    entity: "stores",
    entity_id: store.id,
    after: {
      sellerId: seller.id,
      profileId: profile.id,
      commercialName: parsed.data.commercialName,
      country: parsed.data.country,
      province: parsed.data.province,
      municipality: parsed.data.municipality,
      type: parsed.data.type
    }
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/vendedores-verificados");
  revalidatePath(`/vendedores/${storeSlug}`);
  return { ok: true, message: "Perfil VIP / tienda creado y auditado.", id: store.id };
}

export async function createAdminStoreProduct(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = adminStoreProductSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Producto invalido." };
  }

  const actor = await requireAdminActor();
  if (!actor.ok) return actor;

  const { data: store, error: storeError } = await actor.admin
    .from("stores")
    .select("id,name,status,is_active,country,province,municipality,delivery_zones")
    .eq("id", parsed.data.storeId)
    .maybeSingle();

  if (storeError) {
    return { ok: false, message: storeError.message };
  }

  if (!store) {
    return { ok: false, message: "No encontramos la tienda para crear el producto." };
  }

  let categoryId = parsed.data.categoryId || "";
  if (!categoryId && parsed.data.categorySlug) {
    const { data: category } = await actor.admin
      .from("categories")
      .select("id")
      .eq("slug", parsed.data.categorySlug)
      .maybeSingle();
    categoryId = category?.id ?? "";
  }

  if (!categoryId) {
    return { ok: false, message: "Selecciona categoria valida." };
  }

  const country = parsed.data.country || store.country || "Cuba";
  const province = parsed.data.province || store.province || "";
  const municipality = parsed.data.municipality || store.municipality || "";
  const deliveryZone = parsed.data.deliveryZone || store.delivery_zones?.[0] || "";
  const publishable = Boolean(
    parsed.data.status === "activo" &&
    parsed.data.isActive === "on" &&
    province &&
    municipality &&
    store.status === "activo" &&
    store.is_active
  );

  const { data: product, error } = await actor.admin
    .from("products")
    .insert({
      store_id: parsed.data.storeId,
      category_id: categoryId,
      name: parsed.data.name,
      slug: slugify(parsed.data.name),
      description: parsed.data.description || null,
      price: parsed.data.price,
      currency: parsed.data.currency,
      subcategory: parsed.data.subcategory || null,
      country,
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

  const images = [parsed.data.imageUrl, ...parseCsv(parsed.data.galleryUrls)].filter(Boolean);
  if (images.length) {
    await actor.admin.from("product_images").insert(
      images.map((url, index) => ({
        product_id: product.id,
        url,
        alt: parsed.data.name,
        position: index
      }))
    );
  }

  await actor.admin.from("audit_logs").insert({
    actor_id: actor.user.id,
    action: "admin.product_create",
    entity: "products",
    entity_id: product.id,
    after: { storeId: parsed.data.storeId, publishable, country, province, municipality }
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/products");
  return {
    ok: true,
    message: publishable ? "Producto creado y publicado." : "Producto creado como borrador por faltar datos publicos.",
    id: product.id
  };
}

export async function approveSeller(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = sellerApprovalSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Vendedor invalido." };
  }

  const actor = await requireAdminActor();
  if (!actor.ok) return actor;

  const { error } = await actor.admin
    .from("sellers")
    .update({ status: "aprobado", level: "vendedor_verificado" })
    .eq("id", parsed.data.sellerId);

  if (error) {
    return { ok: false, message: error.message };
  }

  await actor.admin.from("audit_logs").insert({
    actor_id: actor.user.id,
    action: "seller.approve",
    entity: "sellers",
    entity_id: parsed.data.sellerId,
    after: { status: "aprobado", level: "vendedor_verificado" }
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/verified-sellers");
  return { ok: true, message: "Vendedor aprobado y auditado." };
}

export async function reviewSellerApplication(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = sellerApplicationReviewSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Solicitud invalida." };
  }

  const actor = await requireAdminActor();
  if (!actor.ok) return actor;

  const { error } = await actor.admin
    .from("seller_applications")
    .update({
      status: parsed.data.status,
      admin_note: parsed.data.adminNote || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", parsed.data.applicationId);

  if (error) {
    return { ok: false, message: error.message };
  }

  await actor.admin.from("audit_logs").insert({
    actor_id: actor.user.id,
    action: "seller_application.review",
    entity: "seller_applications",
    entity_id: parsed.data.applicationId,
    after: { status: parsed.data.status, adminNote: parsed.data.adminNote }
  });

  revalidatePath("/dashboard/admin");
  return { ok: true, message: `Solicitud actualizada a ${parsed.data.status}.` };
}

export async function updateSellerCommission(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = sellerCommissionSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Comision invalida." };
  }

  const actor = await requireAdminActor();
  if (!actor.ok) return actor;

  const { data: before } = await actor.admin
    .from("sellers")
    .select("commission_rate")
    .eq("id", parsed.data.sellerId)
    .maybeSingle();

  const { error } = await actor.admin
    .from("sellers")
    .update({ commission_rate: parsed.data.commissionRate })
    .eq("id", parsed.data.sellerId);

  if (error) {
    return { ok: false, message: error.message };
  }

  await actor.admin.from("audit_logs").insert({
    actor_id: actor.user.id,
    action: "seller.commission_update",
    entity: "sellers",
    entity_id: parsed.data.sellerId,
    before,
    after: { commission_rate: parsed.data.commissionRate }
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/economic");
  return { ok: true, message: "Comision del vendedor actualizada y auditada." };
}

export async function reassignOrder(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = orderReassignmentSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Reasignacion invalida." };
  }

  const actor = await requireAdminActor();
  if (!actor.ok) return actor;

  const { data: order, error: orderError } = await actor.admin
    .from("orders")
    .select("seller_id,status")
    .eq("id", parsed.data.orderId)
    .maybeSingle();

  if (orderError) {
    return { ok: false, message: orderError.message };
  }

  const { data: seller, error: sellerError } = await actor.admin
    .from("sellers")
    .select("max_confirm_minutes,status")
    .eq("id", parsed.data.sellerId)
    .maybeSingle();

  if (sellerError) {
    return { ok: false, message: sellerError.message };
  }

  if (!seller) {
    return { ok: false, message: "No se encontro el vendedor destino." };
  }

  const vipConfirmBy = new Date(Date.now() + Number(seller.max_confirm_minutes ?? 120) * 60 * 1000).toISOString();

  const { error } = await actor.admin
    .from("orders")
    .update({
      seller_id: parsed.data.sellerId,
      status: "asignada_vip",
      vip_confirm_by: vipConfirmBy
    })
    .eq("id", parsed.data.orderId);

  if (error) {
    return { ok: false, message: error.message };
  }

  await actor.admin.from("order_events").insert({
    order_id: parsed.data.orderId,
    status: "asignada_vip",
    actor_id: actor.user.id,
    note: parsed.data.note || "Orden reasignada por administracion.",
    metadata: {
      previousSellerId: order?.seller_id ?? null,
      newSellerId: parsed.data.sellerId,
      previousStatus: order?.status ?? null,
      vipConfirmBy
    }
  });

  await actor.admin.from("audit_logs").insert({
    actor_id: actor.user.id,
    action: "order.reassign",
    entity: "orders",
    entity_id: parsed.data.orderId,
    before: { seller_id: order?.seller_id ?? null, status: order?.status ?? null },
    after: { seller_id: parsed.data.sellerId, status: "asignada_vip", vip_confirm_by: vipConfirmBy }
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/vip");
  revalidatePath("/orders");
  return { ok: true, message: "Orden reasignada, evento registrado y nuevo SLA activado." };
}

export async function adminCreateUser(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = adminCreateUserSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const actor = await requireAdminActor();
  if (!actor.ok) return actor;

  try {
    const { data: authUser, error: authError } = await actor.admin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: { full_name: parsed.data.fullName }
    });

    if (authError) return { ok: false, message: authError.message };
    if (!authUser.user) return { ok: false, message: "Error al crear usuario de autenticacion." };

    const { error: profileError } = await actor.admin.from("profiles").insert({
      id: authUser.user.id,
      email: parsed.data.email,
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      role: parsed.data.role,
      status: "activo",
      preferred_language: "es",
      timezone: "America/New_York"
    });

    if (profileError) return { ok: false, message: profileError.message };

    if (parsed.data.role === "vendedor_vip" && parsed.data.sellerName && parsed.data.storeName) {
      const { error: sellerError } = await actor.admin.from("sellers").insert({
        profile_id: authUser.user.id,
        level: "vendedor_verificado",
        status: "aprobado",
        commission_rate: 10,
        daily_capacity: 10
      });

      if (sellerError) return { ok: false, message: sellerError.message };

      const { data: seller } = await actor.admin
        .from("sellers")
        .select("id")
        .eq("profile_id", authUser.user.id)
        .maybeSingle();

      if (seller) {
        await actor.admin.from("stores").insert({
          seller_id: seller.id,
          name: parsed.data.storeName,
          slug: slugify(parsed.data.storeName) + "-" + authUser.user.id.slice(0, 8),
          is_active: true,
          delivery_zones: ["Toda Cuba"]
        });
      }
    }

    await actor.admin.from("audit_logs").insert({
      actor_id: actor.user.id,
      action: "admin.create_user",
      entity: "profiles",
      entity_id: authUser.user.id,
      after: { email: parsed.data.email, role: parsed.data.role, fullName: parsed.data.fullName }
    });

    revalidatePath("/dashboard/admin/users");
    return {
      ok: true,
      message: `Usuario ${parsed.data.email} creado como ${parsed.data.role}. Credenciales enviadas al correo registrado.`
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al crear usuario." };
  }
}
