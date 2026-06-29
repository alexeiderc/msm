import Link from "next/link";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";

export function TrustPage({
  title,
  intro,
  items
}: {
  title: string;
  intro: string;
  items: string[];
}) {
  return (
    <AppShell>
      <section className="mx-auto max-w-4xl px-4 py-8 pb-24">
        <Badge>Confianza MSM</Badge>
        <h1 className="mt-3 text-3xl font-bold md:text-5xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{intro}</p>
        <div className="mt-6 grid gap-3">
          {items.map((item) => (
            <div key={item} className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-msm-blue">
          <Link href="/payment-methods">Metodos activos</Link>
          <Link href="/support">Soporte</Link>
          <Link href="/vendedores/solicitud">Ser vendedor VIP</Link>
        </div>
      </section>
    </AppShell>
  );
}
