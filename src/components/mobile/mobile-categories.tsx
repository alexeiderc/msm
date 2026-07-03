import Link from "next/link";
import {
  Monitor,
  Home,
  Shirt,
  Sparkles,
  Dumbbell,
  ChevronRight,
} from "lucide-react";

const categories = [
  ["Electrónica", "/products?category=Electronica", Monitor],
  ["Hogar", "/products?category=Hogar", Home],
  ["Moda", "/products?category=Moda", Shirt],
  ["Belleza", "/products?category=Belleza", Sparkles],
  ["Deportes", "/products?category=Deportes", Dumbbell],
] as const;

export function MobileCategories() {
  return (
    <section className="mt-4 px-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-800">Categorías</h3>
        <Link
          href="/products"
          className="flex items-center gap-0.5 text-xs font-bold text-msm-blue"
        >
          Ver más <ChevronRight size={14} />
        </Link>
      </div>
      <div className="mt-3 flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(([label, href, Icon]) => (
          <Link
            key={href}
            href={href}
            className="flex shrink-0 flex-col items-center gap-1.5"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 text-msm-blue shadow-sm ring-1 ring-slate-200/60">
              <Icon size={24} />
            </span>
            <span className="text-[11px] font-bold text-slate-600">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
