"use server";

import { redirect } from "next/navigation";
import { resolvePostAuthPath } from "@/lib/auth/routing";
import { loginSchema, passwordResetSchema, resetPasswordSchema, signupSchema } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";

function authCallbackUrl(nextPath: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${siteUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}

export async function login(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  let nextPath = parsed.data.next || "/dashboard";
  let profileStatus: string | null = null;
  let profileRole: string | null = null;

  if (user?.id) {
    try {
      const admin = createAdminClient();
      const { data: profile } = await admin.from("profiles").select("role,status").eq("id", user.id).maybeSingle();
      profileStatus = profile?.status ?? null;
      profileRole = profile?.role ?? null;

      if (profile?.status === "bloqueado") {
        await supabase.auth.signOut();
        return { ok: false, message: "Esta cuenta esta bloqueada. Contacta soporte MSM." };
      }

      await admin
        .from("profiles")
        .update({ last_login_at: new Date().toISOString(), email_confirmed_at: user.email_confirmed_at ?? null })
        .eq("id", user.id);

      await admin.from("audit_logs").insert({
        actor_id: user.id,
        action: "user.login",
        entity: "profiles",
        entity_id: user.id,
        after: { role: profile?.role ?? "cliente" }
      });
    } catch {
      // Si la tabla profiles no existe aun, deja entrar a la experiencia base.
    }
  }

  nextPath = resolvePostAuthPath(parsed.data.next, profileStatus, profileRole);
  redirect(nextPath);
}

export async function signup(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: authCallbackUrl("/account/kyc"),
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        country: parsed.data.country,
      }
    }
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  if (data.user?.id) {
    try {
      const admin = createAdminClient();
      await admin.from("profiles").upsert({
        id: data.user.id,
        email: parsed.data.email,
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        country: parsed.data.country,
        role: "cliente",
        status: "activo",
        preferred_language: "es",
        timezone: "America/New_York",
        notification_email_enabled: true,
        profile_completed_at: null
      });
      await admin.from("audit_logs").insert({
        actor_id: data.user.id,
        action: "profile.signup",
        entity: "profiles",
        entity_id: data.user.id,
        after: { email: parsed.data.email }
      });
    } catch {
      // En local puede no existir service role. Supabase Auth mantiene la cuenta creada.
    }
  }

  return {
    ok: true,
    message: "Listo. Revisa tu correo si Supabase pide confirmacion. Cuenta creada. Ahora puedes validar tus datos en /account/kyc y seguir tus ordenes en /orders."
  };
}

export async function requestPasswordReset(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = passwordResetSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Correo invalido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: authCallbackUrl("/auth/reset-password")
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return {
    ok: true,
    message: "Si el correo existe en MSM MY STORE, recibira un enlace para recuperar la contrasena."
  };
}

export async function resetPassword(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Contrasena invalida." };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { ok: false, message: error.message };
  }

  if (user?.id) {
    try {
      const admin = createAdminClient();
      await admin.from("audit_logs").insert({
        actor_id: user.id,
        action: "password.reset_completed",
        entity: "profiles",
        entity_id: user.id
      });
    } catch {
      // Auditoria disponible despues de migrar Supabase.
    }
  }

  return { ok: true, message: "Contrasena actualizada. Ya puedes entrar a MSM MY STORE." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
