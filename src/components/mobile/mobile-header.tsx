"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, Search, Bell, ShoppingCart, X } from "lucide-react";
import { CartCount } from "@/components/cart/cart-count";

export function MobileHeader() {
  const [searchOpen, setSearchOpen] = useState(false);

  if (searchOpen) {
    return (
      <div className="sticky top-0 z-50 bg-[#020B2D] px-3 py-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setSearchOpen(false)} className="grid h-10 w-10 place-items-center text-white/80">
            <X size={22} />
          </button>
          <form action="/products" className="flex-1">
            <input
              name="q"
              autoFocus
              placeholder="Buscar productos..."
              className="h-10 w-full rounded-full bg-white/15 px-4 text-sm font-semibold text-white outline-none placeholder:text-white/50 focus:bg-white/20"
            />
          </form>
        </div>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#020B2D] via-[#041248] to-[#020B2D] px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <button className="grid h-10 w-10 place-items-center text-white/80" aria-label="Menu">
          <Menu size={22} />
        </button>
        <Link href="/" className="shrink-0">
          <Image
            src="/brand/msm-my-store-logo.jpeg"
            alt="MSM"
            width={90}
            height={50}
            priority
            quality={65}
            className="h-7 w-auto object-contain brightness-[1.1]"
          />
        </Link>
        <button
          onClick={() => setSearchOpen(true)}
          className="flex h-10 flex-1 items-center gap-2 rounded-full bg-white/15 px-4 text-sm text-white/60 transition active:bg-white/20"
        >
          <Search size={16} />
          <span>Buscar productos...</span>
        </button>
        <Link
          href="/account"
          className="grid h-10 w-10 place-items-center text-white/80"
          aria-label="Notificaciones"
        >
          <Bell size={20} />
        </Link>
        <Link
          href="/cart"
          className="relative grid h-10 w-10 place-items-center text-white/80"
          aria-label="Carrito"
        >
          <ShoppingCart size={20} />
          <CartCount />
        </Link>
      </div>
    </header>
  );
}
