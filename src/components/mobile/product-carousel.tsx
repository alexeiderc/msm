"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, ChevronRight } from "lucide-react";
import { officialPublicProductsFallback } from "@/lib/demo-msm-store";
import { addToCart } from "@/lib/cart-store";
import type { CartItem } from "@/lib/cart-store";

const products = officialPublicProductsFallback.slice(0, 8).map((p) => ({
  ...p,
  category: p.category ?? "Producto",
}));

function formatPrice(price: number, currency: string) {
  return `${currency === "USD" ? "$" : "€"}${price.toFixed(2)}`;
}

export function ProductCarousel() {
  return (
    <section className="mt-5 px-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1 text-sm font-extrabold text-slate-800">
          Ofertas para ti <span className="text-base">🔥</span>
        </h3>
        <Link
          href="/products"
          className="flex items-center gap-0.5 text-xs font-bold text-msm-blue"
        >
          Ver todas <ChevronRight size={14} />
        </Link>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="flex w-40 shrink-0 flex-col rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-slate-50">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between p-2.5">
              <div>
                <p className="text-xs font-bold leading-tight text-slate-800 line-clamp-2">
                  {product.name}
                </p>
                {product.store && (
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
                    {product.store}
                  </p>
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold text-slate-800">
                    {formatPrice(product.price, product.currency)}
                  </p>
                </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const item: CartItem = {
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        currency: product.currency,
                        image: product.image,
                        store: product.store ?? "",
                        storeId: product.storeSlug ?? "",
                        sellerId: product.storeSlug ?? "",
                        quantity: 1,
                        stock: product.stock,
                        slug: product.slug,
                      };
                      addToCart(item);
                    }}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-msm-blue to-violet-600 text-white shadow-sm transition active:scale-90"
                    aria-label="Agregar al carrito"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </Link>
        ))}
      </div>
    </section>
  );
}
