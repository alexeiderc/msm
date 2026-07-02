"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createIdswyftSession, isIdswyftConfigured } from "@/lib/idswyft/client";

export async function startIdswyftVerification(): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Debes iniciar sesion." };
  }

  if (!isIdswyftConfigured()) {
    return { ok: false, message: "Idswyft no esta configurado." };
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const session = await createIdswyftSession(user.id, `${siteUrl}/account/kyc`);

    const admin = createAdminClient();
    await admin.from("profiles").update({
      kyc_provider: "idswyft",
      kyc_provider_reference: session.verification_id,
      customer_kyc_status: "pendiente",
    }).eq("id", user.id);

    return { ok: true, url: session.verification_url };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al iniciar verificacion Idswyft." };
  }
}
