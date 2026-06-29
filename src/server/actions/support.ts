"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { supportTicketSchema } from "@/lib/validations";
import type { ActionResult } from "@/types/actions";

export async function openSupportTicket(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = supportTicketSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ticket invalido." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesion requerida." };

  const { data: order } = await admin
    .from("orders")
    .select("id,customer_id,order_number")
    .eq("id", parsed.data.orderId)
    .maybeSingle();

  if (!order || order.customer_id !== user.id) {
    return { ok: false, message: "No encontramos una orden tuya con ese ID." };
  }

  const { data: ticket, error } = await admin
    .from("support_tickets")
    .insert({
      order_id: parsed.data.orderId,
      opened_by_id: user.id,
      reason: parsed.data.reason,
      subject: parsed.data.subject
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };

  await admin.from("support_messages").insert({
    ticket_id: ticket.id,
    author_id: user.id,
    body: parsed.data.body,
    evidence_url: parsed.data.evidenceUrl || null
  });

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: "support.ticket_opened",
    entity: "support_tickets",
    entity_id: ticket.id,
    after: { reason: parsed.data.reason, subject: parsed.data.subject, orderNumber: order.order_number }
  });

  revalidatePath("/support");
  revalidatePath("/dashboard/admin");
  return { ok: true, message: "Reclamacion abierta y enlazada a la orden.", id: ticket.id };
}
