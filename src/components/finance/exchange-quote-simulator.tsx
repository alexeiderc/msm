"use client";

import { FormEvent, useState } from "react";
import { ArrowRightLeft, LockKeyhole } from "lucide-react";

export function ExchangeQuoteSimulator() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    origin: "Zelle",
    destination: "CUP transferencia",
    amount: "100",
    zone: "Segundo Frente, Santiago de Cuba"
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="rounded-lg border border-msm-line bg-white p-5 shadow-lift">
      <div className="flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-msm-midnight text-white">
          <ArrowRightLeft size={19} />
        </span>
        <div>
          <h2 className="font-bold text-msm-ink">Cotizador seguro demo</h2>
          <p className="text-sm text-slate-600">Prepara cambios sin publicar tasas reales ni cuentas privadas.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid gap-3 md:grid-cols-2">
        {[
          ["origin", "Entrego"],
          ["destination", "Recibo"],
          ["amount", "Monto"],
          ["zone", "Zona"]
        ].map(([name, label]) => (
          <label key={name}>
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
            <input
              value={form[name as keyof typeof form]}
              onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
              className="mt-1 min-h-11 w-full rounded-md border border-msm-silver px-3 text-sm font-semibold outline-none focus:border-msm-blue focus:ring-2 focus:ring-blue-100"
            />
          </label>
        ))}
        <button className="inline-flex min-h-11 items-center justify-center rounded-md bg-msm-blue px-4 text-sm font-bold text-white shadow-glow md:col-span-2">
          Solicitar cotizacion demo
        </button>
      </form>

      {submitted ? (
        <div className="mt-5 rounded-lg border border-msm-line bg-msm-cloud p-4">
          <p className="flex items-center gap-2 font-bold text-msm-ink">
            <LockKeyhole size={18} className="text-msm-blue" />
            Cotizacion enviada a revision MSM
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Economia confirma disponibilidad, metodo, zona, riesgo y cuenta asignada dentro de una operacion creada.
          </p>
        </div>
      ) : null}
    </section>
  );
}
