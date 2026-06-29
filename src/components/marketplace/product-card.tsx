import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle, PackageCheck, ShoppingCart, Star, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/lib/utils";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    currency?: string;
    stock: number;
    category: string;
    store: string;
    country?: string;
    province: string;
    municipality?: string;
    deliveryZone?: string;
    warranty?: string;
    promisedSla?: string;
    availability?: string;
    storeSlug?: string;
    image: string;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const hasDatabaseId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(product.id);
  const country = product.country ?? "Cuba";
  const checkoutHref = hasDatabaseId ? `/checkout?product=${product.id}` : "/checkout";
  const whatsappText = encodeURIComponent(`Hola MSM, quiero informacion de ${product.name} en ${product.municipality ?? product.province}.`);
  const whatsappHref = `https://wa.me/17723015523?text=${whatsappText}`;
  const availability = product.availability ?? (product.stock > 0 ? "stock real" : "por confirmar");

  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_14px_34px_rgba(7,17,30,0.08)] transition hover:-translate-y-0.5 hover:border-msm-blue hover:shadow-[0_22px_48px_rgba(25,123,210,0.16)]">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[1.08/1] bg-slate-100 sm:aspect-[4/3]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 31vw"
          quality={62}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-msm-midnight/62 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="border-white/35 bg-white/92 text-msm-blue shadow-soft">{product.category}</Badge>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-white/94 px-2.5 py-1 text-xs font-bold text-msm-ink shadow-soft">
            <Star size={14} className="fill-msm-blue text-msm-blue" /> 4.9
          </span>
          <span className="rounded-md bg-msm-blue px-2.5 py-1 text-xs font-bold text-white shadow-glow">
            {product.promisedSla ?? "48h"}
          </span>
        </div>
      </Link>
      <div className="space-y-3 p-3.5 sm:p-4">
        <div>
          <Link href={`/products/${product.slug}`} className="line-clamp-2 block min-h-10 text-base font-bold leading-5 text-msm-ink transition hover:text-msm-blue">
            {product.name}
          </Link>
          <div className="mt-2 grid gap-1 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5"><Store size={14} className="text-msm-blue" /> {product.store}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-msm-blue" /> {product.municipality ?? "Ciudad o municipio"}, {product.province}</span>
          </div>
        </div>
        <div className="grid gap-2 rounded-md border border-slate-100 bg-msm-cloud p-3 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1.5"><PackageCheck size={14} className="text-msm-blue" /> {availability}</span>
          <span>Stock: {product.stock > 0 ? `${product.stock} disponible` : "por confirmar"}</span>
          {product.deliveryZone ? <span>Zona: {product.deliveryZone}</span> : null}
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">Precio</span>
            <span className="text-2xl font-black text-msm-ink">{currency(product.price, product.currency ?? "USD")}</span>
          </div>
          <Badge className="border-blue-100 bg-blue-50 text-msm-blue">{country}</Badge>
        </div>
        {product.storeSlug ? (
          <Link href={`/vendedores/${product.storeSlug}`} className="block text-sm font-bold text-msm-blue hover:text-msm-electric">
            Ver tienda VIP
          </Link>
        ) : null}
        <div className="grid grid-cols-[44px_44px_1fr] gap-2">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="grid min-h-11 place-items-center rounded-md border border-green-100 bg-green-50 text-green-700 transition hover:border-green-400 hover:bg-white"
            aria-label={`Preguntar por WhatsApp sobre ${product.name}`}
          >
            <MessageCircle size={18} />
          </a>
          <Link
            href="/cart"
            className="grid min-h-11 place-items-center rounded-md border border-blue-100 bg-blue-50 text-msm-blue transition hover:border-msm-blue hover:bg-white"
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <ShoppingCart size={18} />
          </Link>
          <Link
            href={checkoutHref}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-msm-blue px-3 py-2 text-sm font-bold text-white shadow-[0_14px_34px_rgba(25,123,210,0.25)] transition hover:bg-msm-electric"
          >
            Comprar
          </Link>
        </div>
        <Link href={`/products/${product.slug}`} className="block text-center text-xs font-bold text-slate-500 hover:text-msm-blue">
          Ver detalle
        </Link>
      </div>
    </article>
  );
}
