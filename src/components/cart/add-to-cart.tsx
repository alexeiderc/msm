"use client";

import { ShoppingCart } from "lucide-react";
import { addToCart } from "@/lib/cart-store";
import { useRouter } from "next/navigation";

type AddToCartButtonProps = {
  productId: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  store: string;
  storeId: string;
  sellerId: string;
  stock: number;
  slug: string;
};

export function AddToCartButton(props: AddToCartButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        addToCart({
          productId: props.productId,
          name: props.name,
          price: props.price,
          currency: props.currency,
          image: props.image,
          store: props.store,
          storeId: props.storeId,
          sellerId: props.sellerId,
          quantity: 1,
          stock: props.stock,
          slug: props.slug
        });
        router.push("/cart");
      }}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
    >
      <ShoppingCart size={17} /> Agregar al carrito
    </button>
  );
}
