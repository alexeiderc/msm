import Image from "next/image";
import Link from "next/link";
import { MapPin, ShieldCheck, ShoppingBag, Store, UserPlus, WalletCards } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  officialStoreFallback,
  officialStoreProductsFallback,
  officialStoreSlug
} from "@/lib/demo-msm-store";

export const dynamic = "force-dynamic";

async function getVipStore(slug: string) {
  try {
    const admin = createAdminClient();
    const { data: store } = await admin
      .from("stores")
      .select("id,name,slug,type,status,owner_name,company_name,phone,whatsapp,email,province,municipality,address,description,warranty,categories,services_active,delivery_zones,pickup_available,delivery_available,transfer_available,remittances_active,remittance_delivery_methods,remittance_municipalities,cash_available,remittance_daily_limit,remittance_eta,remittance_evidence_mode,reputation_label,is_featured,sellers(level,status,daily_capacity,max_confirm_minutes)")
      .eq("slug", slug)
      .eq("status", "activo")
      .eq("is_active", true)
      .maybeSingle();

    if (!store) {
      return slug === officialStoreSlug
        ? { store: officialStoreFallback, products: officialStoreProductsFallback }
        : null;
    }

    const { data: products } = await admin
      .from("products")
      .select("id,name,slug,price,currency,stock,province,municipality,delivery_zone,warranty,promised_sla,availability,product_images(url),categories(name)")
      .eq("store_id", store.id)
      .eq("is_active", true)
      .eq("status", "activo")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    return { store, products: products ?? [] };
  } catch {
    return slug === officialStoreSlug
      ? { store: officialStoreFallback, products: officialStoreProductsFallback }
      : null;
  }
}

export default async function VipPublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getVipStore(slug);

  if (!result) {
    return (
      <AppShell>
        <section className="mx-auto max-w-4xl px-4 py-12">
          <Badge>Perfil VIP</Badge>
          <h1 className="mt-3 text-3xl font-bold">Perfil no disponible</h1>
          <p className="mt-3 text-slate-600">La tienda no esta activa, fue pausada o no existe.</p>
        </section>
      </AppShell>
    );
  }

  const storeRow = result.store as unknown as {
    id: string;
    name: string;
    type: string;
    owner_name?: string | null;
    company_name?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    province?: string | null;
    municipality?: string | null;
    address?: string | null;
    description?: string | null;
    warranty?: string | null;
    categories?: string[];
    services_active?: string[];
    delivery_zones?: string[];
    pickup_available?: boolean;
    delivery_available?: boolean;
    transfer_available?: boolean;
    remittances_active?: boolean;
    remittance_delivery_methods?: string[];
    remittance_municipalities?: string[];
    cash_available?: string | number | null;
    remittance_daily_limit?: string | number | null;
    remittance_eta?: string | null;
    remittance_evidence_mode?: string | null;
    reputation_label?: string | null;
    sellers?: { level?: string; status?: string; daily_capacity?: number; max_confirm_minutes?: number } | { level?: string; status?: string; daily_capacity?: number; max_confirm_minutes?: number }[];
  };
  const seller = Array.isArray(storeRow.sellers) ? storeRow.sellers[0] : storeRow.sellers;

  return (
    <AppShell>
      <section className="border-b border-white/10 bg-msm-midnight text-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <Badge className="border-white/20 bg-white/10 text-msm-ice">
            {storeRow.type === "tienda_oficial" ? "Tienda oficial" : "Vendedor VIP"}
          </Badge>
          <h1 className="mt-4 text-4xl font-bold md:text-6xl">{storeRow.name}</h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-msm-ice/80">{storeRow.description}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
            <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2">
              <MapPin size={16} /> {storeRow.municipality}, {storeRow.province}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2">
              <ShieldCheck size={16} /> {storeRow.reputation_label ?? seller?.level ?? "VIP verificado"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2">
              <Store size={16} /> {storeRow.company_name ?? storeRow.owner_name ?? "Vendedor independiente"}
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/auth/signup"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-msm-blue px-4 text-sm font-bold text-white shadow-glow"
            >
              <UserPlus size={17} /> Crear cuenta
            </Link>
            <Link
              href="#productos"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 text-sm font-bold text-white"
            >
              <ShoppingBag size={17} /> Ver productos
            </Link>
            {storeRow.remittances_active ? (
              <Link
                href="/remittances"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 text-sm font-bold text-white"
              >
                <WalletCards size={17} /> Crear remesa
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 pb-24 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="grid gap-4">
          <article className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="font-bold">Informacion del VIP</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <span>Propietario: {storeRow.owner_name ?? "No publicado"}</span>
              <span>Compania: {storeRow.company_name ?? "Independiente"}</span>
              <span>WhatsApp: {storeRow.whatsapp ?? storeRow.phone ?? "Por confirmar"}</span>
              <span>Correo: {storeRow.email ?? "Por confirmar"}</span>
              <span>Zonas: {storeRow.delivery_zones?.join(", ") || "Por confirmar"}</span>
              <span>Garantia: {storeRow.warranty ?? "Segun producto"}</span>
            </div>
          </article>

          <article className="rounded-lg border border-blue-100 bg-white p-4 shadow-soft">
            <h2 className="font-bold">Cuenta y confianza</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Crea tu cuenta para guardar datos, seguir ordenes, subir comprobantes y recibir ayuda
              durante la compra.
            </p>
            <div className="mt-4 grid gap-2">
              <Link
                href="/auth/signup"
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-msm-blue px-4 text-sm font-bold text-white"
              >
                Crear cuenta MSM
              </Link>
              <Link
                href="/account/kyc"
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-100 bg-blue-50 px-4 text-sm font-bold text-msm-blue"
              >
                Validar mis datos
              </Link>
            </div>
          </article>

          <article className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
            <h2 className="font-bold">Entregas y servicios</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {storeRow.delivery_available ? <Badge>Domicilio</Badge> : null}
              {storeRow.pickup_available ? <Badge>Pickup</Badge> : null}
              {storeRow.transfer_available ? <Badge>Transferencia</Badge> : null}
              {storeRow.services_active?.map((service) => <Badge key={service}>{service}</Badge>)}
            </div>
          </article>

          {storeRow.remittances_active ? (
            <article className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-soft">
              <h2 className="flex items-center gap-2 font-bold text-msm-ink"><WalletCards size={18} />Remesas por zona</h2>
              <div className="mt-3 grid gap-2 text-sm text-msm-ink">
                <span>Entrega: {storeRow.remittance_delivery_methods?.join(", ") || "efectivo / transferencia"}</span>
                <span>Municipios: {storeRow.remittance_municipalities?.join(", ") || storeRow.municipality}</span>
                <span>Efectivo disponible: {storeRow.cash_available ? currency(Number(storeRow.cash_available)) : "por confirmar"}</span>
                <span>Limite diario: {storeRow.remittance_daily_limit ? currency(Number(storeRow.remittance_daily_limit)) : "por confirmar"}</span>
                <span>Tiempo estimado: {storeRow.remittance_eta ?? "24h a 72h"}</span>
                <span>Evidencia: {storeRow.remittance_evidence_mode ?? "foto, firma o OTP"}</span>
              </div>
              <Link href="/remittances" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-msm-blue px-4 text-sm font-bold text-white">
                Crear remesa
              </Link>
            </article>
          ) : null}
        </aside>

        <div id="productos">
          <h2 className="text-2xl font-bold">Productos y servicios activos</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {result.products.map((product) => {
              const row = product as unknown as {
                id: string;
                name: string;
                price: string | number;
                currency?: string;
                stock: string | number;
                province?: string | null;
                municipality?: string | null;
                delivery_zone?: string | null;
                warranty?: string | null;
                promised_sla?: string | null;
                availability?: string | null;
                product_images?: { url?: string } | { url?: string }[];
                categories?: { name?: string } | { name?: string }[];
              };
              const image = Array.isArray(row.product_images) ? row.product_images[0]?.url : row.product_images?.url;
              const category = Array.isArray(row.categories) ? row.categories[0]?.name : row.categories?.name;

              return (
                <article key={row.id} className="overflow-hidden rounded-lg border border-msm-line bg-white shadow-soft">
                  <div className="relative aspect-[4/3] bg-msm-cloud">
                    <Image
                      src={image ?? "/brand/msm-my-store-logo.jpeg"}
                      alt={row.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 92vw, 38vw"
                      quality={62}
                    />
                  </div>
                  <div className="grid gap-2 p-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge>{category ?? "Producto"}</Badge>
                      <Badge className="border-blue-200 text-msm-blue">{row.municipality ?? storeRow.municipality}</Badge>
                    </div>
                    <h3 className="font-bold">{row.name}</h3>
                    <p className="text-sm text-slate-600">Zona: {row.delivery_zone ?? storeRow.delivery_zones?.[0] ?? storeRow.municipality}</p>
                    <p className="text-sm text-slate-600">Entrega: {row.promised_sla ?? "48h"} - {row.availability ?? "stock real o por confirmar"}</p>
                    <p className="text-sm text-slate-600">Garantia: {row.warranty ?? storeRow.warranty ?? "segun vendedor"}</p>
                    <div className="flex items-center justify-between">
                      <strong>{currency(Number(row.price))}</strong>
                      <span className="text-xs text-slate-500">{row.stock} disponibles</span>
                    </div>
                    <Link href={`/checkout?product=${row.id}`} className="inline-flex min-h-10 items-center justify-center rounded-md bg-msm-blue px-4 text-sm font-bold text-white">
                      Comprar
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
