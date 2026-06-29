import Link from "next/link";
import { MapPin, ShieldCheck, Store, UserPlus } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { officialStoreFallback } from "@/lib/demo-msm-store";

export const dynamic = "force-dynamic";

const fallbackStores = [officialStoreFallback];

async function getVerifiedStores() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("stores")
      .select("id,name,slug,type,province,municipality,description,reputation_label,remittances_active,categories,is_featured")
      .eq("status", "activo")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(24);

    return data?.length ? data : fallbackStores;
  } catch {
    return fallbackStores;
  }
}

export default async function VerifiedSellersPage() {
  const stores = await getVerifiedStores();

  return (
    <AppShell>
      <section className="border-b border-white/10 bg-msm-midnight text-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <Badge className="border-white/20 bg-white/10 text-msm-ice">Tiendas VIP</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold md:text-6xl">
            Tiendas y perfiles VIP por provincia, municipio y zona real.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-msm-ice/80">
            Aqui se ve MSM my store como tienda oficial y tambien los vendedores VIP independientes:
            ubicacion, categorias, servicios, remesas activas, reputacion y productos publicados.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/auth/signup"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-msm-blue px-4 text-sm font-bold text-white shadow-glow"
            >
              <UserPlus size={17} /> Crear cuenta
            </Link>
            <Link
              href="/vendedores/solicitud"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/20 bg-white/10 px-4 text-sm font-bold text-white"
            >
              Solicitar perfil VIP
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 pb-24">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <article key={store.id} className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge className={store.type === "tienda_oficial" ? "border-blue-200 text-msm-blue" : ""}>
                    {store.type === "tienda_oficial" ? "tienda oficial" : "vendedor VIP"}
                  </Badge>
                  <h2 className="mt-3 text-xl font-bold">{store.name}</h2>
                </div>
                <Store className="text-msm-blue" size={22} />
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{store.description}</p>
              <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
                <span className="inline-flex items-center gap-2"><MapPin size={16} />{store.municipality}, {store.province}</span>
                <span className="inline-flex items-center gap-2"><ShieldCheck size={16} />{store.reputation_label ?? "VIP verificado"}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {((store.categories ?? []) as string[]).slice(0, 4).map((category) => (
                  <span key={category} className="rounded-md bg-msm-cloud px-2 py-1 text-xs font-bold text-slate-600">
                    {category}
                  </span>
                ))}
                {store.remittances_active ? <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-msm-blue">remesas</span> : null}
              </div>
              <Link
                href={`/vendedores/${store.slug}`}
                className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-msm-blue px-4 text-sm font-bold text-white"
              >
                Ver tienda o perfil VIP
              </Link>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
