"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import Image from "next/image";
import { getWishlist } from "@/server/actions/wishlist";

export function WishlistPageContent({ items: initial }: { items: Awaited<ReturnType<typeof getWishlist>> }) {
  const items = initial;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <Heart size={48} className="text-slate-300" />
        <p className="text-lg font-bold text-slate-600">Tu lista de deseos esta vacia</p>
        <Link href="/products" className="rounded bg-msm-blue px-4 py-2 text-sm font-bold text-white">Explorar productos</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item: Record<string, unknown>) => {
        const product = item.products as { id: string; name: string; slug: string; price: number; currency: string; stock: number; product_images?: { url?: string }[] };
        return (
          <Link key={item.product_id as string} href={`/products/${product.slug}`} className="rounded-lg border bg-white p-3 shadow-sm transition hover:shadow-md">
            <div className="aspect-square overflow-hidden rounded-md bg-slate-100">
              {product.product_images?.[0]?.url ? (
                <Image src={product.product_images[0].url} alt={product.name} width={200} height={200} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-slate-300"><Heart size={32} /></div>
              )}
            </div>
            <p className="mt-2 text-sm font-bold">{product.name}</p>
            <p className="text-sm text-msm-blue font-bold">${Number(product.price).toFixed(2)} {product.currency}</p>
          </Link>
        );
      })}
    </div>
  );
}
