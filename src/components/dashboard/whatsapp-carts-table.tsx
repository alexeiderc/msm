"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { updateWhatsAppCartStatus } from "@/server/actions/whatsapp-cart";

type CartRow = {
  id: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  total_amount: number | string;
  whatsapp_number: string;
  status: string;
  tracking_code?: string | null;
  fee_amount?: number | string | null;
  admin_notes?: string | null;
  sent_at: string;
};

type Props = {
  carts: CartRow[];
};

export function WhatsAppCartsTable({ carts }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const filtered = carts.filter((c) =>
    [c.customer_name, c.customer_phone, c.id, c.status]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="rounded-lg border border-msm-line bg-white shadow-soft">
      <div className="flex flex-wrap items-center gap-3 border-b border-msm-line p-3">
        <Search size={18} className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente, teléfono o ID..."
          className="flex-1 text-sm outline-none"
        />
        <span className="text-xs text-slate-500">{filtered.length} de {carts.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Total</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Código rastreo</th>
              <th className="p-3">Fee</th>
              <th className="p-3">Enviado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr className="border-t border-msm-line">
                <td className="p-6 text-center text-slate-500" colSpan={7}>
                  No hay pedidos por WhatsApp todavía
                </td>
              </tr>
            ) : (
              filtered.map((cart) => (
                <tr key={cart.id} className="border-t border-msm-line hover:bg-slate-50">
                  <td className="p-3">
                    <p className="font-bold">{cart.customer_name ?? "Sin nombre"}</p>
                    <p className="text-xs text-slate-500">{cart.customer_phone}</p>
                    <p className="text-xs text-slate-400">ID: {cart.id.slice(0, 8)}...</p>
                  </td>
                  <td className="p-3 font-bold">${Number(cart.total_amount).toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      cart.status === "enviado" ? "bg-blue-50 text-blue-700" :
                      cart.status === "procesando" ? "bg-amber-50 text-amber-700" :
                      cart.status === "completado" ? "bg-green-50 text-green-700" :
                      cart.status === "cancelado" ? "bg-red-50 text-red-700" :
                      "bg-slate-50 text-slate-600"
                    }`}>
                      {cart.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs">{cart.tracking_code ?? "—"}</td>
                  <td className="p-3">{cart.fee_amount ? `$${Number(cart.fee_amount).toFixed(2)}` : "—"}</td>
                  <td className="p-3 text-xs text-slate-500">
                    {new Date(cart.sent_at).toLocaleDateString("es-CU", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                    })}
                  </td>
                  <td className="p-3">
                    {editing === cart.id ? (
                      <CartEditForm
                        cart={cart}
                        onDone={() => { setEditing(null); router.refresh(); }}
                      />
                    ) : (
                      <button
                        onClick={() => setEditing(cart.id)}
                        className="rounded-md border border-msm-line px-3 py-1 text-xs font-semibold hover:bg-slate-100"
                      >
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CartEditForm({ cart, onDone }: { cart: CartRow; onDone: () => void }) {
  const [status, setStatus] = useState(cart.status);
  const [trackingCode, setTrackingCode] = useState(cart.tracking_code ?? "");
  const [feeAmount, setFeeAmount] = useState(cart.fee_amount ? String(Number(cart.fee_amount)) : "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateWhatsAppCartStatus(cart.id, {
        status,
        trackingCode: trackingCode || undefined,
        feeAmount: feeAmount ? Number(feeAmount) : undefined,
      });
      onDone();
    } catch {
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded border border-msm-line px-2 py-1 text-xs"
      >
        <option value="enviado">Enviado</option>
        <option value="procesando">Procesando</option>
        <option value="completado">Completado</option>
        <option value="cancelado">Cancelado</option>
      </select>
      <input
        value={trackingCode}
        onChange={(e) => setTrackingCode(e.target.value)}
        placeholder="Código rastreo"
        className="w-24 rounded border border-msm-line px-2 py-1 text-xs"
      />
      <input
        value={feeAmount}
        onChange={(e) => setFeeAmount(e.target.value)}
        placeholder="Fee USD"
        type="number"
        step="0.01"
        className="w-20 rounded border border-msm-line px-2 py-1 text-xs"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-md bg-msm-blue px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
      >
        {saving ? <Loader2 className="animate-spin" size={12} /> : "Guardar"}
      </button>
    </div>
  );
}
