import Link from "next/link";
import { Search, UserCog, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminCreateUserForm } from "@/components/dashboard/admin-create-user-form";

export const dynamic = "force-dynamic";

async function getUsers(params: { q?: string; role?: string; status?: string; country?: string; kyc?: string }) {
  try {
    const admin = createAdminClient();
    let query = admin
      .from("profiles")
      .select("id,full_name,email,phone,country,role,status,customer_kyc_status,customer_risk_level,payment_method_valid,created_at,updated_at,sellers(id,status,level)")
      .order("updated_at", { ascending: false })
      .limit(60);

    if (params.role) query = query.eq("role", params.role);
    if (params.status) query = query.eq("status", params.status);
    if (params.country) query = query.ilike("country", `%${params.country}%`);
    if (params.kyc) query = query.eq("customer_kyc_status", params.kyc);
    if (params.q) {
      const q = `%${params.q}%`;
      query = query.or(`full_name.ilike.${q},email.ilike.${q},phone.ilike.${q}`);
    }

    const { data } = await query;
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const users = await getUsers(params);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
        <Badge>Usuarios</Badge>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-msm-ink">Administracion de usuarios</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Clientes, VIP, economia, administradores, KYC, riesgo y acciones auditadas.</p>
          </div>
          <Link href="/dashboard/admin" className="inline-flex min-h-11 items-center rounded-md border border-msm-line bg-white px-4 text-sm font-bold text-msm-blue">
            Volver admin
          </Link>
        </div>

        <details className="mt-4 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-msm-blue">
            <UserPlus size={16} /> Crear nuevo usuario
          </summary>
          <div className="mt-4">
            <AdminCreateUserForm />
          </div>
        </details>

        <form className="mt-5 grid gap-3 rounded-lg border border-msm-line bg-white p-4 shadow-soft md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <Input name="q" placeholder="Buscar nombre, correo o telefono" defaultValue={params.q ?? ""} className="pl-10" />
          </label>
          <Select name="role" defaultValue={params.role ?? ""}>
            <option value="">Todos los roles</option>
            <option value="cliente">cliente</option>
            <option value="vendedor_vip">vendedor_vip</option>
            <option value="administrador">administrador</option>
            <option value="administrador_economico">administrador_economico</option>
            <option value="superadmin">superadmin</option>
          </Select>
          <Select name="status" defaultValue={params.status ?? ""}>
            <option value="">Todos estados</option>
            <option value="activo">activo</option>
            <option value="pausado">pausado</option>
            <option value="bloqueado">bloqueado</option>
          </Select>
          <Select name="kyc" defaultValue={params.kyc ?? ""}>
            <option value="">KYC todos</option>
            <option value="pendiente">pendiente</option>
            <option value="requiere_revision">requiere_revision</option>
            <option value="aprobado">aprobado</option>
            <option value="rechazado">rechazado</option>
          </Select>
          <Input name="country" placeholder="Pais" defaultValue={params.country ?? ""} />
          <button className="inline-flex min-h-11 items-center justify-center rounded-md bg-msm-blue px-4 text-sm font-bold text-white">Filtrar</button>
        </form>

        <div className="mt-5 overflow-x-auto rounded-lg border border-msm-line bg-white shadow-soft">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-msm-midnight text-white">
              <tr>
                <th className="p-3">Usuario</th>
                <th className="p-3">Contacto</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Estado</th>
                <th className="p-3">KYC</th>
                <th className="p-3">Riesgo</th>
                <th className="p-3">VIP</th>
                <th className="p-3">Accion</th>
              </tr>
            </thead>
            <tbody>
              {users.length ? users.map((user) => {
                const row = user as unknown as {
                  id: string;
                  full_name?: string | null;
                  email?: string | null;
                  phone?: string | null;
                  country?: string | null;
                  role?: string | null;
                  status?: string | null;
                  customer_kyc_status?: string | null;
                  customer_risk_level?: string | null;
                  sellers?: { id?: string; status?: string; level?: string } | { id?: string; status?: string; level?: string }[];
                };
                const seller = Array.isArray(row.sellers) ? row.sellers[0] : row.sellers;
                return (
                  <tr key={row.id} className="border-t border-msm-line">
                    <td className="p-3">
                      <p className="font-bold">{row.full_name ?? "Sin nombre"}</p>
                      <p className="text-xs text-slate-500">{row.id}</p>
                    </td>
                    <td className="p-3">
                      <p>{row.email}</p>
                      <p className="text-xs text-slate-500">{row.phone ?? "sin telefono"} / {row.country ?? "sin pais"}</p>
                    </td>
                    <td className="p-3"><Badge>{row.role ?? "cliente"}</Badge></td>
                    <td className="p-3">{row.status ?? "activo"}</td>
                    <td className="p-3">{row.customer_kyc_status ?? "pendiente"}</td>
                    <td className="p-3">{row.customer_risk_level ?? "normal"}</td>
                    <td className="p-3">{seller?.id ? `${seller.level} / ${seller.status}` : "No"}</td>
                    <td className="p-3">
                      <Link href={`/dashboard/admin/users/${row.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-msm-blue px-3 text-xs font-bold text-white">
                        <UserCog size={15} /> Ver
                      </Link>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={8} className="p-5 text-slate-600">Sin usuarios para esos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
  );
}
