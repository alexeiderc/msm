"use server";

import { redirect } from "next/navigation";
import { loginSchema, passwordResetSchema, signupSchema } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";

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

  redirect(parsed.data.next || "/");
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
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        role_intent: parsed.data.roleIntent
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
        role: "cliente"
      });
    } catch {
      // En local puede no existir service role. Supabase Auth mantiene la cuenta creada.
    }
  }

  const nextStep =
    parsed.data.roleIntent === "vendedor_vip"
      ? " Cuenta creada. Ahora puedes completar la solicitud VIP en /vendedores/solicitud."
      : " Cuenta creada. Ahora puedes validar tus datos en /account/kyc y seguir tus ordenes en /orders.";

  return { ok: true, message: `Listo. Revisa tu correo si Supabase pide confirmacion.${nextStep}` };
}

export async function requestPasswordReset(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = passwordResetSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Correo invalido." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/login`
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return {
    ok: true,
    message: "Si el correo existe en MSM MY STORE, recibira un enlace para recuperar la contrasena."
  };
}
