"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, MapPin, MessageCircle, PackageCheck, Plus, Star, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { addToCart, type CartItem } from "@/lib/cart-store";
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
  const [added, setAdded] = useState(false);
  const hasDatabaseId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(product.id);
  const checkoutHref = hasDatabaseId ? `/checkout?product=${product.id}` : "/checkout";
  const whatsappText = encodeURIComponent(`Hola MSM, quiero informacion de ${product.name} en ${product.municipality ?? product.province}.`);
  const whatsappHref = `https://wa.me/17723015523?text=${whatsappText}`;
  const availability = product.availability ?? (product.stock > 0 ? "Disponible" : "Por confirmar");

  function handleAddToCart() {
    const item: CartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency ?? "USD",
      image: product.image,
      store: product.store,
      storeId: product.storeSlug ?? product.store,
      sellerId: product.storeSlug ?? product.store,
      quantity: 1,
      stock: Math.max(product.stock, 1),
      slug: product.slug,
    };
    addToCart(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article className="group overflow-hidden rounded-lg border border-msm-line bg-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lift">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[1.15/1] overflow-hidden bg-slate-100 sm:aspect-[4/3]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.025]"
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 31vw"
          quality={62}
        />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <Badge className="border-white/80 bg-white/95 text-msm-ink shadow-sm">{product.category}</Badge>
          {product.stock > 0 ? <span className="rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white">Disponible</span> : null}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-msm-midnight/85 px-2 py-1 text-xs font-bold text-white">
          <Star size={13} className="fill-amber-300 text-amber-300" /> 4.9
        </div>
      </Link>

      <div className="space-y-3 p-3.5 sm:p-4">
        <div>
          <Link href={`/products/${product.slug}`} className="line-clamp-2 block min-h-10 text-base font-bold leading-5 text-msm-ink transition hover:text-msm-blue">
            {product.name}
          </Link>
          <p className="mt-1 text-2xl font-black tracking-normal text-msm-ink">{currency(product.price, product.currency ?? "USD")}</p>
        </div>

        <div className="grid gap-1.5 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1.5"><Store size={14} className="text-msm-blue" /> {product.store}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-msm-blue" /> {product.municipality ?? "Municipio por confirmar"}, {product.province}</span>
        </div>

        <div className="flex flex-wrap gap-2 border-y border-slate-100 py-2.5 text-xs font-bold text-slate-600">
          <span className="inline-flex items-center gap-1"><PackageCheck size={14} className="text-msm-blue" /> {availability}</span>
          <span className="text-slate-300">|</span>
          <span>{product.promisedSla ?? "48h"}</span>
          {product.warranty ? <><span className="text-slate-300">|</span><span>{product.warranty}</span></> : null}
        </div>

        <div className="grid grid-cols-[44px_1fr] gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`grid min-h-11 place-items-center rounded-md border transition ${added ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-100 bg-blue-50 text-msm-blue hover:border-msm-blue hover:bg-white"}`}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            {added ? <Check size={19} /> : <Plus size={20} />}
          </button>
          <Link href={checkoutHref} className="inline-flex min-h-11 items-center justify-center rounded-md bg-msm-blue px-3 py-2 text-sm font-bold text-white transition hover:bg-msm-navy">
            Comprar ahora
          </Link>
        </div>

        <div className="flex items-center justify-between gap-3">
          {product.storeSlug ? (
            <Link href={`/vendedores/${product.storeSlug}`} className="text-xs font-bold text-msm-blue hover:text-msm-navy">
              Ver tienda VIP
            </Link>
          ) : <span />}
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800">
            <MessageCircle size={14} /> WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
