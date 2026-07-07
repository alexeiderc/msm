"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, Search, Bell, ShoppingCart, X } from "lucide-react";
import { CartCount } from "@/components/cart/cart-count";
import { ElianaDiamond } from "@/components/ai/eliana-diamond";

export function MobileHeader({ onElianaOpen }: { onElianaOpen: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);

  if (searchOpen) {
    return (
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 px-3 py-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setSearchOpen(false)} className="grid h-10 w-10 place-items-center text-slate-500">
            <X size={22} />
          </button>
          <form action="/products" className="flex-1">
            <input
              name="q"
              autoFocus
              placeholder="Buscar productos..."
              className="h-10 w-full rounded-full bg-slate-100 px-4 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:bg-slate-50 dark:bg-slate-800 dark:text-white"
            />
          </form>
        </div>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#020B2D] via-[#041248] to-[#020B2D] px-2 py-1.5 shadow-lg">
      <div className="flex items-center gap-1.5">
        <button className="grid h-10 w-10 place-items-center text-white/80" aria-label="Menu">
          <Menu size={22} />
        </button>
        <Link href="/" className="shrink-0">
          <Image
            src="/brand/msm-my-store-logo.jpeg"
            alt="MSM"
            width={80}
            height={45}
            priority
            quality={65}
            className="h-6 w-auto object-contain brightness-[1.1]"
          />
        </Link>
        <button
          onClick={() => setSearchOpen(true)}
          className="flex h-9 flex-1 items-center gap-2 rounded-full bg-white/15 px-3 text-sm text-white/60 transition active:bg-white/20"
        >
          <Search size={15} />
          <span className="text-xs">Buscar productos...</span>
        </button>
        <button
          type="button"
          onClick={onElianaOpen}
          className="relative grid h-9 w-9 place-items-center rounded-full transition active:scale-90"
          aria-label="ELIANA IA"
        >
          <ElianaDiamond size={28} className="drop-shadow-lg" />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-[#020B2D] bg-green-500" />
        </button>
        <Link
          href="/account"
          className="grid h-9 w-9 place-items-center text-white/80"
          aria-label="Notificaciones"
        >
          <Bell size={18} />
        </Link>
        <Link
          href="/cart"
          className="relative grid h-9 w-9 place-items-center text-white/80"
          aria-label="Carrito"
        >
          <ShoppingCart size={18} />
          <CartCount />
        </Link>
      </div>
    </header>
  );
}
