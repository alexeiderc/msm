"use server";

import { revalidatePath } from "next/cache";
import { returnRequestSchema, returnReviewSchema } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { makeOrderNumber } from "@/lib/utils";
import type { ActionResult } from "@/types/actions";

export async function requestReturn(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = returnRequestSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "Sesion requerida." };

    const admin = createAdminClient();
    const evidenceUrls = parsed.data.evidenceUrls ? parsed.data.evidenceUrls.split("\n").filter(Boolean) : [];
    const returnNumber = "RET-" + makeOrderNumber();

    await admin.from("returns").insert({
      return_number: returnNumber,
      order_id: parsed.data.orderId,
      order_item_id: parsed.data.orderItemId || null,
      customer_id: user.id,
      reason: parsed.data.reason,
      description: parsed.data.description || null,
      evidence_urls: evidenceUrls.length ? evidenceUrls : null
    });

    revalidatePath("/orders");
    return { ok: true, message: `Solicitud de devolución #${returnNumber} creada.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error." };
  }
}

export async function reviewReturn(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = returnReviewSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };

  try {
    const admin = createAdminClient();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "Sesion requerida." };

    const { error } = await admin
      .from("returns")
      .update({
        status: parsed.data.status,
        resolution_type: parsed.data.resolutionType || null,
        resolution_amount: parsed.data.resolutionAmount || null,
        admin_id: user.id,
        admin_note: parsed.data.adminNote || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", parsed.data.returnId);

    if (error) return { ok: false, message: error.message };

    if (parsed.data.status === "reembolsado" && parsed.data.resolutionAmount && parsed.data.resolutionType === "refund") {
      const { data: ret } = await admin.from("returns").select("customer_id").eq("id", parsed.data.returnId).single();
      if (ret) {
        const { data: wallet } = await admin
          .from("wallet_accounts")
          .select("id,balance")
          .eq("user_id", ret.customer_id)
          .eq("currency", "USD")
          .maybeSingle();

        if (wallet) {
          const newBalance = Number(wallet.balance ?? 0) + Number(parsed.data.resolutionAmount);
          await admin.from("wallet_accounts").update({ balance: newBalance, updated_at: new Date().toISOString() }).eq("id", wallet.id);

          const { data: tx } = await admin.from("wallet_transactions").insert({
            wallet_id: wallet.id,
            user_id: ret.customer_id,
            type: "credito",
            status: "confirmado",
            amount: Number(parsed.data.resolutionAmount),
            currency: "USD",
            reference_type: "return",
            reference_id: parsed.data.returnId,
            note: `Reembolso por devolucion ${parsed.data.returnId}`
          }).select("id").single();

          if (tx) {
            await admin.from("returns").update({ refund_wallet_transaction_id: tx.id }).eq("id", parsed.data.returnId);
          }
        }
      }
    }

    revalidatePath("/dashboard/admin/returns");
    return { ok: true, message: `Devolucion actualizada a ${parsed.data.status}.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error." };
  }
}
