"use client";

import { useEffect, useState } from "react";
import { getCartCount } from "@/lib/cart-store";

export function CartCount() {
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCount(getCartCount());
    setLoaded(true);
    const interval = setInterval(() => setCount(getCartCount()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!loaded || count === 0) return null;

  return (
    <span className="absolute -right-1 -top-1 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
