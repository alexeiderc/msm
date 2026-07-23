"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  FileText,
  LayoutDashboard,
  PackageCheck,
  Settings,
  ShoppingCart,
  Store,
  UsersRound,
  WalletCards,
  X,
  Menu,
  Tag,
  Receipt,
  Truck,
  Boxes,
  Star,
  RotateCcw,
  Package,
  TrendingUp,
} from "lucide-react";
import type { UserRole } from "@/types/domain";
import { useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
};

type NavCategory = {
  label: string;
  items: NavItem[];
};

const nav: NavCategory[] = [
  {
    label: "General",
    items: [
      { label: "Resumen", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Administracion",
    items: [
      { label: "Panel Admin", href: "/dashboard/admin", icon: Settings, roles: ["administrador", "superadmin"] },
      { label: "Usuarios", href: "/dashboard/admin/users", icon: UsersRound, roles: ["administrador", "superadmin"] },
      { label: "WhatsApp Carts", href: "/dashboard/admin/whatsapp-carts", icon: ShoppingCart, roles: ["administrador", "superadmin"] },
      { label: "Productos", href: "/dashboard/admin/products", icon: Package, roles: ["administrador", "superadmin"] },
      { label: "Cupones", href: "/dashboard/admin/coupons", icon: Tag, roles: ["administrador", "superadmin"] },
      { label: "Impuestos", href: "/dashboard/admin/tax-rates", icon: Receipt, roles: ["administrador", "superadmin"] },
      { label: "Envios", href: "/dashboard/admin/shipping-rates", icon: Truck, roles: ["administrador", "superadmin"] },
      { label: "Inventario", href: "/dashboard/admin/inventory", icon: Boxes, roles: ["administrador", "superadmin"] },
      { label: "Resenas", href: "/dashboard/admin/reviews", icon: Star, roles: ["administrador", "superadmin"] },
      { label: "Devoluciones", href: "/dashboard/admin/returns", icon: RotateCcw, roles: ["administrador", "superadmin"] },
      { label: "Analytics", href: "/dashboard/admin/analytics", icon: TrendingUp, roles: ["administrador", "superadmin"] },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { label: "Panel VIP", href: "/dashboard/vip", icon: Store, roles: ["vendedor_vip", "administrador", "superadmin"] },
      { label: "Panel Economico", href: "/dashboard/economic", icon: CreditCard, roles: ["administrador_economico", "superadmin"] },
    ],
  },
  {
    label: "Ejecutivo",
    items: [
      { label: "Don Miguel", href: "/dashboard/don-miguel", icon: BarChart3, roles: ["administrador", "administrador_economico", "superadmin"] },
    ],
  },
  {
    label: "Servicios",
    items: [
      { label: "Mis Ordenes", href: "/orders", icon: PackageCheck },
      { label: "Billetera", href: "/wallet", icon: WalletCards },
      { label: "Soporte", href: "/support", icon: FileText },
    ],
  },
];

export function DashboardSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (!pathname) return false;
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const visible = nav
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => !item.roles || item.roles.includes(role)),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-3 z-40 grid h-9 w-9 place-items-center rounded-md bg-white text-msm-ink shadow-md lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col overflow-y-auto border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="grid h-8 w-8 place-items-center rounded-md bg-msm-blue text-xs font-bold text-white">M</span>
            <span className="text-sm font-black text-msm-ink">MSM Dashboard</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4">
          {visible.map((cat) => (
            <div key={cat.label} className="mb-5">
              <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                {cat.label}
              </p>
              {cat.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-blue-50 text-msm-blue shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-msm-ink"
                    }`}
                  >
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${
                      active ? "bg-msm-blue text-white shadow-sm" : "text-slate-400"
                    }`}>
                      <Icon size={15} />
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200 px-4 py-3">
          <p className="text-[10px] text-slate-400">MSM My Store &copy; 2026</p>
        </div>
      </aside>
    </>
  );
}
