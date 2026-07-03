import Link from "next/link";

const trends = [
  "iPhone",
  "Smart TV 4K",
  "Aire Split",
  "Combos",
  "Remesas",
  "Nevera",
  "Laptop",
  "Motocicleta",
  "Zapatos",
  "Perfume",
];

export function TrendingBar() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 bg-white px-3 py-2.5 scrollbar-hide">
      <span className="shrink-0 text-sm font-extrabold text-violet-600">⚡ Tendencias</span>
      <div className="flex gap-1.5">
        {trends.map((t) => (
          <Link
            key={t}
            href={`/products?q=${encodeURIComponent(t)}`}
            className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition active:bg-violet-50 active:text-violet-700"
          >
            {t}
          </Link>
        ))}
      </div>
    </div>
  );
}
