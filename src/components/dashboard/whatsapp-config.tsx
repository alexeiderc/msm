"use client";

import { useEffect, useState } from "react";
import { Save, CheckCircle, Loader2 } from "lucide-react";
import { saveWhatsAppNumber, getWhatsAppNumber } from "@/server/actions/whatsapp-cart";

export function WhatsAppNumberConfig() {
  const [number, setNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWhatsAppNumber().then((data) => {
      setNumber(data.number);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const result = await saveWhatsAppNumber(number);
      if (!result.success) {
        alert("Error: " + result.message);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert("Error al guardar: " + (e instanceof Error ? e.message : "desconocido"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <div className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
      <h2 className="text-lg font-bold">Configuración de WhatsApp</h2>
      <p className="mt-1 text-sm text-slate-600">
        Número al que se enviarán los pedidos del carrito
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[300px] flex-1">
          <label className="text-sm font-semibold">Número de WhatsApp (con código de país)</label>
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="mt-1 w-full rounded-md border border-msm-line px-3 py-2 text-sm"
            placeholder="+5351234567"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !number}
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-msm-blue px-4 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {saving ? "Guardando..." : "Guardar"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
            <CheckCircle size={16} /> Guardado
          </span>
        )}
      </div>
    </div>
  );
}
