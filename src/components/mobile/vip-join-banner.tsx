import Link from "next/link";
import { Store } from "lucide-react";

export function VipJoinBanner() {
  return (
    <section className="mx-3 mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-blue-700 p-5 text-white shadow-lg">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
        <Store size={20} />
      </span>
      <h3 className="mt-3 text-lg font-black">¿Eres proveedor o tienda?</h3>
      <p className="mt-1 text-sm font-semibold text-white/80">
        Únete a MSM Marketplace y haz crecer tu negocio.
      </p>
      <Link
        href="/vendedores/solicitud"
        className="mt-4 inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-white px-6 text-sm font-extrabold text-violet-700 shadow-md transition active:scale-[0.97]"
      >
        Unirme ahora
      </Link>
    </section>
  );
}
