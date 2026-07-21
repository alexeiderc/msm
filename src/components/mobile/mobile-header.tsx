"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronRight, Menu, Search, ShoppingCart, Store, X } from "lucide-react";
import { CartCount } from "@/components/cart/cart-count";
import { ElianaDiamond } from "@/components/ai/eliana-diamond";

const quickLinks = [
  ["Productos", "/products"],
  ["Remesas", "/remittances"],
  ["Tiendas VIP", "/tiendas-vip"],
  ["Como funciona", "/how-it-works"],
  ["Ayuda", "/help"],
] as const;

export function MobileHeader({ onElianaOpen }: { onElianaOpen: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (searchOpen) {
    return (
      <div className="sticky top-0 z-50 border-b border-msm-line bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-md text-slate-600 transition active:bg-slate-100"
            aria-label="Cerrar busqueda"
          >
            <X size={21} />
          </button>
          <form action="/products" className="flex-1">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-msm-blue" size={17} />
              <input
                name="q"
                autoFocus
                placeholder="Buscar producto, zona o tienda"
                className="h-10 w-full rounded-md border border-msm-silver bg-msm-cloud pl-10 pr-3 text-sm font-semibold text-msm-ink outline-none placeholder:text-slate-400 focus:border-msm-blue focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-msm-midnight px-3 py-2 shadow-[0_8px_24px_rgba(7,17,30,0.2)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-md text-white transition active:bg-white/10"
            aria-label="Abrir menu"
          >
            <Menu size={21} />
          </button>
          <Link href="/" className="shrink-0" aria-label="MSM my store inicio">
            <Image
              src="/brand/msm-my-store-logo.jpeg"
              alt="MSM my store"
              width={100}
              height={56}
              priority
              quality={65}
              className="h-7 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md bg-white/10 px-3 text-left text-xs font-semibold text-white/70 transition active:bg-white/15"
            aria-label="Buscar en MSM my store"
          >
            <Search size={16} className="shrink-0" />
            <span className="truncate">Buscar en MSM</span>
          </button>
          <button
            type="button"
            onClick={onElianaOpen}
            className="relative grid h-10 w-10 place-items-center rounded-md text-white transition active:bg-white/10"
            aria-label="Abrir YO SOY ELIANA"
          >
            <ElianaDiamond size={27} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full border border-msm-midnight bg-emerald-400" />
          </button>
          <Link
            href="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-md text-white transition active:bg-white/10"
            aria-label="Carrito"
          >
            <ShoppingCart size={19} />
            <CartCount />
          </Link>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Menu principal">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-msm-midnight/50"
            aria-label="Cerrar menu"
          />
          <aside className="relative flex h-full w-[86%] max-w-xs flex-col bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-msm-line px-4 py-4">
              <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 font-black text-msm-ink">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-msm-blue text-white"><Store size={18} /></span>
                MSM my store
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-md text-slate-600 active:bg-slate-100"
                aria-label="Cerrar menu"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4">
              {quickLinks.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center justify-between border-b border-slate-100 px-2 text-sm font-bold text-msm-ink"
                >
                  {label}
                  <ChevronRight size={18} className="text-msm-blue" />
                </Link>
              ))}
            </nav>
            <div className="border-t border-msm-line p-4">
              <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center justify-center rounded-md bg-msm-blue px-4 text-sm font-bold text-white">
                Crear cuenta
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
