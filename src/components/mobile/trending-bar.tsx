import Link from "next/link";
import { TrendingUp } from "lucide-react";

const trends = ["Smart TV", "Nevera", "Combos", "Remesas", "Energia solar"];

export function TrendingBar() {
  return (
    <section className="flex items-center gap-2 overflow-x-auto border-b border-msm-line bg-white px-3 py-2.5 scrollbar-hide">
      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-black text-msm-navy"><TrendingUp size={14} className="text-msm-blue" /> Tendencias</span>
      <div className="flex gap-1.5">
        {trends.map((trend) => (
          <Link key={trend} href={`/products?q=${encodeURIComponent(trend)}`} className="shrink-0 rounded-md border border-msm-line bg-msm-cloud px-2.5 py-1.5 text-xs font-bold text-slate-600 transition active:border-msm-blue active:bg-blue-50 active:text-msm-blue">
            {trend}
          </Link>
        ))}
      </div>
    </section>
  );
}
