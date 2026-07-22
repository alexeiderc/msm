"use server";

import { redirect } from "next/navigation";
import { resolvePostAuthPath } from "@/lib/auth/routing";
import { getCountryByCode } from "@/lib/countries";
import { loginSchema, passwordResetSchema, resetPasswordSchema, signupSchema } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";

function authCallbackUrl(nextPath: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${siteUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}

function authErrorMessage(code?: string) {
  const messages: Record<string, string> = {
    invalid_credentials: "El correo o la contrasena no son correctos.",
    email_not_confirmed: "Confirma tu correo antes de iniciar sesion.",
    user_banned: "Esta cuenta no puede iniciar sesion. Contacta soporte MSM.",
    over_request_rate_limit: "Demasiados intentos. Espera unos minutos y vuelve a probar."
  };

  return (code && messages[code]) || "No se pudo iniciar sesion. Revisa tus datos e intenta nuevamente.";
}

function signupErrorMessage(code?: string) {
  const messages: Record<string, string> = {
    email_address_invalid: "Escribe un correo electronico real y valido.",
    email_exists: "Ya existe una cuenta con este correo. Inicia sesion o recupera tu contrasena.",
    user_already_exists: "Ya existe una cuenta con este correo. Inicia sesion o recupera tu contrasena.",
    signup_disabled: "El registro esta temporalmente pausado. Contacta soporte MSM.",
    over_email_send_rate_limit: "El correo de confirmacion esta temporalmente ocupado. Tus datos estan bien; espera unos minutos antes de volver a probar.",
    weak_password: "La contrasena necesita mas seguridad. Usa mayusculas, minusculas, numeros y un simbolo."
  };

  return (code && messages[code]) || "No se pudo crear la cuenta. Revisa los datos e intenta nuevamente.";
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
    return { ok: false, message: authErrorMessage(error.code) };
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

  const country = getCountryByCode(parsed.data.country.toUpperCase());

  if (!country) {
    return { ok: false, message: "Selecciona un pais valido." };
  }

  const localPhone = parsed.data.phone.replace(/\D/g, "");
  const phone = `${country.prefix}${localPhone}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: authCallbackUrl("/account/kyc"),
      data: {
        full_name: parsed.data.fullName,
        phone,
        country: country.code,
      }
    }
  });

  if (error) {
    return {
      ok: false,
      message: signupErrorMessage(error.code),
      code: error.code,
      retryAfterSeconds: error.code === "over_email_send_rate_limit" ? 60 : undefined
    };
  }

  const betaMode = process.env.BETA_MODE === "true";

  if (data.user?.id) {
    try {
      const admin = createAdminClient();
      await admin.from("profiles").upsert({
        id: data.user.id,
        email: parsed.data.email,
        full_name: parsed.data.fullName,
        phone,
        country: country.code,
        role: "cliente",
        status: betaMode ? "pausado" : "activo",
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
        after: { email: parsed.data.email, beta_mode: betaMode }
      });

      if (betaMode) {
        await admin.from("beta_access").upsert({
          user_id: data.user.id,
          status: "pendiente",
          note: "Registro creado desde la beta publica."
        }, { onConflict: "user_id" });
      }
    } catch {
      // En local puede no existir service role. Supabase Auth mantiene la cuenta creada.
    }
  }

  return {
    ok: true,
    message: betaMode
      ? "Cuenta creada. Revisa tu correo para confirmarla. MSM revisara el acceso antes de habilitar pagos y operaciones."
      : "Cuenta creada. Revisa tu correo si Supabase pide confirmacion. Ya puedes completar tu perfil y validar tus datos."
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
