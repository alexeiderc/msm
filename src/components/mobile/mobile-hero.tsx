import Link from "next/link";

export function MobileHero() {
  return (
    <section className="mx-3 mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-[#020B2D] via-[#0A1E6B] to-violet-700 p-6 text-white shadow-xl">
      <p className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white/90">
        MSM Marketplace
      </p>
      <h2 className="mt-3 text-2xl font-black leading-tight">
        Todo lo que necesitas,
        <br />
        en un solo lugar
      </h2>
      <p className="mt-2 text-sm font-semibold text-white/75">Compra seguro. Recibe en Cuba.</p>
      <Link
        href="/products"
        className="mt-4 inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-white px-6 text-sm font-extrabold text-[#020B2D] shadow-lg transition active:scale-[0.97]"
      >
        Comprar ahora
      </Link>
    </section>
  );
}
