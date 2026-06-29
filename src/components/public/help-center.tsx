"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Search, LifeBuoy, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { helpArticles } from "@/lib/help-center";

export function HelpCenter() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const categories = Array.from(new Set(helpArticles.map((article) => article.category))).sort();

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return helpArticles.filter((article) => {
      const matchesCategory = category ? article.category === category : true;
      const haystack = [article.title, article.summary, article.category, ...article.steps].join(" ").toLowerCase();
      const matchesQuery = normalizedQuery ? haystack.includes(normalizedQuery) : true;
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <AppShell>
      <section className="border-b border-white/10 bg-msm-midnight text-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <Badge className="border-white/20 bg-white/10 text-msm-ice">Centro de ayuda</Badge>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold md:text-6xl">Ayuda real para comprar, pagar, reclamar y operar en MSM.</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-msm-ice/80">
            Busca una duda o entra directo al flujo que necesitas: productos, remesas, comprobantes,
            ordenes, tiendas VIP, soporte y confianza.
          </p>
          <div className="mt-7 grid gap-3 rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur md:grid-cols-[1fr_260px]">
            <label className="relative">
              <Search className="absolute left-3 top-3 text-msm-ice/70" size={18} />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="border-white/15 bg-white/95 pl-10"
                placeholder="Buscar: comprobante, remesa, orden, soporte..."
              />
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="min-h-11 rounded-md border border-white/15 bg-white px-3 text-sm font-semibold text-msm-ink"
            >
              <option value="">Todas las areas</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 md:grid-cols-3">
        <Link href="/products" className="rounded-lg border border-msm-line bg-white p-5 shadow-soft transition hover:border-msm-blue">
          <BookOpen className="text-msm-blue" size={24} />
          <h2 className="mt-3 font-bold">Comprar ahora</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Productos, servicios y tiendas VIP por provincia y municipio.</p>
        </Link>
        <Link href="/orders" className="rounded-lg border border-msm-line bg-white p-5 shadow-soft transition hover:border-msm-blue">
          <ShieldCheck className="text-msm-blue" size={24} />
          <h2 className="mt-3 font-bold">Seguir orden</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Estado, comprobante, cuenta asignada y reclamacion por orden.</p>
        </Link>
        <Link href="/support" className="rounded-lg border border-msm-line bg-white p-5 shadow-soft transition hover:border-msm-blue">
          <LifeBuoy className="text-msm-blue" size={24} />
          <h2 className="mt-3 font-bold">Abrir soporte</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Demoras, garantia, producto incorrecto, dano o falta de entrega.</p>
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredArticles.map((article) => (
            <article key={article.id} className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
              <Badge className="border-blue-200 bg-blue-50 text-msm-blue">{article.category}</Badge>
              <h2 className="mt-3 text-xl font-bold text-msm-ink">{article.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{article.summary}</p>
              <ol className="mt-4 grid gap-2 text-sm leading-6 text-slate-700">
                {article.steps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-msm-blue text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              {article.href ? (
                <Link href={article.href} className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-msm-blue px-4 text-sm font-bold text-white">
                  {article.cta ?? "Abrir"}
                </Link>
              ) : null}
            </article>
          ))}
        </div>
        {!filteredArticles.length ? (
          <div className="rounded-lg border border-msm-line bg-white p-6 text-sm font-semibold text-slate-600">
            No encontre esa ayuda. Prueba buscar: orden, pago, remesa, comprobante o soporte.
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
