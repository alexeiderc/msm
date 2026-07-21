import Link from "next/link";
import type { ComponentType } from "react";
import {
  BadgeDollarSign,
  BarChart3,
  Boxes,
  CreditCard,
  FileText,
  LayoutDashboard,
  PackageCheck,
  ShieldCheck,
  Store,
  Truck,
  UsersRound,
  WalletCards,
} from "lucide-react";
import type { UserRole } from "@/types/domain";

type DashboardIcon = ComponentType<{ size?: number; className?: string }>;

const roleConfig: Record<UserRole, { title: string; subtitle: string; href: string; items: Array<[string, string, DashboardIcon, string]> }> = {
  cliente: {
    title: "Panel cliente",
    subtitle: "Compras, remesas, comprobantes, KYC, soporte y billetera.",
    href: "/orders",
    items: [
      ["Mis ordenes", "/orders", PackageCheck, "Seguimiento de pagos, estados y entregas."],
      ["Validar KYC", "/account/kyc", ShieldCheck, "Datos y titular de pago para operar seguro."],
      ["Billetera", "/wallet", WalletCards, "Saldo, reservas y movimientos demo."],
      ["Soporte", "/support", FileText, "Reclamaciones y ayuda humana."],
    ],
  },
  vendedor_vip: {
    title: "Panel vendedor VIP",
    subtitle: "Perfil, productos, servicios, remesas, evidencia y saldo.",
    href: "/dashboard/vip",
    items: [
      ["Panel VIP", "/dashboard/vip", Store, "Ordenes asignadas, stock y evidencia."],
      ["Productos", "/dashboard/vip#productos", Boxes, "Crear, editar, pausar y publicar."],
      ["Entregas", "/dashboard/vip#ordenes", Truck, "Confirmar, preparar, ruta y entrega."],
      ["Saldo", "/dashboard/vip#saldo", BadgeDollarSign, "Comisiones y saldo acumulado."],
    ],
  },
  administrador: {
    title: "Panel administrador",
    subtitle: "Vendedores, tiendas, productos, KYC, zonas, reclamos y auditoria.",
    href: "/dashboard/admin",
    items: [
      ["Admin", "/dashboard/admin", LayoutDashboard, "Control operativo del marketplace."],
      ["Usuarios", "/dashboard/admin/users", UsersRound, "Roles, KYC, estado y auditoria."],
      ["Vendedores", "/dashboard/admin#vendedores", UsersRound, "Aprobar, suspender y destacar."],
      ["Productos", "/dashboard/admin#productos", Boxes, "Publicacion y control por zona."],
    ],
  },
  administrador_economico: {
    title: "Panel economico",
    subtitle: "Comprobantes, pagos, ledger, remesas, cuentas y liquidaciones.",
    href: "/dashboard/economic",
    items: [
      ["Economia", "/dashboard/economic", CreditCard, "Aprobar o rechazar comprobantes."],
      ["Ledger", "/dashboard/economic#ledger", BarChart3, "Comisiones, netos y saldos."],
      ["Payouts", "/dashboard/economic#payouts", BadgeDollarSign, "Pagos a VIP con comprobante."],
      ["Metodos", "/payment-methods", WalletCards, "Metodos activos sin cuentas publicas."],
    ],
  },
  superadmin: {
    title: "Panel superadmin",
    subtitle: "Vista completa MSM: operaciones, economia, tecnologia, direccion y beta.",
    href: "/dashboard/don-miguel",
    items: [
      ["Don Miguel", "/dashboard/don-miguel", BarChart3, "Metricas ejecutivas."],
      ["Admin", "/dashboard/admin", LayoutDashboard, "Control total de tiendas y usuarios."],
      ["Usuarios", "/dashboard/admin/users", UsersRound, "Roles, KYC, estado y auditoria."],
      ["Economia", "/dashboard/economic", CreditCard, "Pagos, ledger y liquidaciones."],
    ],
  },
};

function WorkspaceCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-msm-line bg-white shadow-soft ${className}`}>
      {children}
    </div>
  );
}

export function DashboardWorkspaceShell({ role }: { role: UserRole }) {
  const config = roleConfig[role] ?? roleConfig.cliente;

  return (
    <section className="min-h-screen bg-msm-cloud px-4 py-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 border-b border-msm-line pb-5">
          <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-msm-blue">Dashboard MSM</span>
          <h1 className="mt-3 text-3xl font-black tracking-normal text-msm-ink md:text-4xl">{config.title}</h1>
          <p className="max-w-xl text-base leading-relaxed text-slate-500">
            {config.subtitle}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <WorkspaceCard>
            <div className="p-6">
              <div className="grid h-12 w-12 place-items-center rounded-md bg-msm-blue text-white">
                <LayoutDashboard size={24} />
              </div>
              <h2 className="mt-4 text-2xl font-black text-msm-ink">{config.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{config.subtitle}</p>
              <Link href={config.href} className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-msm-blue px-4 text-sm font-bold text-white transition hover:bg-msm-navy">
                <BarChart3 size={16} />
                Abrir panel principal
              </Link>
            </div>
          </WorkspaceCard>

          <div className="grid gap-4 sm:grid-cols-2">
            {config.items.map(([label, href, Icon, detail]) => (
              <Link
                key={href}
                href={href}
                className="group rounded-lg border border-msm-line bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lift"
              >
                <span className="grid h-11 w-11 place-items-center rounded-md bg-blue-50 text-msm-blue transition group-hover:bg-msm-blue group-hover:text-white">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 text-base font-bold text-msm-ink">{label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{detail}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-msm-line pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">MSM my store</div>
      </div>
    </section>
  );
}
