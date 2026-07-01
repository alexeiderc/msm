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
  WalletCards
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
      ["Soporte", "/support", FileText, "Reclamaciones y ayuda humana."]
    ]
  },
  vendedor_vip: {
    title: "Panel vendedor VIP",
    subtitle: "Perfil, productos, servicios, remesas, evidencia y saldo.",
    href: "/dashboard/vip",
    items: [
      ["Panel VIP", "/dashboard/vip", Store, "Ordenes asignadas, stock y evidencia."],
      ["Productos", "/dashboard/vip#productos", Boxes, "Crear, editar, pausar y publicar."],
      ["Entregas", "/dashboard/vip#ordenes", Truck, "Confirmar, preparar, ruta y entrega."],
      ["Saldo", "/dashboard/vip#saldo", BadgeDollarSign, "Comisiones y saldo acumulado."]
    ]
  },
  administrador: {
    title: "Panel administrador",
    subtitle: "Vendedores, tiendas, productos, KYC, zonas, reclamos y auditoria.",
    href: "/dashboard/admin",
    items: [
      ["Admin", "/dashboard/admin", LayoutDashboard, "Control operativo del marketplace."],
      ["Usuarios", "/dashboard/admin/users", UsersRound, "Roles, KYC, estado y auditoria."],
      ["Vendedores", "/dashboard/admin#vendedores", UsersRound, "Aprobar, suspender y destacar."],
      ["Productos", "/dashboard/admin#productos", Boxes, "Publicacion y control por zona."]
    ]
  },
  administrador_economico: {
    title: "Panel economico",
    subtitle: "Comprobantes, pagos, ledger, remesas, cuentas y liquidaciones.",
    href: "/dashboard/economic",
    items: [
      ["Economia", "/dashboard/economic", CreditCard, "Aprobar o rechazar comprobantes."],
      ["Ledger", "/dashboard/economic#ledger", BarChart3, "Comisiones, netos y saldos."],
      ["Payouts", "/dashboard/economic#payouts", BadgeDollarSign, "Pagos a VIP con comprobante."],
      ["Metodos", "/payment-methods", WalletCards, "Metodos activos sin cuentas publicas."]
    ]
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
    ]
  }
};

export function DashboardWorkspaceShell({ role }: { role: UserRole }) {
  const config = roleConfig[role] ?? roleConfig.cliente;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
      <Badge className="border-blue-200 bg-blue-50 text-msm-blue">Workspace MSM</Badge>
      <div className="mt-4 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-msm-blue text-white shadow-glow">
            <LayoutDashboard size={22} />
          </div>
          <h1 className="mt-4 text-3xl font-black text-msm-ink">{config.title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{config.subtitle}</p>
          <Link href={config.href} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-msm-blue px-4 text-sm font-bold text-white shadow-glow">
            Abrir panel principal
          </Link>
        </aside>

        <div className="grid gap-3 sm:grid-cols-2">
          {config.items.map(([label, href, Icon, detail]) => (
            <Link key={href} href={href} className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-msm-blue hover:shadow-lift">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-msm-blue">
                <Icon size={20} />
              </span>
              <h2 className="mt-3 font-black text-msm-ink">{label}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
