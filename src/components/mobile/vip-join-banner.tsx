import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";

export function VipJoinBanner() {
  return (
    <section className="mx-3 mt-5 rounded-lg border border-blue-200 bg-msm-navy p-5 text-white shadow-soft">
      <span className="grid h-10 w-10 place-items-center rounded-md bg-white/10 text-msm-ice"><Store size={20} /></span>
      <h2 className="mt-3 text-lg font-black">Vende con MSM my store</h2>
      <p className="mt-1 text-sm font-semibold leading-5 text-msm-ice/85">Crea tu perfil VIP y publica productos, servicios o remesas por zona.</p>
      <Link href="/vendedores/solicitud" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-bold text-msm-navy">
        Solicitar perfil VIP <ArrowRight size={16} />
      </Link>
    </section>
  );
}
