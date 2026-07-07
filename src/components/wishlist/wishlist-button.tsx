"use client";

"use client";

import { useActionState } from "react";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/server/actions/wishlist";

export function WishlistButton({ productId, initial }: { productId: string; initial?: boolean }) {
  const [state, action, pending] = useActionState(async () => toggleWishlist(productId), null);
  const isWishlisted = state?.ok
    ? state.message === "Agregado a favoritos."
    : initial ?? false;

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending}
        className={`grid h-10 w-10 place-items-center rounded-full border transition active:scale-90 ${
          isWishlisted ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 bg-white text-slate-400"
        }`}
        aria-label="Favoritos"
      >
        <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
      </button>
    </form>
  );
}
