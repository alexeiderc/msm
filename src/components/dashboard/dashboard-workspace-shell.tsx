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
  Sparkles,
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

function FuturisticGlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/20 bg-white/70 backdrop-blur-xl shadow-xl shadow-black/5 ${className}`}
    >
      {children}
    </div>
  );
}

export function DashboardWorkspaceShell({ role }: { role: UserRole }) {
  const config = roleConfig[role] ?? roleConfig.cliente;

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-8">
      {/* Fondo futurista */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-msm-blue/20 to-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/15 to-cyan-300/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-300/10 to-pink-300/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-msm-blue/30 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Header futurista */}
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-msm-blue to-blue-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white shadow-lg shadow-msm-blue/25">
              <Sparkles size={12} />
              Dashboard
            </span>
          </div>
          <h1 className="bg-gradient-to-r from-msm-ink via-msm-ink to-slate-400 bg-clip-text text-4xl font-black tracking-tight text-transparent">
            {config.title}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-slate-500">
            {config.subtitle}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Panel principal - perfil */}
          <FuturisticGlassCard>
            <div className="p-6">
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-msm-blue to-blue-700 text-white shadow-lg shadow-msm-blue/20">
                <LayoutDashboard size={24} />
              </div>
              <h2 className="mt-4 text-2xl font-black text-msm-ink">{config.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{config.subtitle}</p>
              <Link
                href={config.href}
                className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-msm-blue to-blue-700 px-4 text-sm font-bold text-white shadow-lg shadow-msm-blue/25 transition-all hover:shadow-xl hover:shadow-msm-blue/30 hover:brightness-110"
              >
                <BarChart3 size={16} />
                Abrir panel principal
              </Link>
            </div>
          </FuturisticGlassCard>

          {/* Acceso rapido - grid de tarjetas */}
          <div className="grid gap-4 sm:grid-cols-2">
            {config.items.map(([label, href, Icon, detail]) => (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl border border-white/20 bg-white/60 p-5 backdrop-blur-xl shadow-lg shadow-black/5 transition-all hover:-translate-y-1 hover:border-msm-blue/30 hover:bg-white/80 hover:shadow-xl hover:shadow-msm-blue/10"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-msm-blue transition-all group-hover:from-msm-blue group-hover:to-blue-700 group-hover:text-white group-hover:shadow-lg group-hover:shadow-msm-blue/20">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 text-base font-bold text-msm-ink">{label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{detail}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Barra decorativa inferior */}
        <div className="mt-12 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-msm-blue/20 via-slate-200 to-transparent" />
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
            MSM My Store
          </span>
        </div>
      </div>
    </section>
  );
}
