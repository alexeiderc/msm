"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, Minus, Plus, CheckCircle, Loader2 } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { getCart, removeFromCart, updateQuantity, clearCart, type CartItem } from "@/lib/cart-store";
import { cubaProvinces, getMunicipalitiesForProvince } from "@/lib/cuba-locations";
import { sendWhatsAppCart } from "@/server/actions/whatsapp-cart";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ cartId: string; adminLink: string } | null>(null);
  const [error, setError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryProvince, setDeliveryProvince] = useState("");
  const [deliveryMunicipality, setDeliveryMunicipality] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [beneficiaryPhone, setBeneficiaryPhone] = useState("");

  const municipalities = deliveryProvince ? getMunicipalitiesForProvince(deliveryProvince) : [];

  useEffect(() => {
    setItems(getCart());
    setLoaded(true);
  }, []);

  function refresh() {
    setItems([...getCart()]);
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const grouped = items.reduce<Record<string, CartItem[]>>((acc, item) => {
    if (!acc[item.store]) acc[item.store] = [];
    acc[item.store].push(item);
    return acc;
  }, {});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      const result = await sendWhatsAppCart({
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          currency: i.currency,
          quantity: i.quantity,
          store: i.store,
          slug: i.slug,
        })),
        totalAmount: total,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        deliveryAddress,
        deliveryProvince,
        deliveryMunicipality,
        beneficiaryName: beneficiaryName || undefined,
        beneficiaryPhone: beneficiaryPhone || undefined,
      });

      setResult(result);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el carrito");
    } finally {
      setSending(false);
    }
  }

  if (!loaded) return null;

  if (result) {
    return (
      <AppShell>
        <section className="mx-auto max-w-2xl px-4 py-12 pb-24 text-center">
          <CheckCircle className="mx-auto text-green-500" size={64} />
          <h1 className="mt-4 text-3xl font-bold">Pedido enviado por WhatsApp</h1>
          <p className="mt-3 text-lg text-slate-600">
            Hemos recibido tu pedido y lo hemos enviado a nuestro equipo para procesarlo.
          </p>
          <div className="mt-6 rounded-lg border border-msm-line bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-600">Usa este enlace para dar seguimiento a tu pedido:</p>
            <a
              href={result.adminLink}
              className="mt-2 inline-block break-all text-msm-blue underline"
            >
              {result.adminLink}
            </a>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-msm-blue px-5 text-sm font-bold text-white"
            >
              Seguir comprando
            </Link>
            <Link
              href={result.adminLink}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-msm-line px-5 text-sm font-bold"
            >
              Ver estado del pedido
            </Link>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-8 pb-24">
        <div className="flex items-center gap-2">
          <ShoppingBag className="text-msm-blue" size={26} />
          <h1 className="text-3xl font-bold">Carrito de compras</h1>
        </div>

        {items.length === 0 ? (
          <article className="mt-6 rounded-lg border border-msm-line bg-white p-8 text-center shadow-soft">
            <p className="text-slate-600">Tu carrito esta vacio.</p>
            <Link
              href="/products"
              className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-msm-blue px-5 text-sm font-bold text-white"
            >
              Ver productos
            </Link>
          </article>
        ) : (
          <>
            {Object.entries(grouped).map(([store, storeItems]) => (
              <article key={store} className="mt-6 rounded-lg border border-msm-line bg-white shadow-soft">
                <div className="border-b border-msm-line bg-slate-50 px-4 py-3">
                  <h2 className="font-bold">{store}</h2>
                </div>
                {storeItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 border-b border-msm-line px-4 py-3 last:border-0">
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${item.slug}`} className="font-bold hover:text-msm-blue">
                        {item.name}
                      </Link>
                      <p className="text-sm text-slate-600">
                        {item.currency} {item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { updateQuantity(item.productId, item.quantity - 1); refresh(); }}
                        className="grid h-8 w-8 place-items-center rounded border text-slate-600 hover:bg-slate-100"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-[2rem] text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => { updateQuantity(item.productId, item.quantity + 1); refresh(); }}
                        className="grid h-8 w-8 place-items-center rounded border text-slate-600 hover:bg-slate-100"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="min-w-[5rem] text-right font-bold">
                      {(item.price * item.quantity).toFixed(2)} {item.currency}
                    </p>
                    <button
                      onClick={() => { removeFromCart(item.productId); refresh(); }}
                      className="grid h-8 w-8 place-items-center rounded text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </article>
            ))}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
              <div>
                <p className="text-sm text-slate-600">Total estimado</p>
                <p className="text-2xl font-bold">${total.toFixed(2)} USD</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => { clearCart(); refresh(); }}
                  className="rounded-md border border-msm-line px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  Vaciar carrito
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-msm-blue px-6 text-sm font-bold text-white"
                >
                  Enviar pedido por WhatsApp
                </button>
              </div>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-msm-line bg-white p-6 shadow-soft">
                <h2 className="text-xl font-bold">Datos del pedido</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Completa tus datos para enviar el pedido a nuestro equipo por WhatsApp
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold">Nombre completo *</label>
                    <input
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="mt-1 w-full rounded-md border border-msm-line px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Teléfono de contacto *</label>
                    <input
                      required
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="mt-1 w-full rounded-md border border-msm-line px-3 py-2 text-sm"
                      placeholder="+53 5 1234567"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Correo electrónico</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="mt-1 w-full rounded-md border border-msm-line px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold">Dirección de entrega *</label>
                    <input
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="mt-1 w-full rounded-md border border-msm-line px-3 py-2 text-sm"
                      placeholder="Calle, número, reparto, referencia"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Provincia *</label>
                    <select
                      required
                      value={deliveryProvince}
                      onChange={(e) => { setDeliveryProvince(e.target.value); setDeliveryMunicipality(""); }}
                      className="mt-1 w-full rounded-md border border-msm-line px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar provincia</option>
                      {cubaProvinces.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Municipio *</label>
                    <select
                      required
                      value={deliveryMunicipality}
                      onChange={(e) => setDeliveryMunicipality(e.target.value)}
                      className="mt-1 w-full rounded-md border border-msm-line px-3 py-2 text-sm"
                      disabled={!deliveryProvince}
                    >
                      <option value="">Seleccionar municipio</option>
                      {municipalities.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-msm-line pt-4 sm:col-span-2">
                    <h3 className="font-bold">Datos del beneficiario (opcional)</h3>
                    <p className="text-xs text-slate-500">Si el pedido es para otra persona</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Nombre del beneficiario</label>
                    <input
                      value={beneficiaryName}
                      onChange={(e) => setBeneficiaryName(e.target.value)}
                      className="mt-1 w-full rounded-md border border-msm-line px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Teléfono del beneficiario</label>
                    <input
                      type="tel"
                      value={beneficiaryPhone}
                      onChange={(e) => setBeneficiaryPhone(e.target.value)}
                      className="mt-1 w-full rounded-md border border-msm-line px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6 rounded-lg bg-slate-50 p-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total del pedido</span>
                    <span>${total.toFixed(2)} USD</span>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md bg-green-600 px-6 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="animate-spin" size={18} /> : null}
                    {sending ? "Enviando..." : "Enviar pedido por WhatsApp"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-md border border-msm-line px-4 py-2 text-sm font-semibold text-slate-600"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </section>
    </AppShell>
  );
}
