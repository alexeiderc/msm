import Link from "next/link";
import Image from "next/image";
import { ScrollHeader } from "@/components/ui/scroll-header";
import { MobileShell } from "@/components/ui/mobile-shell";

const exploreLinks = [
  ["Productos", "/products"],
  ["Remesas", "/remittances"],
  ["Tiendas VIP", "/tiendas-vip"],
  ["Metodos activos", "/payment-methods"],
  ["Billetera MSM", "/wallet"]
] as const;

const helpLinks = [
  ["Como funciona", "/how-it-works"],
  ["Centro de ayuda", "/help"],
  ["Soporte", "/support"],
  ["Terminos", "/terms"],
  ["Crear cuenta", "/auth/signup"]
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
      <ScrollHeader />
      <main className="pb-16 md:pb-0">{children}</main>
      <footer className="border-t border-msm-line bg-white pb-20 pt-8 text-sm md:pb-8">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 md:grid-cols-[1.25fr_1fr_1fr_1fr]">
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
              Productos, servicios, remesas y vendedores VIP conectados por zona con pagos y ordenes organizados por MSM.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-msm-ink">Explorar</h2>
            <div className="mt-3 grid gap-2">
              {exploreLinks.map(([label, href]) => (
                <Link key={href} href={href} className="font-semibold text-slate-600 hover:text-msm-blue">
                  {label}
                </Link>
              ))}
            </div>
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
      <MobileShell />
    </div>
  );
}
