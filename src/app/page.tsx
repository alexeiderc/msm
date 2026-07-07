import Link from "next/link";
import {
  ArrowRight,
  ArrowRightLeft,
  BadgeCheck,
  CircleDollarSign,
  Headphones,
  Home as HomeIcon,
  Info,
  MapPin,
  PackageSearch,
  QrCode,
  Search,
  ShieldCheck,
  Store,
  Truck,
  WalletCards
} from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { ElianaCommandCenter } from "@/components/ai/eliana-command-center";
import { ProductCard } from "@/components/marketplace/product-card";
import { officialPublicProductsFallback, officialStoreSlug } from "@/lib/demo-msm-store";
import { MobileHomeWrapper } from "@/components/mobile/mobile-home-wrapper";

const featuredProducts = officialPublicProductsFallback.slice(0, 3).map((product) => ({
  ...product,
  category: product.category ?? "Producto"
}));

const homeCategories = [
  ["Electrodomesticos", "/products?category=Electrodomesticos", Store],
  ["Alimentos", "/products?category=Alimentos", PackageSearch],
  ["Remesas", "/remittances", CircleDollarSign],
  ["Cambio", "/exchange", ArrowRightLeft],
  ["Cajeros", "/atm", QrCode],
  ["Tiendas VIP", "/tiendas-vip", BadgeCheck]
] as const;

const trustItems = [
  ["Pagos controlados", "Metodos manuales por pais, comprobantes revisados y cuentas rotativas.", CircleDollarSign],
  ["Vendedores VIP", "Solicitud, KYC, acuerdo digital, reputacion y zonas de entrega.", BadgeCheck],
  ["Ordenes auditadas", "Estados, eventos, SLA, evidencia de entrega, ledger y soporte.", Truck],
  ["Confianza centralizada", "MSM organiza tecnologia, pagos, trazabilidad, soporte y auditoria.", ShieldCheck]
] as const;

export default function Home() {
  return (
    <AppShell>
      <div className="block md:hidden">
        <MobileHomeWrapper />
      </div>

      {/* Desktop view */}
      <div className="hidden md:block">
        <section className="msm-hero-surface relative isolate overflow-hidden text-white">
          <div className="msm-scanlines absolute inset-0 opacity-20" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-5 px-4 py-6 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-10">
            <div>
              <Badge className="border-white/20 bg-white/10 text-msm-ice">msmmystore.com</Badge>
              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-normal text-white md:text-6xl">
                MSM my store
              </h1>
              <p className="msm-slogan mt-3 inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-bold text-white shadow-glow backdrop-blur md:text-xl">
                Rapidez - Excelencia - Seguridad
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-msm-ice md:text-lg">
                Compra productos, servicios y remesas con vendedores VIP verificados, pagos auditados
                y entrega local por provincia y municipio.
              </p>
              <form action="/products" className="mt-5 grid gap-2 rounded-lg border border-white/15 bg-white/12 p-2 shadow-glow backdrop-blur sm:grid-cols-[1fr_auto]">
                <label className="relative block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/55" size={18} />
                  <input
                    name="q"
                    placeholder="Buscar nevera, remesa, Segundo Frente..."
                    className="min-h-12 w-full rounded-md border border-white/15 bg-white/10 pl-10 pr-3 text-sm font-bold text-white outline-none placeholder:text-white/55 focus:border-msm-electric focus:bg-white/15"
                  />
                </label>
                <button className="inline-flex min-h-12 items-center justify-center rounded-md bg-msm-blue px-5 text-sm font-bold text-white shadow-glow">
                  Buscar
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                {homeCategories.map(([label, href, Icon]) => (
                  <Link key={href} href={href} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-xs font-bold text-white backdrop-blur transition hover:bg-white/18">
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-msm-blue px-5 text-sm font-bold text-white shadow-glow transition hover:bg-msm-electric"
                >
                  Ver productos
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href="/tiendas-vip"
                  className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/25 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                >
                  Tiendas VIP
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/25 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                >
                  Como funciona
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="msm-luminous-panel rounded-lg p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-msm-ice/80">Tienda oficial</p>
                    <h2 className="mt-1 text-2xl font-black text-white">Segundo Frente, Santiago de Cuba</h2>
                  </div>
                  <span className="grid h-12 w-12 place-items-center rounded-md bg-white text-msm-blue">
                    <HomeIcon size={22} />
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-white/10 p-3">
                    <p className="text-xl font-black">24h</p>
                    <p className="text-xs font-bold text-msm-ice/70">SLA</p>
                  </div>
                  <div className="rounded-md bg-white/10 p-3">
                    <p className="text-xl font-black">VIP</p>
                    <p className="text-xs font-bold text-msm-ice/70">Verificado</p>
                  </div>
                  <div className="rounded-md bg-white/10 p-3">
                    <p className="text-xl font-black">QR</p>
                    <p className="text-xs font-bold text-msm-ice/70">Futuro</p>
                  </div>
                </div>
                <Link href={`/vendedores/${officialStoreSlug}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-white text-sm font-bold text-msm-blue">
                  Ver tienda MSM
                </Link>
              </div>
              <ElianaCommandCenter compact />
            </div>
          </div>
        </section>

        <section className="border-b border-msm-line bg-white">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 py-7 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <Badge className="border-blue-200 bg-blue-50 text-msm-blue">Tienda oficial MSM</Badge>
              <h2 className="mt-3 text-2xl font-bold text-msm-ink">MSM my store - Segundo Frente, Santiago de Cuba</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Esta es tu tienda oficial dentro del sistema: productos, servicios, remesas, zonas de entrega,
                reputacion y perfil publico conectado al flujo de compra.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-slate-600">
                <span className="inline-flex items-center gap-2"><Store size={16} /> Tienda oficial MSM</span>
                <span className="inline-flex items-center gap-2"><MapPin size={16} /> Mayari Arriba y Segundo Frente</span>
                <span className="inline-flex items-center gap-2"><ShieldCheck size={16} /> Super VIP</span>
              </div>
            </div>
            <Link
              href={`/vendedores/${officialStoreSlug}`}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-msm-blue px-5 text-sm font-bold text-white shadow-glow transition hover:bg-msm-electric"
            >
              Ver mi tienda oficial
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-7 md:py-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge className="border-blue-200 bg-blue-50 text-msm-blue">Catalogo por tienda y zona</Badge>
              <h2 className="mt-3 text-3xl font-bold text-msm-ink">Productos y servicios destacados</h2>
              <p className="mt-2 text-slate-600">
                Productos publicados por perfiles VIP con provincia, municipio, zona de entrega y vendedor responsable.
              </p>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-msm-blue">
              Explorar catalogo <PackageSearch size={17} />
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-7">
          <div className="grid gap-3 rounded-lg border border-blue-100 bg-gradient-to-r from-msm-blue to-msm-navy p-4 text-white shadow-glow md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-bold text-msm-ice/80">Oferta operativa MSM</p>
              <h2 className="mt-1 text-2xl font-black">Productos, remesas, cambio y billetera en una sola app.</h2>
            </div>
            <Link href="/auth/signup" className="inline-flex min-h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-bold text-msm-blue">
              Crear cuenta
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-3 px-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(([title, detail, Icon]) => (
            <div key={title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-msm-blue">
                <Icon size={20} />
              </span>
              <p className="mt-3 font-bold text-msm-ink">{title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
            </div>
          ))}
          <Link href="/payment-methods" className="rounded-lg border border-msm-line bg-white p-5 shadow-lift transition hover:-translate-y-0.5 hover:border-msm-blue">
            <CircleDollarSign className="text-msm-blue" size={24} />
            <h3 className="mt-3 font-bold">Metodos activos</h3>
            <p className="mt-1 text-sm text-slate-600">Consulta pais, metodo y estado sin exponer cuentas.</p>
          </Link>
          <Link href="/quienes-somos" className="rounded-lg border border-msm-line bg-white p-5 shadow-lift transition hover:-translate-y-0.5 hover:border-msm-blue">
            <Info className="text-msm-blue" size={24} />
            <h3 className="mt-3 font-bold">Quienes somos</h3>
            <p className="mt-1 text-sm text-slate-600">Conoce la vision MSM: comercio, tecnologia, remesas, IA y comunidad.</p>
          </Link>
          <Link href="/tiendas-vip" className="rounded-lg border border-msm-line bg-white p-5 shadow-lift transition hover:-translate-y-0.5 hover:border-msm-blue">
            <BadgeCheck className="text-msm-blue" size={24} />
            <h3 className="mt-3 font-bold">Tiendas VIP y perfiles</h3>
            <p className="mt-1 text-sm text-slate-600">MSM oficial y vendedores por provincia, municipio y reputacion.</p>
          </Link>
          <Link href="/support" className="rounded-lg border border-msm-line bg-white p-5 shadow-lift transition hover:-translate-y-0.5 hover:border-msm-blue">
            <Headphones className="text-msm-blue" size={24} />
            <h3 className="mt-3 font-bold">Soporte centralizado</h3>
            <p className="mt-1 text-sm text-slate-600">Reclamaciones por orden, evidencia y cierre documentado.</p>
          </Link>
          <Link href="/remittances" className="rounded-lg border border-msm-line bg-white p-5 shadow-lift transition hover:-translate-y-0.5 hover:border-msm-blue">
            <CircleDollarSign className="text-msm-blue" size={24} />
            <h3 className="mt-3 font-bold">Remesas MSM</h3>
            <p className="mt-1 text-sm text-slate-600">Envios con revision economica, cuenta asignada y trazabilidad.</p>
          </Link>
          <Link href="/wallet" className="rounded-lg border border-msm-line bg-white p-5 shadow-lift transition hover:-translate-y-0.5 hover:border-msm-blue">
            <WalletCards className="text-msm-blue" size={24} />
            <h3 className="mt-3 font-bold">Billetera MSM</h3>
            <p className="mt-1 text-sm text-slate-600">Saldo, reservas, pagos manuales y ledger en una cuenta digital.</p>
          </Link>
          <Link href="/atm" className="rounded-lg border border-msm-line bg-white p-5 shadow-lift transition hover:-translate-y-0.5 hover:border-msm-blue">
            <QrCode className="text-msm-blue" size={24} />
            <h3 className="mt-3 font-bold">Cajeros MSM Digital</h3>
            <p className="mt-1 text-sm text-slate-600">Reserva de efectivo, QR temporal y futura red fisica MSM.</p>
          </Link>
          <Link href="/exchange" className="rounded-lg border border-msm-line bg-white p-5 shadow-lift transition hover:-translate-y-0.5 hover:border-msm-blue">
            <ArrowRightLeft className="text-msm-blue" size={24} />
            <h3 className="mt-3 font-bold">Cambio seguro</h3>
            <p className="mt-1 text-sm text-slate-600">Cotizaciones controladas sin publicar cuentas ni tasas sensibles.</p>
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
