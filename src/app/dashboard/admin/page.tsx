import Link from "next/link";
import { ArrowRightLeft, Ban, ClipboardCheck, Eye, FileWarning, Percent, QrCode, ShoppingBag, UserCheck, UsersRound, WalletCards } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/dashboard/metric-card";
import {
  AdminStoreProductForm,
  ApproveSellerForm,
  ManualVipStoreForm,
  ReassignOrderForm,
  ReviewCustomerKycForm,
  ReviewSellerApplicationForm,
  SellerCommissionForm
} from "@/components/dashboard/admin-forms";
import { createAdminClient } from "@/lib/supabase/admin";

const reviewQueue = [
  ["Vendedor VIP Demo", "KYC pendiente", "Santiago de Cuba"],
  ["FerreVIP Camaguey", "Producto por revisar", "Camaguey"]
];

const sellerApplications = [
  ["Solicitud VIP Santiago", "mas informacion", "Alimentos, servicios"],
  ["Solicitud VIP Habana", "en_revision", "Energia solar"]
];

export const dynamic = "force-dynamic";

async function getAdminQueues() {
  try {
    const admin = createAdminClient();
    const [{ data: sellers }, { data: applications }] = await Promise.all([
      admin
        .from("sellers")
        .select("id,status,operation_zone,profiles(full_name)")
        .neq("status", "aprobado")
        .limit(8),
      admin
        .from("seller_applications")
        .select("id,full_name,status,categories")
        .order("created_at", { ascending: false })
        .limit(8)
    ]);

    return {
      sellers: sellers ?? [],
      applications: applications ?? []
    };
  } catch {
    return { sellers: [], applications: [] };
  }
}

async function getVipStores() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("stores")
      .select("id,name,slug,type,status,province,municipality,categories,services_active,remittances_active,is_featured,sellers(id,level,status)")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20);

    return data ?? [];
  } catch {
    return [];
  }
}

async function getCustomerKycQueue() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("id,full_name,email,phone,country,customer_kyc_status,customer_risk_level,payment_method_valid,payment_app_name,payment_account_owner,updated_at")
      .eq("role", "cliente")
      .neq("customer_kyc_status", "aprobado")
      .order("updated_at", { ascending: false })
      .limit(12);

    return data ?? [];
  } catch {
    return [];
  }
}

export default async function AdminDashboardPage() {
  const adminQueues = await getAdminQueues();
  const vipStores = await getVipStores();
  const customerKycQueue = await getCustomerKycQueue();
  const queueItems = adminQueues.sellers.length
    ? adminQueues.sellers.map((seller) => {
        const row = seller as unknown as {
          id: string;
          status: string;
          operation_zone?: string | null;
          profiles?: { full_name?: string } | { full_name?: string }[];
        };

        return {
          id: row.id,
          name: Array.isArray(row.profiles) ? row.profiles[0]?.full_name : row.profiles?.full_name,
          status: row.status,
          zone: row.operation_zone ?? "Zona sin definir"
        };
      })
    : reviewQueue.map(([name, status, zone]) => ({ id: "", name, status, zone }));
  const applicationItems = adminQueues.applications.length
    ? adminQueues.applications.map((application) => ({
        id: application.id,
        title: application.full_name,
        status: application.status,
        categories: Array.isArray(application.categories) ? application.categories.join(", ") : "Sin categorias"
      }))
    : sellerApplications.map(([title, status, categories]) => ({ id: "", title, status, categories }));

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
        <Badge>Panel administrador</Badge>
        <h1 className="mt-3 text-3xl font-bold">Confianza, cumplimiento y auditoria</h1>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="KYC pendientes" value="12" detail="Vendedores en revision" />
          <MetricCard label="Tiendas activas" value="38" detail="VIP verificados" />
          <MetricCard label="Incidencias abiertas" value="5" detail="Requieren accion" />
          <MetricCard label="Logs auditables" value="1,928" detail="Eventos registrados" />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="text-lg font-bold">Cola de aprobacion</h2>
            <div className="mt-4 grid gap-3">
              {queueItems.map((item) => (
                <article key={item.id || item.name} className="rounded-lg border border-msm-line p-4">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-sm text-slate-600">{item.zone}</p>
                      {item.id ? <p className="mt-1 text-xs text-slate-500">ID vendedor: {item.id}</p> : null}
                    </div>
                    <Badge>{item.status}</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 md:grid-cols-4">
                    <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-msm-line px-2"><UserCheck size={15} />Aprobar</span>
                    <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-msm-line px-2"><Eye size={15} />KYC</span>
                    <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-msm-line px-2"><Ban size={15} />Suspender</span>
                    <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-msm-line px-2"><Percent size={15} />Comision</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="text-lg font-bold">Controles administrativos</h2>
            <div className="mt-4 grid gap-3 text-sm">
              <span className="flex items-center gap-3 rounded-md border border-msm-line p-3 text-left font-semibold">
                <ClipboardCheck size={18} /> Revisar productos y activar tiendas
              </span>
              <span className="flex items-center gap-3 rounded-md border border-msm-line p-3 text-left font-semibold">
                <FileWarning size={18} /> Reasignar pedidos e incidencias
              </span>
              <span className="flex items-center gap-3 rounded-md border border-msm-line p-3 text-left font-semibold">
                <Eye size={18} /> Ver audit_logs y acciones sensibles
              </span>
              <Link href="/dashboard/admin/users" className="flex items-center gap-3 rounded-md border border-msm-line p-3 text-left font-semibold text-msm-blue hover:border-msm-blue">
                <UsersRound size={18} /> Administrar usuarios y roles
              </Link>
              <Link href="/dashboard/admin/whatsapp-carts" className="flex items-center gap-3 rounded-md border border-msm-line p-3 text-left font-semibold text-msm-blue hover:border-msm-blue">
                <ShoppingBag size={18} /> Pedidos WhatsApp
              </Link>
            </div>
            <ApproveSellerForm />
            <SellerCommissionForm />
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
          <h2 className="text-lg font-bold">Modulos financieros y Cajeros MSM</h2>
          <p className="mt-1 text-sm text-slate-600">
            Accesos de control para la segunda fase: billetera, reservas QR, cambios y Cajeros MSM Digital.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Link href="/atm" className="rounded-lg border border-msm-line p-4 transition hover:border-msm-blue">
              <QrCode className="text-msm-blue" size={22} />
              <h3 className="mt-3 font-bold">Cajeros MSM</h3>
              <p className="mt-1 text-sm text-slate-600">Reservas de efectivo, QR y futura red fisica.</p>
            </Link>
            <Link href="/wallet" className="rounded-lg border border-msm-line p-4 transition hover:border-msm-blue">
              <WalletCards className="text-msm-blue" size={22} />
              <h3 className="mt-3 font-bold">Billetera MSM</h3>
              <p className="mt-1 text-sm text-slate-600">Saldo, ledger, credito interno y reservas.</p>
            </Link>
            <Link href="/exchange" className="rounded-lg border border-msm-line p-4 transition hover:border-msm-blue">
              <ArrowRightLeft className="text-msm-blue" size={22} />
              <h3 className="mt-3 font-bold">Cambio seguro</h3>
              <p className="mt-1 text-sm text-slate-600">Cotizaciones y operaciones bajo revision economica.</p>
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
          <h2 className="text-lg font-bold">KYC clientes y riesgo de pagos</h2>
          <p className="mt-1 text-sm text-slate-600">
            Revision de clientes antes de liberar operaciones sensibles: titular de pago, riesgo, documento y
            contracargos.
          </p>
          <div className="mt-4 overflow-x-auto rounded-md border border-msm-line">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-msm-midnight text-white">
                <tr>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Pais</th>
                  <th className="p-3">Estado KYC</th>
                  <th className="p-3">Riesgo</th>
                  <th className="p-3">Metodo validado</th>
                  <th className="p-3">Titular pago</th>
                </tr>
              </thead>
              <tbody>
                {customerKycQueue.length ? customerKycQueue.map((profile) => (
                  <tr key={profile.id} className="border-t border-msm-line">
                    <td className="p-3">
                      <p className="font-bold">{profile.full_name ?? "Cliente sin nombre"}</p>
                      <p className="text-xs text-slate-500">{profile.email}</p>
                      <p className="text-xs text-slate-500">ID: {profile.id}</p>
                    </td>
                    <td className="p-3">{profile.country ?? "Sin pais"}</td>
                    <td className="p-3">{profile.customer_kyc_status ?? "pendiente"}</td>
                    <td className="p-3">{profile.customer_risk_level ?? "normal"}</td>
                    <td className="p-3">{profile.payment_method_valid ? "si" : "pendiente"}</td>
                    <td className="p-3">
                      <p>{profile.payment_account_owner ?? "Sin declarar"}</p>
                      <p className="text-xs text-slate-500">{profile.payment_app_name ?? "Sin app"}</p>
                    </td>
                  </tr>
                )) : (
                  <tr className="border-t border-msm-line">
                    <td className="p-3 text-slate-600" colSpan={6}>
                      Sin KYC de clientes pendiente o migracion no aplicada todavia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <ReviewCustomerKycForm />
        </section>

        <section className="mt-6 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
          <h2 className="text-lg font-bold">Vendedores VIP y tiendas por zona</h2>
          <p className="mt-1 text-sm text-slate-600">
            Perfiles operativos con provincia, municipio, tipo, estado, productos, servicios y remesas.
          </p>
          <div className="mt-4 overflow-x-auto rounded-md border border-msm-line">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-msm-midnight text-white">
                <tr>
                  <th className="p-3">Tienda / VIP</th>
                  <th className="p-3">Zona</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Nivel</th>
                  <th className="p-3">Categorias</th>
                  <th className="p-3">Servicios</th>
                  <th className="p-3">Remesas</th>
                </tr>
              </thead>
              <tbody>
                {vipStores.length ? vipStores.map((store) => {
                  const row = store as unknown as {
                    id: string;
                    name: string;
                    slug: string;
                    type: string;
                    status: string;
                    province?: string | null;
                    municipality?: string | null;
                    categories?: string[];
                    services_active?: string[];
                    remittances_active?: boolean;
                    is_featured?: boolean;
                    sellers?: { id?: string; level?: string; status?: string } | { id?: string; level?: string; status?: string }[];
                  };
                  const seller = Array.isArray(row.sellers) ? row.sellers[0] : row.sellers;

                  return (
                    <tr key={row.id} className="border-t border-msm-line">
                      <td className="p-3">
                        <p className="font-bold">{row.name}</p>
                        <p className="text-xs text-slate-500">ID tienda: {row.id}</p>
                        <p className="text-xs text-slate-500">ID vendedor: {seller?.id ?? "sin vendedor"}</p>
                      </td>
                      <td className="p-3">{row.municipality ?? "Sin municipio"} / {row.province ?? "Sin provincia"}</td>
                      <td className="p-3">{row.type}</td>
                      <td className="p-3">{row.status}</td>
                      <td className="p-3">{seller?.level ?? "sin nivel"}</td>
                      <td className="p-3">{row.categories?.join(", ") || "Sin categorias"}</td>
                      <td className="p-3">{row.services_active?.join(", ") || "Sin servicios"}</td>
                      <td className="p-3">{row.remittances_active ? "Activas" : "No"}</td>
                    </tr>
                  );
                }) : (
                  <tr className="border-t border-msm-line">
                    <td className="p-3 text-slate-600" colSpan={8}>Sin tiendas reales todavia. Usa el formulario para crear una.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ManualVipStoreForm />
            <AdminStoreProductForm />
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
          <h2 className="text-lg font-bold">Onboarding vendedor VIP</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {applicationItems.map((item) => (
              <article key={item.id || item.title} className="rounded-lg border border-msm-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="text-sm text-slate-600">{item.categories}</p>
                    {item.id ? <p className="mt-1 text-xs text-slate-500">ID solicitud: {item.id}</p> : null}
                  </div>
                  <Badge>{item.status}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 md:grid-cols-4">
                  <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-msm-line px-2"><UserCheck size={15} />Aprobar</span>
                  <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-msm-line px-2">Mas info</span>
                  <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-msm-line px-2">Rechazar</span>
                  <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-msm-line px-2">Suspender</span>
                </div>
              </article>
            ))}
          </div>
          <ReviewSellerApplicationForm />
        </section>

        <section className="mt-6 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
          <h2 className="text-lg font-bold">Soporte, SLA y antifraude</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-msm-line p-4">
              <p className="font-bold">Reasignacion SLA</p>
              <p className="mt-1 text-sm text-slate-600">Ordenes sin confirmacion VIP dentro de ventana configurada.</p>
            </div>
            <div className="rounded-lg border border-msm-line p-4">
              <p className="font-bold">Tickets por orden</p>
              <p className="mt-1 text-sm text-slate-600">Demora, daño, garantia, falta de entrega u otro.</p>
            </div>
            <div className="rounded-lg border border-msm-line p-4">
              <p className="font-bold">Alertas antifraude</p>
              <p className="mt-1 text-sm text-slate-600">Monto, pais, cuenta, metodo pausado o comprobante repetido.</p>
            </div>
          </div>
          <ReassignOrderForm />
        </section>
      </section>
    </AppShell>
  );
}
