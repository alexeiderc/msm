import Link from "next/link";
import Image from "next/image";
import { PackageSearch, QrCode, Search, ShoppingCart, UserRound, WalletCards, CircleDollarSign } from "lucide-react";
import { LowDataModeToggle } from "@/components/performance/low-data-mode";
import { CartCount } from "@/components/cart/cart-count";

const navItems = [
  ["Productos", "/products", PackageSearch],
  ["Remesas", "/remittances", CircleDollarSign],
  ["Cajeros", "/atm", QrCode],
  ["Billetera", "/wallet", WalletCards]
] as const;

export function ScrollHeader() {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-slate-200/80 bg-white/95 text-msm-ink shadow-[0_8px_28px_rgba(7,17,30,0.06)] backdrop-blur-xl md:block">
      <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex shrink-0 items-center gap-3 font-bold" aria-label="MSM my store inicio">
            <Image
              src="/brand/msm-my-store-logo.jpeg"
              alt="MSM my store"
              width={160}
              height={90}
              priority
              quality={65}
              className="h-9 w-auto object-contain sm:h-10"
            />
          </Link>
          <form action="/products" className="min-w-0 flex-1">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                name="q"
                className="min-h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-msm-ink outline-none placeholder:text-slate-400 transition focus:border-msm-blue focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="Buscar producto, municipio o tienda"
              />
            </label>
          </form>
          <nav className="hidden shrink-0 items-center gap-1 md:flex">
            {navItems.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-md px-2 py-2 text-xs font-bold text-slate-600 transition hover:bg-blue-50 hover:text-msm-blue lg:px-3 lg:text-sm"
              >
                {label}
              </Link>
            ))}
            <LowDataModeToggle />
            <Link href="/cart" className="relative grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:border-msm-blue hover:text-msm-blue" aria-label="Carrito">
              <ShoppingCart size={18} />
              <CartCount />
            </Link>
            <Link href="/auth/login" className="grid h-10 w-10 place-items-center rounded-md bg-msm-midnight text-white transition hover:bg-msm-blue" aria-label="Cuenta">
              <UserRound size={18} />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
