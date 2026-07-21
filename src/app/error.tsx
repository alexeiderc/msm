"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-msm-cloud px-4">
      <h1 className="text-4xl font-bold text-msm-ink">Algo salio mal</h1>
      <p className="max-w-md text-center text-slate-600">
        Ocurrio un error inesperado. Nuestro equipo ha sido notificado.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-msm-blue px-6 py-3 text-sm font-bold text-white transition hover:bg-msm-electric"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
