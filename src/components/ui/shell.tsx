import Link from "next/link";
import Image from "next/image";
import { Bot, CircleDollarSign, Home, PackageSearch, QrCode, Search, ShoppingCart, UserRound, WalletCards } from "lucide-react";
import { ElianaFloatingAssistant } from "@/components/ai/eliana-floating-assistant";
import { LowDataModeToggle } from "@/components/performance/low-data-mode";
import { CartCount } from "@/components/cart/cart-count";

const navItems = [
  ["Inicio", "/", Home],
  ["Productos", "/products", PackageSearch],
  ["Remesas", "/remittances", CircleDollarSign],
  ["Cajeros", "/atm", QrCode],
  ["Billetera", "/wallet", WalletCards],
  ["YO SOY ELIANA", "/eliana", Bot]
] as const;

const helpLinks = [
  ["YO SOY ELIANA IA", "/eliana"],
  ["Quienes somos", "/quienes-somos"],
  ["Centro de ayuda", "/help"],
  ["Crear cuenta", "/auth/signup"],
  ["Como funciona", "/how-it-works"],
  ["Metodos activos", "/payment-methods"],
  ["Cambio", "/exchange"],
  ["Cajeros MSM", "/atm"],
  ["Billetera", "/wallet"],
  ["Tiendas VIP", "/tiendas-vip"],
  ["Soporte", "/support"],
  ["Terminos", "/terms"],
  ["Mi cuenta", "/account"],
  ["Cuenta", "/account/kyc"]
] as const;

const panelLinks = [
  ["Workspace", "/dashboard"],
  ["VIP", "/dashboard/vip"],
  ["Admin", "/dashboard/admin"],
  ["Economia", "/dashboard/economic"],
  ["Don Miguel", "/dashboard/don-miguel"]
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-msm-cloud">
      <header className="sticky top-0 z-30 hidden border-b border-slate-200/80 bg-white/92 text-msm-ink shadow-[0_8px_28px_rgba(7,17,30,0.06)] backdrop-blur md:block">
        <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex shrink-0 items-center gap-3 font-bold text-white" aria-label="MSM my store inicio">
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
              {navItems.slice(1, 5).map(([label, href]) => (
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
      <main>{children}</main>
      <footer className="border-t border-msm-line bg-white pb-20 pt-8 text-sm md:pb-8 md:pt-8">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Image
              src="/brand/msm-my-store-logo.jpeg"
              alt="MSM my store"
              width={150}
              height={85}
              quality={65}
              className="h-10 w-auto object-contain"
            />
            <p className="mt-3 max-w-md leading-6 text-slate-600">
              MSM my store centraliza productos, servicios, remesas, pagos, ordenes,
              entregas y confianza por pais, provincia, estado, municipio y ciudad.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-msm-ink">Ayuda</h2>
            <div className="mt-3 grid gap-2">
              {helpLinks.map(([label, href]) => (
                <Link key={href} href={href} className="font-semibold text-slate-600 hover:text-msm-blue">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-bold text-msm-ink">Paneles</h2>
            <div className="mt-3 grid gap-2">
              {panelLinks.map(([label, href]) => (
                <Link key={href} href={href} className="font-semibold text-slate-600 hover:text-msm-blue">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
      {/* Mobile bottom nav removed — handled per-page via MobileBottomNav */}
      <ElianaFloatingAssistant />
    </div>
  );
}
