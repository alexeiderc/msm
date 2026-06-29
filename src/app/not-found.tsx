import Link from "next/link";
import { AppShell } from "@/components/ui/shell";

export default function NotFound() {
  return (
    <AppShell>
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-4 py-12">
        <p className="text-sm font-bold tracking-wide text-msm-blue">MSM my store</p>
        <h1 className="mt-3 text-4xl font-bold text-msm-ink">Pagina no encontrada</h1>
        <p className="mt-3 text-slate-600">
          Esta ruta no existe o fue movida dentro de la plataforma.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md bg-msm-blue px-4 text-sm font-semibold text-white"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
