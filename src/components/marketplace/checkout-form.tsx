"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useState } from "react";
import { FileCheck, LockKeyhole, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { createCheckoutOrder, type ActionState } from "@/server/actions/orders";
import {
  cubaLocations,
  demoMunicipalityId,
  demoProvinceId,
  getMunicipalitiesForProvince
} from "@/lib/cuba-locations";

const legalCopy =
  "MSM actua como plataforma tecnologica, intermediario de pagos y organizador digital. Los productos, garantias, entregas y calidad son responsabilidad del vendedor independiente. Las demoras por clima, transporte, electricidad o disposiciones oficiales quedan como fuerza mayor. Las reclamaciones deben enviarse por escrito a commercial@msmmystore.com dentro de 30 dias.";

const initialState: ActionState = {
  ok: false,
  message: ""
};

export function CheckoutForm({ productId }: { productId?: string }) {
  const [state, formAction, pending] = useActionState(createCheckoutOrder, initialState);
  const [province, setProvince] = useState("Santiago de Cuba");
  const [municipality, setMunicipality] = useState("Segundo Frente");
  const municipalities = getMunicipalitiesForProvince(province);

  function handleProvinceChange(nextProvince: string) {
    const nextMunicipalities = getMunicipalitiesForProvince(nextProvince);
    setProvince(nextProvince);
    setMunicipality(nextMunicipalities[0] ?? "");
  }

  return (
    <div className="rounded-lg border border-msm-line bg-white p-4 shadow-soft md:p-6">
      <div className="flex items-center gap-2">
        <MapPin className="text-msm-blue" size={22} />
        <h1 className="text-2xl font-bold">Datos del receptor en Cuba</h1>
      </div>

      <form action={formAction} className="mt-6 grid gap-4">
        <input type="hidden" name="productId" value={productId ?? ""} />
        <input type="hidden" name="quantity" value="1" />
        <input type="hidden" name="provinceId" value={demoProvinceId(province)} />
        <input type="hidden" name="municipalityId" value={demoMunicipalityId(province, municipality)} />
        <input type="hidden" name="receiverProvinceName" value={province} />
        <input type="hidden" name="receiverMunicipalityName" value={municipality} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold">
            Nombre completo
            <Input name="receiverFullName" required placeholder="Nombre y apellidos" />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            Telefono
            <Input name="receiverPhone" required placeholder="+53 ..." />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            Provincia
            <Select value={province} onChange={(event) => handleProvinceChange(event.target.value)} required>
              {cubaLocations.map((location) => (
                <option key={location.province} value={location.province}>
                  {location.province}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1 text-sm font-semibold">
            Municipio
            <Select value={municipality} onChange={(event) => setMunicipality(event.target.value)} required>
              {municipalities.map((municipalityName) => (
                <option key={municipalityName} value={municipalityName}>
                  {municipalityName}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <label className="space-y-1 text-sm font-semibold">
          Direccion
          <Textarea name="address" required placeholder="Calle, numero, reparto, entre calles" />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          Referencias
          <Input name="references" required placeholder="Color de casa, punto cercano, instrucciones" />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          Horario de entrega
          <Input name="deliveryWindow" required placeholder="Ej. lunes a viernes, 9:00 a 13:00" />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          Nota opcional
          <Textarea name="note" placeholder="Preferencias o aclaraciones para el VIP" />
        </label>

        <div className="rounded-lg border border-msm-line bg-slate-50 p-4">
          <h2 className="text-base font-bold">Metodo de pago manual</h2>
          <p className="mt-1 text-sm text-slate-600">
            Aqui solo se muestra el metodo. La cuenta exacta se entrega dentro de la orden creada.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm font-semibold">
              Pais
              <Select name="paymentCountry" required>
                <option value="">Seleccionar</option>
                <option value="Estados Unidos">Estados Unidos</option>
                <option value="Espana">Espana</option>
                <option value="Mexico">Mexico</option>
                <option value="Global">Global</option>
              </Select>
            </label>
            <label className="space-y-1 text-sm font-semibold">
              Moneda
              <Select name="paymentCurrency" required>
                <option value="">Seleccionar</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="MXN">MXN</option>
                <option value="USDT">USDT</option>
              </Select>
            </label>
            <label className="space-y-1 text-sm font-semibold">
              Metodo
              <Select name="paymentMethodId" required>
                <option value="">Seleccionar</option>
                <option value="00000000-0000-4000-8000-000000000501">Zelle activo</option>
                <option value="00000000-0000-4000-8000-000000000502">USDT activo</option>
                <option value="00000000-0000-4000-8000-000000000503">Oxxo pausado</option>
              </Select>
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2 font-bold text-msm-navy">
            <FileCheck size={18} />
            Politicas legales del checkout
          </div>
          <p className="mt-2 text-sm leading-6 text-msm-ink">{legalCopy}</p>
          <Link href="/terms" className="mt-3 inline-flex text-sm font-bold text-msm-blue underline">
            Leer terminos y condiciones completos
          </Link>
          <label className="mt-4 flex items-start gap-3 text-sm font-semibold">
            <input name="legalAccepted" type="checkbox" required className="mt-1 h-5 w-5" />
            Acepto las politicas legales y autorizo el registro auditable de esta aceptacion.
          </label>
        </div>

        {state.message ? (
          <p className={state.ok ? "text-sm font-semibold text-msm-blue" : "text-sm font-semibold text-red-700"}>
            {state.orderNumber ? `${state.message} ${state.orderNumber}` : state.message}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} className="w-full md:w-auto">
          <LockKeyhole size={17} />
          {pending ? "Registrando..." : "Confirmar orden pendiente de pago"}
        </Button>
      </form>
    </div>
  );
}
