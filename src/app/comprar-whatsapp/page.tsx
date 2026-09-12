"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, MessageCircle, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { cubaProvinces, getMunicipalitiesForProvince } from "@/lib/cuba-locations";
import { sendWhatsAppCart } from "@/server/actions/whatsapp-cart";

type ProductSummary = {
  id: string;
  name: string;
  price: number;
  currency: string;
  store: string;
  slug: string;
  image?: string;
};

function ComprarWhatsAppForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("product") || "";
  const productName = searchParams.get("name") || "";
  const productPrice = Number(searchParams.get("price") || "0");
  const productCurrency = searchParams.get("currency") || "USD";
  const productStore = searchParams.get("store") || "Tienda VIP";
  const productSlug = searchParams.get("slug") || "";

  const [product, setProduct] = useState<ProductSummary | null>(
    productId
      ? {
          id: productId,
          name: productName || "Producto seleccionado",
          price: productPrice,
          currency: productCurrency,
          store: productStore,
          slug: productSlug,
        }
      : null
  );

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryProvince, setDeliveryProvince] = useState("");
  const [deliveryMunicipality, setDeliveryMunicipality] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [beneficiaryPhone, setBeneficiaryPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    cartId: string;
    adminLink: string;
    waMeLink: string;
  } | null>(null);

  const municipalities = deliveryProvince ? getMunicipalitiesForProvince(deliveryProvince) : [];
  const total = product ? product.price * quantity : 0;

  useEffect(() => {
    if (!productId && !productName) {
      // No product provided – user can still type freely, but we prefer product context
    }
  }, [productId, productName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      if (!product) {
        throw new Error("No se ha seleccionado un producto");
      }

      const res = await sendWhatsAppCart({
        items: [
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            currency: product.currency,
            quantity,
            store: product.store,
            slug: product.slug,
          },
        ],
        totalAmount: total,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        deliveryAddress,
        deliveryProvince,
        deliveryMunicipality,
        beneficiaryName: beneficiaryName || undefined,
        beneficiaryPhone: beneficiaryPhone || undefined,
        notes: notes || undefined,
      });

      setResult(res);

      // Open WhatsApp with the pre-filled message
      if (res.waMeLink) {
        window.open(res.waMeLink, "_blank");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el pedido");
    } finally {
      setSending(false);
    }
  }

  if (result) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12 pb-24 text-center">
        <CheckCircle className="mx-auto text-green-500" size={64} />
        <h1 className="mt-4 text-3xl font-bold">Pedido listo para WhatsApp</h1>
        <p className="mt-3 text-lg text-slate-700">
          Hemos guardado tu pedido y abierto WhatsApp con el mensaje preparado.
          Solo tienes que pulsar <strong>Enviar</strong> en WhatsApp.
        </p>

        <div className="mt-6 rounded-lg border border-msm-line bg-white p-6 shadow-soft text-left">
          <p className="text-sm text-slate-600">Si WhatsApp no se abrió automáticamente:</p>
          <a
            href={result.waMeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md bg-green-600 px-5 text-sm font-bold text-white hover:bg-green-700"
          >
            <MessageCircle size={18} />
            Abrir WhatsApp ahora
          </a>

          <p className="mt-5 text-sm text-slate-600">Link de seguimiento del pedido:</p>
          <a href={result.adminLink} className="mt-1 block break-all text-sm text-msm-blue underline">
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
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-8 pb-24">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-msm-blue">
        <ArrowLeft size={16} /> Volver a productos
      </Link>

      <h1 className="mt-4 text-3xl font-bold">Comprar por WhatsApp</h1>
      <p className="mt-2 text-slate-600">
        Completa tus datos y te enviamos el pedido directamente por WhatsApp. No necesitas crear cuenta.
      </p>

      {product ? (
        <div className="mt-6 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">{product.store}</p>
              <h2 className="text-xl font-bold">{product.name}</h2>
              <p className="mt-1 text-lg font-bold text-msm-blue">
                ${product.price.toFixed(2)} {product.currency}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold">Cantidad</label>
              <input
                type="number"
                min={1}
                max={20}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-16 rounded-md border border-msm-line px-2 py-1 text-center text-sm"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-between border-t border-msm-line pt-3 text-base font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)} {product.currency}</span>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No se detectó un producto. Vuelve al catálogo y elige “Comprar por WhatsApp” desde un producto.
          <div className="mt-3">
            <Link href="/products" className="font-bold text-msm-blue underline">
              Ir a productos
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-msm-line bg-white p-6 shadow-soft">
        <h2 className="text-xl font-bold">Tus datos</h2>
        <p className="mt-1 text-sm text-slate-600">Los campos con * son obligatorios</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold">Nombre completo *</label>
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 w-full rounded-md border border-msm-line px-3 py-2 text-sm"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Teléfono / WhatsApp *</label>
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
              placeholder="opcional"
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
              onChange={(e) => {
                setDeliveryProvince(e.target.value);
                setDeliveryMunicipality("");
              }}
              className="mt-1 w-full rounded-md border border-msm-line px-3 py-2 text-sm"
            >
              <option value="">Seleccionar provincia</option>
              {cubaProvinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
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
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-msm-line pt-4 sm:col-span-2">
            <h3 className="font-bold">Beneficiario (opcional)</h3>
            <p className="text-xs text-slate-500">Si el pedido es para otra persona en Cuba</p>
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

          <div className="sm:col-span-2">
            <label className="text-sm font-semibold">Notas del pedido</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-msm-line px-3 py-2 text-sm"
              placeholder="Instrucciones especiales, horario preferido, etc."
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={sending || !product}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-green-600 px-6 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {sending ? <Loader2 className="animate-spin" size={18} /> : <MessageCircle size={18} />}
            {sending ? "Preparando..." : "Enviar por WhatsApp"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-msm-line px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

export default function ComprarWhatsAppPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
        <ComprarWhatsAppForm />
      </Suspense>
    </AppShell>
  );
}
