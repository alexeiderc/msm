"use client";

import { FormEvent, useMemo, useState } from "react";
import { QrCode, ShieldCheck } from "lucide-react";

const demoCodePrefix = "MSM-QR";

export function AtmReservationSimulator() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    province: "Santiago de Cuba",
    municipality: "Segundo Frente",
    currency: "USD",
    amount: "100",
    method: "Zelle"
  });

  const reservationCode = useMemo(() => {
    const cleanAmount = form.amount.replace(/\D/g, "").slice(0, 5) || "000";
    return `${demoCodePrefix}-${form.municipality.slice(0, 3).toUpperCase()}-${cleanAmount}`;
  }, [form.amount, form.municipality]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="rounded-lg border border-msm-line bg-white p-5 shadow-lift">
      <div className="flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-msm-blue text-white">
          <QrCode size={19} />
        </span>
        <div>
          <h2 className="font-bold text-msm-ink">Reserva de efectivo demo</h2>
          <p className="text-sm text-slate-600">Flujo preparado para pago, QR temporal, auditoria y ledger.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid gap-3 md:grid-cols-2">
        {[
          ["province", "Provincia / Estado"],
          ["municipality", "Municipio / Ciudad"],
          ["currency", "Moneda a recibir"],
          ["amount", "Monto solicitado"],
          ["method", "Metodo de pago"]
        ].map(([name, label]) => (
          <label key={name} className={name === "method" ? "md:col-span-2" : ""}>
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
            <input
              value={form[name as keyof typeof form]}
              onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
              className="mt-1 min-h-11 w-full rounded-md border border-msm-silver px-3 text-sm font-semibold outline-none focus:border-msm-blue focus:ring-2 focus:ring-blue-100"
            />
          </label>
        ))}
        <button className="inline-flex min-h-11 items-center justify-center rounded-md bg-msm-blue px-4 text-sm font-bold text-white shadow-glow md:col-span-2">
          Generar reserva demo
        </button>
      </form>

      {submitted ? (
        <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="flex items-center gap-2 font-bold text-msm-ink">
            <ShieldCheck size={18} className="text-msm-blue" />
            Reserva creada en modo prueba
          </p>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-700">
            <span>Estado: pendiente_pago</span>
            <span>QR temporal: {reservationCode}</span>
            <span>Vence: 30 minutos despues de pago confirmado</span>
            <span>Entrega: VIP o Cajero MSM disponible por zona</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
