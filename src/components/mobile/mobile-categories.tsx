import Link from "next/link";
import { BatteryCharging, CircleDollarSign, PackageSearch, ShoppingBasket, Store, Wrench } from "lucide-react";

const categories = [
  ["Electro", "/products?category=Electrodomesticos", PackageSearch],
  ["Alimentos", "/products?category=Alimentos", ShoppingBasket],
  ["Remesas", "/remittances", CircleDollarSign],
  ["Servicios", "/products?category=Servicios", Wrench],
  ["Energia", "/products?category=Energia%20solar", BatteryCharging],
  ["Tiendas", "/tiendas-vip", Store],
] as const;

export function MobileCategories() {
  return (
    <section className="mt-5 px-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-msm-ink">Explorar categorias</h2>
        <Link href="/products" className="text-xs font-bold text-msm-blue">Ver todo</Link>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {categories.map(([label, href, Icon]) => (
          <Link key={href} href={href} className="flex min-h-[86px] flex-col items-center justify-center gap-2 rounded-lg border border-msm-line bg-white px-2 text-center shadow-sm transition active:border-msm-blue active:bg-blue-50">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-blue-50 text-msm-blue"><Icon size={19} /></span>
            <span className="text-[11px] font-bold text-slate-700">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
