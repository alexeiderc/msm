"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Plus, Package, User } from "lucide-react";

const items = [
  ["Inicio", "/", Home],
  ["Categorías", "/products", LayoutGrid],
  ["Publicar", "/vendedores/solicitud", Plus],
  ["Órdenes", "/orders", Package],
  ["Perfil", "/account", User],
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
      <div className="flex items-center justify-around py-1">
        {items.map(([label, href, Icon], i) => {
          const isPublish = i === 2;
          const isActive = pathname ? (pathname === href || (href !== "/" && pathname.startsWith(href))) : false;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1 ${
                isPublish ? "-mt-4" : ""
              }`}
            >
              {isPublish ? (
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-msm-blue to-violet-600 text-white shadow-lg shadow-blue-500/30">
                  <Icon size={22} />
                </span>
              ) : (
                <Icon
                  size={21}
                  className={
                    isActive
                      ? "text-msm-blue dark:text-blue-400"
                      : "text-slate-500 dark:text-slate-400"
                  }
                />
              )}
              <span
                className={`text-[10px] font-bold ${
                  isPublish
                    ? "mt-0.5 text-violet-700 dark:text-violet-400"
                    : isActive
                      ? "text-msm-blue dark:text-blue-400"
                      : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
