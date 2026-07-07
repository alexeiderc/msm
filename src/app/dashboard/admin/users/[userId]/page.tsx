import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { AdminUserKycForm, AdminUserRoleForm, AdminUserStatusForm } from "@/components/dashboard/admin-user-forms";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getUser(userId: string) {
  try {
    const admin = createAdminClient();
    const [{ data: profile }, { data: orders }, { data: remittances }, { data: tickets }, { data: logs }] = await Promise.all([
      admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
      admin.from("orders").select("id,order_number,status,subtotal,created_at").eq("customer_id", userId).order("created_at", { ascending: false }).limit(8),
      admin.from("remittances").select("id,remittance_number,status,send_amount,created_at").eq("customer_id", userId).order("created_at", { ascending: false }).limit(8),
      admin.from("support_tickets").select("id,subject,status,reason,created_at").eq("opened_by_id", userId).order("created_at", { ascending: false }).limit(8),
      admin.from("audit_logs").select("id,action,entity,created_at").eq("actor_id", userId).order("created_at", { ascending: false }).limit(12)
    ]);
    return { profile, orders: orders ?? [], remittances: remittances ?? [], tickets: tickets ?? [], logs: logs ?? [] };
  } catch {
    return { profile: null, orders: [], remittances: [], tickets: [], logs: [] };
  }
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { profile, orders, remittances, tickets, logs } = await getUser(userId);
  if (!profile) notFound();

  const row = profile as {
    id: string;
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    country?: string | null;
    address?: string | null;
    role?: string | null;
    status?: string | null;
    bio?: string | null;
    customer_kyc_status?: string | null;
    customer_risk_level?: string | null;
    payment_method_valid?: boolean | null;
    admin_note?: string | null;
  };

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
        <Link href="/dashboard/admin/users" className="text-sm font-bold text-msm-blue">Volver a usuarios</Link>
        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
            <Badge>{row.role ?? "cliente"}</Badge>
            <h1 className="mt-3 text-3xl font-black text-msm-ink">{row.full_name ?? "Usuario sin nombre"}</h1>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <p><strong>Email:</strong> {row.email}</p>
              <p><strong>Telefono:</strong> {row.phone ?? "sin telefono"}</p>
              <p><strong>Pais:</strong> {row.country ?? "sin pais"}</p>
              <p><strong>Estado:</strong> {row.status ?? "activo"}</p>
              <p><strong>KYC:</strong> {row.customer_kyc_status ?? "pendiente"}</p>
              <p><strong>Riesgo:</strong> {row.customer_risk_level ?? "normal"}</p>
              <p><strong>Metodo pago:</strong> {row.payment_method_valid ? "validado" : "pendiente"}</p>
              <p><strong>ID:</strong> {row.id}</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{row.bio ?? "Sin bio."}</p>
            {row.admin_note ? <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm font-semibold text-amber-800">{row.admin_note}</p> : null}
          </div>
          <div className="grid gap-4">
            <AdminUserRoleForm userId={row.id} currentRole={row.role} />
            <AdminUserStatusForm userId={row.id} currentStatus={row.status} />
            <AdminUserKycForm userId={row.id} />
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <section className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="font-bold">Ordenes</h2>
            <div className="mt-3 grid gap-2 text-sm">
              {orders.length ? orders.map((order) => <p key={order.id} className="rounded-md border border-msm-line p-3">{order.order_number} / {order.status} / ${Number(order.subtotal ?? 0).toFixed(2)}</p>) : <p className="text-slate-600">Sin ordenes recientes.</p>}
            </div>
          </section>
          <section className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="font-bold">Remesas</h2>
            <div className="mt-3 grid gap-2 text-sm">
              {remittances.length ? remittances.map((item) => <p key={item.id} className="rounded-md border border-msm-line p-3">{item.remittance_number} / {item.status} / ${Number(item.send_amount ?? 0).toFixed(2)}</p>) : <p className="text-slate-600">Sin remesas recientes.</p>}
            </div>
          </section>
          <section className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="font-bold">Tickets</h2>
            <div className="mt-3 grid gap-2 text-sm">
              {tickets.length ? tickets.map((ticket) => <p key={ticket.id} className="rounded-md border border-msm-line p-3">{ticket.subject} / {ticket.reason} / {ticket.status}</p>) : <p className="text-slate-600">Sin tickets recientes.</p>}
            </div>
          </section>
          <section className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="font-bold">Audit logs</h2>
            <div className="mt-3 grid gap-2 text-sm">
              {logs.length ? logs.map((log) => <p key={log.id} className="rounded-md border border-msm-line p-3">{log.action} / {log.entity}</p>) : <p className="text-slate-600">Sin logs recientes.</p>}
            </div>
          </section>
        </div>
      </section>
    </AppShell>
  );
}
