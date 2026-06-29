"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { payoutSchema } from "@/lib/validations";
import type { ActionResult } from "@/types/actions";

export async function exportLedgerCsv() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ledger_entries")
    .select("created_at,seller_id,type,amount,description,order_id,payout_id")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = [
    "created_at,seller_id,type,amount,description,order_id,payout_id",
    ...(data ?? []).map((row) =>
      [
        row.created_at,
        row.seller_id,
        row.type,
        row.amount,
        JSON.stringify(row.description ?? ""),
        row.order_id ?? "",
        row.payout_id ?? ""
      ].join(",")
    )
  ];

  return rows.join("\n");
}

export async function registerPayout(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = payoutSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Payout invalido." };
  }

  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "Sesion requerida." };
    }

    const { data: payout, error } = await admin
      .from("payouts")
      .insert({
        seller_id: parsed.data.sellerId,
        amount: parsed.data.amount,
        method: parsed.data.method,
        reference: parsed.data.reference || null,
        receipt_url: parsed.data.receiptUrl || null,
        period_start: parsed.data.periodStart,
        period_end: parsed.data.periodEnd
      })
      .select("id")
      .single();

    if (error) {
      return { ok: false, message: error.message };
    }

    await admin.from("ledger_entries").insert({
      seller_id: parsed.data.sellerId,
      type: "payout",
      amount: -parsed.data.amount,
      description: `Payout enviado por ${parsed.data.method}`,
      payout_id: payout.id
    });

    await admin.from("audit_logs").insert({
      actor_id: user.id,
      action: "payout.register",
      entity: "payouts",
      entity_id: payout.id,
      after: {
        sellerId: parsed.data.sellerId,
        amount: parsed.data.amount,
        method: parsed.data.method
      }
    });

    revalidatePath("/dashboard/economic");
    revalidatePath("/dashboard/don-miguel");
    return { ok: true, message: "Payout registrado y ledger actualizado.", id: payout.id };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo registrar el payout." };
  }
}
