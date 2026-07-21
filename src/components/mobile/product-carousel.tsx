"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, ChevronRight, MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { officialPublicProductsFallback } from "@/lib/demo-msm-store";
import { addToCart, type CartItem } from "@/lib/cart-store";
import { currency } from "@/lib/utils";

const products = officialPublicProductsFallback.slice(0, 8).map((product) => ({
  ...product,
  category: product.category ?? "Producto",
}));

function QuickAdd({ product }: { product: (typeof products)[number] }) {
  const [added, setAdded] = useState(false);

  function addProduct() {
    const item: CartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image: product.image,
      store: product.store ?? "MSM my store",
      storeId: product.storeSlug ?? "msm-my-store",
      sellerId: product.storeSlug ?? "msm-my-store",
      quantity: 1,
      stock: Math.max(product.stock, 1),
      slug: product.slug,
    };
    addToCart(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        addProduct();
      }}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-md transition ${added ? "bg-emerald-600 text-white" : "bg-msm-blue text-white active:bg-msm-navy"}`}
      aria-label={`Agregar ${product.name} al carrito`}
    >
      {added ? <Check size={15} /> : <Plus size={17} />}
    </button>
  );
}

export function ProductCarousel() {
  return (
    <section className="mt-5 px-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-msm-ink">Productos destacados</h2>
        <Link href="/products" className="inline-flex items-center gap-0.5 text-xs font-bold text-msm-blue">Ver catalogo <ChevronRight size={14} /></Link>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="flex w-44 shrink-0 flex-col overflow-hidden rounded-lg border border-msm-line bg-white shadow-sm">
            <div className="relative aspect-square bg-slate-50">
              <Image src={product.image} alt={product.name} fill className="object-cover" sizes="176px" />
              <span className="absolute left-2 top-2 rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold text-msm-ink">{product.category}</span>
            </div>
            <div className="flex flex-1 flex-col justify-between p-3">
              <div>
                <p className="line-clamp-2 text-xs font-bold leading-4 text-msm-ink">{product.name}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500"><MapPin size={11} className="text-msm-blue" /> {product.municipality ?? product.province}</p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-base font-black text-msm-ink">{currency(product.price, product.currency)}</p>
                <QuickAdd product={product} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
