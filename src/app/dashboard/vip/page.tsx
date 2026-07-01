  import { Clock, Eye, EyeOff, Package } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/dashboard/metric-card";
import {
  DeliveryEvidenceForm,
  ProductToggleForm,
  SellerAgreementForm,
  StaticOrderButtonsNotice,
  StockUpdateForm,
  VipOrderStatusForm,
  VipProductForm
} from "@/components/dashboard/vip-forms";
import { createClient } from "@/lib/supabase/server";

const orders = [
  ["MSM-20260619-A1B2C3", "confirmada_vip", "Combo familiar basico", "Santiago de Cuba"],
  ["MSM-20260619-D4E5F6", "preparando", "Kit solar compacto", "La Habana"]
];

export const dynamic = "force-dynamic";

async function getVipOrders() {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: seller } = await supabase
      .from("sellers")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!seller) return [];

    const { data } = await supabase
      .from("orders")
      .select("id,order_number,status,receiver_full_name,receiver_phone,address,delivery_window,customer_risk_level,customer_risk_score,vip_delivery_unlocked_at,delivery_otp_required")
      .eq("seller_id", seller.id)
      .order("created_at", { ascending: false })
      .limit(10);

    return data ?? [];
  } catch {
    return [];
  }
}

function canVipSeeDeliveryDetails(status?: string | null) {
  return Boolean(status && status !== "pendiente_pago" && status !== "cancelada");
}

async function getVipZones() {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return ["Santiago de Cuba", "Palma Soriano", "Habana Vieja"];

    const { data: seller } = await supabase
      .from("sellers")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!seller) return ["Santiago de Cuba", "Palma Soriano", "Habana Vieja"];

    const { data: stores } = await supabase
      .from("stores")
      .select("delivery_zones")
      .eq("seller_id", seller.id)
      .limit(3);

    const zones = stores?.flatMap((store) => store.delivery_zones ?? []) ?? [];
    return zones.length ? Array.from(new Set(zones)) : ["Santiago de Cuba", "Palma Soriano", "Habana Vieja"];
  } catch {
    return ["Santiago de Cuba", "Palma Soriano", "Habana Vieja"];
  }
}

async function getVipProfile() {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: seller } = await supabase
      .from("sellers")
      .select("id,level,status,daily_capacity,operation_zone,stores(id,name,slug,type,status,province,municipality,delivery_zones,categories,services_active,remittances_active,remittance_delivery_methods,cash_available,remittance_daily_limit,remittance_eta,reputation_label)")
      .eq("profile_id", user.id)
      .maybeSingle();

    return seller;
  } catch {
    return null;
  }
}

async function getVipProducts() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: seller } = await supabase
      .from("sellers").select("id").eq("profile_id", user.id).maybeSingle();
    if (!seller) return [];

    const { data: stores } = await supabase
      .from("stores").select("id").eq("seller_id", seller.id);
    const storeIds = stores?.map((s) => s.id) ?? [];
    if (!storeIds.length) return [];

    const { data } = await supabase
      .from("products")
      .select("id,name,slug,price,currency,stock,status,is_active,created_at,categories(name)")
      .in("store_id", storeIds)
      .order("created_at", { ascending: false })
      .limit(50);

    return data ?? [];
  } catch {
    return [];
  }
}

export default async function VipDashboardPage() {
  const vipOrders = await getVipOrders();
  const vipZones = await getVipZones();
  const vipProfile = await getVipProfile();
  const vipProducts = await getVipProducts();
  const firstStore = Array.isArray(vipProfile?.stores) ? vipProfile?.stores[0] : vipProfile?.stores;

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="border-blue-200 text-msm-blue">Panel vendedor VIP</Badge>
            <h1 className="mt-3 text-3xl font-bold">Operaciones, stock y entregas</h1>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Saldo acumulado" value="$1,284.30" detail="Neto vendedor pendiente" />
          <MetricCard label="Capacidad diaria" value="8 / 12" detail="Ordenes asignadas hoy" />
          <MetricCard label="Stock activo" value="34" detail="Productos publicados" />
          <MetricCard label="Cumplimiento" value="97%" detail="Ultimos 30 dias" />
        </div>

        <section className="mt-6 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-bold">Mi perfil VIP</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Perfil publico y operativo conectado a productos, servicios, remesas, ordenes y evidencia.
              </p>
            </div>
            <Badge>{firstStore?.type ?? "vendedor_independiente"}</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-msm-line p-4">
              <p className="text-sm font-semibold text-slate-500">Tienda</p>
              <p className="mt-1 font-bold">{firstStore?.name ?? "Tienda VIP no creada"}</p>
              <p className="mt-1 text-sm text-slate-600">{firstStore?.municipality ?? "Municipio"} / {firstStore?.province ?? "Provincia"}</p>
            </div>
            <div className="rounded-lg border border-msm-line p-4">
              <p className="text-sm font-semibold text-slate-500">Nivel y estado</p>
              <p className="mt-1 font-bold">{vipProfile?.level ?? "sin nivel"}</p>
              <p className="mt-1 text-sm text-slate-600">{firstStore?.status ?? vipProfile?.status ?? "pendiente"}</p>
            </div>
            <div className="rounded-lg border border-msm-line p-4">
              <p className="text-sm font-semibold text-slate-500">Remesas</p>
              <p className="mt-1 font-bold">{firstStore?.remittances_active ? "Activas" : "No activas"}</p>
              <p className="mt-1 text-sm text-slate-600">{firstStore?.remittance_eta ?? "Tiempo por definir"}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            {((firstStore?.categories ?? []) as string[]).map((category) => (
              <span key={category} className="rounded-md bg-msm-cloud px-3 py-2 text-slate-600">{category}</span>
            ))}
            {((firstStore?.services_active ?? []) as string[]).map((service) => (
              <span key={service} className="rounded-md bg-blue-50 px-3 py-2 text-msm-blue">{service}</span>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
          <div className="flex items-center gap-2">
            <Package className="text-msm-blue" size={20} />
            <h2 className="text-lg font-bold">Mis productos ({vipProducts.length})</h2>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-msm-midnight text-white">
                <tr>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vipProducts.length ? vipProducts.map((product) => {
                  const row = product as unknown as {
                    id: string;
                    name: string;
                    slug: string;
                    price: number | string;
                    currency?: string;
                    stock: number | string;
                    status: string;
                    is_active: boolean;
                    categories?: { name?: string } | { name?: string }[];
                  };
                  const category = Array.isArray(row.categories) ? row.categories[0]?.name : row.categories?.name;
                  return (
                    <tr key={row.id} className="border-t border-msm-line">
                      <td className="p-3">
                        <Link href={`/products/${row.slug}`} className="font-bold text-msm-blue hover:underline">
                          {row.name}
                        </Link>
                        <p className="text-xs text-slate-500">ID: {row.id}</p>
                      </td>
                      <td className="p-3">{category ?? "Sin categoria"}</td>
                      <td className="p-3">${Number(row.price).toFixed(2)} {row.currency ?? "USD"}</td>
                      <td className="p-3">{Number(row.stock)}</td>
                      <td className="p-3">
                        <Badge>{row.is_active ? "activo" : row.status}</Badge>
                      </td>
                      <td className="p-3">
                        <ProductToggleForm productId={row.id} isActive={row.is_active} />
                      </td>
                    </tr>
                  );
                }) : (
                  <tr className="border-t border-msm-line">
                    <td className="p-3 text-slate-600" colSpan={6}>Sin productos todavia. Publica tu primer producto desde el formulario de abajo.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-msm-silver bg-msm-midnight p-4 text-white shadow-lift">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold">Pestanas VIP por municipio</h2>
              <p className="mt-1 text-sm text-msm-ice/75">
                Cada VIP organiza productos, servicios y remesas segun los municipios donde opera.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {vipZones.map((zone) => (
                <span key={zone} className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold">
                  {zone}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <a href="#productos-vip" className="rounded-lg border border-white/15 bg-white/10 p-4 transition hover:bg-white/15">
              <p className="font-bold">Productos</p>
              <p className="mt-1 text-sm text-msm-ice/75">Catalogo, precio, stock, imagen, SLA y zonas.</p>
            </a>
            <a href="#remesas-vip" className="rounded-lg border border-white/15 bg-white/10 p-4 transition hover:bg-white/15">
              <p className="font-bold">Remesas</p>
              <p className="mt-1 text-sm text-msm-ice/75">Disponibilidad de efectivo, transferencia y capacidad diaria.</p>
            </a>
            <a href="#servicios-vip" className="rounded-lg border border-white/15 bg-white/10 p-4 transition hover:bg-white/15">
              <p className="font-bold">Servicios</p>
              <p className="mt-1 text-sm text-msm-ice/75">Servicios locales publicados como categoria Servicios.</p>
            </a>
          </div>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <section id="productos-vip" className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="text-lg font-bold">Producto rapido</h2>
            <VipProductForm />
            <div className="mt-6 border-t border-msm-line pt-4">
              <h3 className="font-bold">Editar stock existente</h3>
              <StockUpdateForm />
            </div>
          </section>

          <section className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="text-lg font-bold">Ordenes asignadas</h2>
            <div className="mt-4 grid gap-3">
              {vipOrders.length ? vipOrders.map((order) => (
                <article key={order.id} className="rounded-lg border border-msm-line p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold">{order.order_number}</p>
                      {canVipSeeDeliveryDetails(order.status) ? (
                        <div className="text-sm text-slate-600">
                          <p>{order.receiver_full_name} - {order.address}</p>
                          <p>{order.receiver_phone} - {order.delivery_window}</p>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-amber-700">
                          Datos de entrega bloqueados hasta aprobacion economica.
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        Riesgo cliente: {order.customer_risk_level ?? "normal"} / {order.customer_risk_score ?? 0}
                        {order.delivery_otp_required ? " - OTP requerido" : ""}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">ID: {order.id}</p>
                    </div>
                    <Badge>{order.status}</Badge>
                  </div>
                  <StaticOrderButtonsNotice />
                </article>
              )) : orders.map(([number, status, product, zone]) => (
                <article key={number} className="rounded-lg border border-msm-line p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold">{number}</p>
                      <p className="text-sm text-slate-600">{product} - {zone}</p>
                    </div>
                    <Badge>{status}</Badge>
                  </div>
                  <StaticOrderButtonsNotice />
                </article>
              ))}
            </div>
            <div className="mt-5 border-t border-msm-line pt-4">
              <h3 className="flex items-center gap-2 font-bold"><Clock size={17} />Accion real por ID de orden</h3>
              <VipOrderStatusForm />
              <div className="mt-5 border-t border-msm-line pt-4">
                <h3 className="font-bold">Evidencia de entrega</h3>
                <DeliveryEvidenceForm />
              </div>
            </div>
          </section>
        </div>

        <section id="remesas-vip" className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="text-lg font-bold">Remesas por municipio</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Aqui el VIP define donde puede apoyar entregas de efectivo o confirmaciones locales.
              La solicitud y revision economica se crean desde `/remittances`.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {vipZones.map((zone) => (
                <span key={zone} className="rounded-md bg-blue-50 px-3 py-2 text-xs font-bold text-msm-blue">
                  Remesas activas: {zone}
                </span>
              ))}
            </div>
          </article>
          <article id="servicios-vip" className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="text-lg font-bold">Servicios VIP</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Para publicar un servicio, usa el formulario de producto y selecciona categoria `Servicios`.
              El servicio quedara visible en catalogo y podra venderse con orden, pago y evidencia.
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
          <h2 className="text-lg font-bold">Acuerdo digital vendedor VIP</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            El vendedor acepta responsabilidad por veracidad, disponibilidad, precio, entrega, calidad, garantia, evidencia, tiempos de respuesta y cumplimiento. MSM cobra comision, organiza plataforma, controla pagos y puede suspender por fraude, incumplimiento, reclamos repetidos o datos falsos.
          </p>
          <SellerAgreementForm />
        </section>
      </section>
    </AppShell>
  );
}
