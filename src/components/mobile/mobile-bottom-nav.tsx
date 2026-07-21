"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PackageSearch, ReceiptText, Send, UserRound } from "lucide-react";

const items = [
  ["Inicio", "/", Home],
  ["Productos", "/products", PackageSearch],
  ["Remesas", "/remittances", Send],
  ["Ordenes", "/orders", ReceiptText],
  ["Cuenta", "/account", UserRound],
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-msm-line bg-white/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_24px_rgba(7,17,30,0.08)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5 px-1 py-1.5">
        {items.map(([label, href, Icon]) => {
          const isActive = pathname ? (pathname === href || (href !== "/" && pathname.startsWith(href))) : false;
          return (
            <Link key={href} href={href} className="flex min-h-12 flex-col items-center justify-center gap-1 px-1">
              <span className={`grid h-7 w-9 place-items-center rounded-md ${isActive ? "bg-blue-50 text-msm-blue" : "text-slate-500"}`}>
                <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span className={`text-[10px] font-bold ${isActive ? "text-msm-blue" : "text-slate-500"}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
