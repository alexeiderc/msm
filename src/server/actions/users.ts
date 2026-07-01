"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { adminUserKycSchema, adminUserRoleSchema, adminUserStatusSchema, profileUpdateSchema, securityUpdateSchema } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperadmin, requireUser } from "@/server/auth/guards";
import type { ActionResult } from "@/types/actions";

function checkbox(value: unknown) {
  return value === "on";
}

function profileComplete(data: { fullName?: string; phone?: string; country?: string; address?: string | null }) {
  return Boolean(data.fullName && data.phone && data.country && data.address);
}

async function writeAudit(actorId: string | null | undefined, action: string, entity: string, entityId?: string, before?: unknown, after?: unknown) {
  try {
    const admin = createAdminClient();
    await admin.from("audit_logs").insert({
      actor_id: actorId ?? null,
      action,
      entity,
      entity_id: entityId ?? null,
      before: before ?? null,
      after: after ?? null
    });
  } catch {
    // Auditoria depende de migraciones y service role.
  }
}

export async function updateProfile(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = profileUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Perfil invalido." };

  try {
    const { user } = await requireUser();
    const admin = createAdminClient();
    const completedAt = profileComplete({
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      country: parsed.data.country,
      address: parsed.data.address
    })
      ? new Date().toISOString()
      : null;

    const { error } = await admin
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        country: parsed.data.country,
        address: parsed.data.address || null,
        whatsapp: parsed.data.whatsapp || null,
        bio: parsed.data.bio || null,
        preferred_language: parsed.data.preferredLanguage,
        timezone: parsed.data.timezone,
        notification_email_enabled: checkbox(parsed.data.notificationEmailEnabled),
        notification_whatsapp_enabled: checkbox(parsed.data.notificationWhatsappEnabled),
        profile_completed_at: completedAt,
        updated_at: new Date().toISOString()
      })
      .eq("id", user!.id);

    if (error) return { ok: false, message: error.message };

    await writeAudit(user!.id, "profile.update", "profiles", user!.id, null, {
      fullName: parsed.data.fullName,
      country: parsed.data.country,
      completed: Boolean(completedAt)
    });
    revalidatePath("/account");
    revalidatePath("/account/profile");
    return { ok: true, message: "Perfil actualizado." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo actualizar el perfil." };
  }
}

export async function uploadAvatar(_: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { user } = await requireUser();
    const admin = createAdminClient();
    const file = formData.get("avatarFile");

    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, message: "Selecciona una imagen de perfil." };
    }
    if (!file.type.startsWith("image/")) {
      return { ok: false, message: "La foto de perfil debe ser una imagen." };
    }
    if (file.size > 2 * 1024 * 1024) {
      return { ok: false, message: "La imagen debe pesar menos de 2 MB." };
    }

    const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
    const path = `${user!.id}/${randomUUID()}.${extension}`;
    const { error: uploadError } = await admin.storage.from("avatars").upload(path, file, {
      contentType: file.type,
      upsert: false
    });
    if (uploadError) return { ok: false, message: uploadError.message };

    const { data } = admin.storage.from("avatars").getPublicUrl(path);
    const { error } = await admin
      .from("profiles")
      .update({ avatar_url: data.publicUrl, updated_at: new Date().toISOString() })
      .eq("id", user!.id);
    if (error) return { ok: false, message: error.message };

    await writeAudit(user!.id, "avatar.update", "profiles", user!.id, null, { avatarUrl: data.publicUrl });
    revalidatePath("/account");
    revalidatePath("/account/profile");
    return { ok: true, message: "Foto de perfil actualizada.", id: data.publicUrl };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo subir el avatar." };
  }
}

export async function removeAvatar(_: ActionResult, _formData: FormData): Promise<ActionResult> {
  try {
    const { user } = await requireUser();
    const admin = createAdminClient();
    const { error } = await admin.from("profiles").update({ avatar_url: null }).eq("id", user!.id);
    if (error) return { ok: false, message: error.message };
    await writeAudit(user!.id, "avatar.remove", "profiles", user!.id);
    revalidatePath("/account");
    return { ok: true, message: "Foto eliminada." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo eliminar el avatar." };
  }
}

export async function changePassword(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = securityUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Contrasena invalida." };

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesion requerida." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, message: error.message };

  await writeAudit(user.id, "password.change", "profiles", user.id);
  return { ok: true, message: "Contrasena actualizada." };
}

export async function updateAdminUserRole(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = adminUserRoleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Rol invalido." };

  try {
    const { user } = await requireSuperadmin();
    const admin = createAdminClient();
    const { data: target } = await admin.from("profiles").select("role").eq("id", parsed.data.userId).maybeSingle();
    if (parsed.data.userId === user!.id && parsed.data.role !== "superadmin") {
      return { ok: false, message: "No puedes quitarte tu propio rol superadmin." };
    }

    const { error } = await admin.from("profiles").update({ role: parsed.data.role }).eq("id", parsed.data.userId);
    if (error) return { ok: false, message: error.message };
    await writeAudit(user!.id, "admin.user_role_update", "profiles", parsed.data.userId, target, {
      role: parsed.data.role,
      note: parsed.data.note || null
    });
    revalidatePath("/dashboard/admin/users");
    return { ok: true, message: "Rol actualizado." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo cambiar el rol." };
  }
}

export async function updateAdminUserStatus(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = adminUserStatusSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Estado invalido." };

  try {
    const { user, profile } = await requireAdmin();
    const admin = createAdminClient();
    const { data: target } = await admin.from("profiles").select("role,status").eq("id", parsed.data.userId).maybeSingle();
    if (parsed.data.userId === user!.id && parsed.data.status === "bloqueado") {
      return { ok: false, message: "No puedes bloquear tu propia cuenta." };
    }
    if (target?.role === "superadmin" && profile?.role !== "superadmin") {
      return { ok: false, message: "Solo superadmin puede modificar otro superadmin." };
    }

    const { error } = await admin
      .from("profiles")
      .update({
        status: parsed.data.status,
        admin_note: parsed.data.note || null,
        account_hold_reason: parsed.data.status === "bloqueado" ? parsed.data.note || "Cuenta bloqueada por administracion." : null
      })
      .eq("id", parsed.data.userId);
    if (error) return { ok: false, message: error.message };

    await writeAudit(user!.id, `admin.user_${parsed.data.status}`, "profiles", parsed.data.userId, target, {
      status: parsed.data.status,
      note: parsed.data.note || null
    });
    revalidatePath("/dashboard/admin/users");
    return { ok: true, message: "Estado del usuario actualizado." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo cambiar el estado." };
  }
}

export async function updateAdminUserKyc(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = adminUserKycSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "KYC invalido." };

  try {
    const { user } = await requireAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({
        customer_kyc_status: parsed.data.status,
        customer_risk_level: parsed.data.riskLevel,
        payment_method_valid: checkbox(parsed.data.paymentMethodValid),
        admin_note: parsed.data.note || null,
        kyc_checked_at: parsed.data.status === "aprobado" ? new Date().toISOString() : null
      })
      .eq("id", parsed.data.userId);
    if (error) return { ok: false, message: error.message };

    await admin.from("customer_kyc_reviews").insert({
      profile_id: parsed.data.userId,
      reviewer_id: user!.id,
      status: parsed.data.status,
      risk_level: parsed.data.riskLevel,
      provider: "manual_msm_admin",
      decision_note: parsed.data.note || null,
      metadata: { paymentMethodValid: checkbox(parsed.data.paymentMethodValid) }
    });
    await writeAudit(user!.id, "admin.user_kyc_update", "profiles", parsed.data.userId, null, parsed.data);
    revalidatePath("/dashboard/admin/users");
    return { ok: true, message: "KYC administrativo actualizado." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo cambiar el KYC." };
  }
}
