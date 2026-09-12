import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Clock, MapPin, MessageCircle, ShieldCheck, ShoppingCart, Store } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/add-to-cart";
import { createAdminClient } from "@/lib/supabase/admin";
import { currency } from "@/lib/utils";
import { findFallbackProduct } from "@/lib/public-products";

export const dynamic = "force-dynamic";

type DetailProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency?: string;
  stock: number;
  category: string;
  store: string;
  storeSlug?: string;
  storeId?: string;
  sellerId?: string;
  country?: string;
  province: string;
  municipality?: string;
  deliveryZone?: string;
  warranty?: string;
  promisedSla?: string;
  availability?: string;
  image: string;
  gallery: string[];
};

function isDatabaseId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

async function getProduct(slug: string): Promise<DetailProduct | null> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("products")
      .select("id,name,slug,description,price,currency,stock,country,province,municipality,delivery_zone,warranty,promised_sla,availability,status,is_active,store_id,product_images(url),categories(name),stores(id,name,slug,status,is_active,country,province,municipality,delivery_zones,seller_id)")
      .eq("slug", slug)
      .eq("status", "activo")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (!data) throw new Error("No product");

    const row = data as unknown as {
      id: string;
      name: string;
      slug: string;
      description?: string | null;
      price: number | string;
      currency?: string | null;
      stock: number | string;
      country?: string | null;
      province?: string | null;
      municipality?: string | null;
      store_id?: string | null;
      delivery_zone?: string | null;
      warranty?: string | null;
      promised_sla?: string | null;
      availability?: string | null;
      product_images?: { url?: string } | { url?: string }[];
      categories?: { name?: string } | { name?: string }[];
      stores?: {
        name?: string;
        slug?: string;
        status?: string;
        is_active?: boolean;
        seller_id?: string | null;
        country?: string | null;
        province?: string | null;
        municipality?: string | null;
        delivery_zones?: string[];
      } | {
        name?: string;
        slug?: string;
        status?: string;
        is_active?: boolean;
        seller_id?: string | null;
        country?: string | null;
        province?: string | null;
        municipality?: string | null;
        delivery_zones?: string[];
      }[];
    };

    const store = Array.isArray(row.stores) ? row.stores[0] : row.stores;
    if (store?.status !== "activo" || store?.is_active !== true) throw new Error("Store inactive");

    const images = Array.isArray(row.product_images)
      ? row.product_images.map((image) => image.url).filter((url): url is string => Boolean(url))
      : row.product_images?.url
        ? [row.product_images.url]
        : [];
    const category = Array.isArray(row.categories) ? row.categories[0]?.name : row.categories?.name;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      price: Number(row.price),
      currency: row.currency ?? "USD",
      stock: Number(row.stock),
      category: category ?? "Producto",
      store: store?.name ?? "Tienda VIP",
      storeSlug: store?.slug,
      storeId: row.store_id ?? undefined,
      sellerId: store?.seller_id ?? undefined,
      country: row.country || store?.country || "Cuba",
      province: row.province || store?.province || "",
      municipality: row.municipality || store?.municipality || "",
      deliveryZone: row.delivery_zone ?? store?.delivery_zones?.[0] ?? undefined,
      warranty: row.warranty ?? undefined,
      promisedSla: row.promised_sla ?? undefined,
      availability: row.availability ?? undefined,
      image: images[0] ?? "/brand/msm-my-store-logo.jpeg",
      gallery: images.length ? images : ["/brand/msm-my-store-logo.jpeg"]
    };
  } catch {
    const fallback = findFallbackProduct(slug);
    return fallback
      ? {
          ...fallback,
          description:
            "Producto publicado dentro de MSM my store con tienda responsable, zona de entrega, pago organizado y seguimiento auditable.",
          gallery: [fallback.image]
        }
      : null;
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(decodeURIComponent(slug));

  if (!product) {
    return (
      <AppShell>
        <section className="mx-auto max-w-4xl px-4 py-12">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-msm-blue">
            <ArrowLeft size={16} /> Volver a productos
          </Link>
          <h1 className="mt-4 text-3xl font-bold">Producto no disponible</h1>
          <p className="mt-2 text-slate-600">Este producto no esta activo, fue pausado o no tiene tienda y zona publicables.</p>
        </section>
      </AppShell>
    );
  }

  const checkoutHref = isDatabaseId(product.id) ? `/checkout?product=${product.id}` : "/checkout";
  const country = product.country ?? "Cuba";

  // Build WhatsApp purchase link with product data as query params
  const whatsappParams = new URLSearchParams({
    product: product.id,
    name: product.name,
    price: String(product.price),
    currency: product.currency ?? "USD",
    store: product.store,
    slug: product.slug,
  });
  const comprarWhatsAppHref = `/comprar-whatsapp?${whatsappParams.toString()}`;

  return (
    <AppShell>
      <section className="border-b border-white/10 bg-msm-midnight text-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-msm-ice">
            <ArrowLeft size={16} /> Volver al catalogo
          </Link>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-glow">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 92vw, 50vw"
                quality={64}
              />
            </div>
            <div>
              <Badge className="border-white/20 bg-white/10 text-msm-ice">{product.category}</Badge>
              <h1 className="mt-4 text-4xl font-bold md:text-6xl">{product.name}</h1>
              <p className="mt-4 text-lg leading-8 text-msm-ice/80">{product.description}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
                <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2">
                  <Store size={16} /> {product.store}
                </span>
                <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2">
                  <MapPin size={16} /> {product.municipality}, {product.province}, {country}
                </span>
                <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2">
                  <Clock size={16} /> {product.promisedSla ?? "48h"}
                </span>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <strong className="text-4xl">{currency(product.price)}</strong>
                <span className="rounded-md bg-white/10 px-3 py-2 text-sm font-bold text-msm-ice">
                  {product.stock} disponibles
                </span>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                {/* Primary CTA for demo: WhatsApp */}
                <Link
                  href={comprarWhatsAppHref}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-green-600 px-5 text-sm font-bold text-white shadow-glow transition hover:bg-green-700"
                >
                  <MessageCircle size={17} /> Comprar por WhatsApp
                </Link>

                {isDatabaseId(product.id) && product.sellerId ? (
                  <AddToCartButton
                    productId={product.id}
                    name={product.name}
                    price={product.price}
                    currency={product.currency ?? "USD"}
                    image={product.image}
                    store={product.store}
                    storeId={product.storeId ?? product.id}
                    sellerId={product.sellerId}
                    stock={product.stock}
                    slug={product.slug}
                  />
                ) : null}

                <Link
                  href={checkoutHref}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-msm-blue px-5 text-sm font-bold text-white shadow-glow transition hover:bg-msm-electric"
                >
                  <ShoppingCart size={17} /> Comprar ahora
                </Link>

                {product.storeSlug ? (
                  <Link
                    href={`/vendedores/${product.storeSlug}`}
                    className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/25 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                  >
                    Ver tienda VIP
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 pb-24 lg:grid-cols-3">
        <article className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
          <ShieldCheck className="text-msm-blue" size={24} />
          <h2 className="mt-3 font-bold">Garantia y responsabilidad</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{product.warranty ?? "Garantia segun tienda VIP y evidencia de entrega."}</p>
        </article>
        <article className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
          <BadgeCheck className="text-msm-blue" size={24} />
          <h2 className="mt-3 font-bold">Disponibilidad</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{product.availability ?? "Stock real o por confirmar por el VIP."}</p>
        </article>
        <article className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
          <MapPin className="text-msm-blue" size={24} />
          <h2 className="mt-3 font-bold">Zona de entrega</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{product.deliveryZone ?? `${product.municipality}, ${product.province}, ${country}`}</p>
        </article>
      </section>
    </AppShell>
  );
}
