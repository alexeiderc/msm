"use client";

import { useActionState } from "react";
import { useState } from "react";
import { Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { createRemittance } from "@/server/actions/remittances";
import { emptyActionResult } from "@/types/actions";
import { receiveMethods } from "@/lib/remittance-methods";
import { cubaLocations, getMunicipalitiesForProvince } from "@/lib/cuba-locations";

type RemittanceMethodOption = {
  id: string;
  name: string;
  country: string;
  currency: string;
  type: string;
};

export function RemittanceForm({ methods }: { methods: RemittanceMethodOption[] }) {
  const [state, formAction, pending] = useActionState(createRemittance, emptyActionResult);
  const [recipientProvince, setRecipientProvince] = useState("Santiago de Cuba");
  const [recipientMunicipality, setRecipientMunicipality] = useState("Segundo Frente");
  const recipientMunicipalities = getMunicipalitiesForProvince(recipientProvince);

  function handleRecipientProvinceChange(nextProvince: string) {
    const nextMunicipalities = getMunicipalitiesForProvince(nextProvince);
    setRecipientProvince(nextProvince);
    setRecipientMunicipality(nextMunicipalities[0] ?? "");
  }

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border border-msm-silver bg-white p-4 shadow-lift md:p-6">
      <h2 className="text-xl font-bold">Crear solicitud de remesa</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Input name="senderFullName" placeholder="Nombre completo de quien envia" required />
        <Input name="senderPhone" placeholder="Telefono de quien envia" required />
        <Select name="senderCountry" required defaultValue="Estados Unidos">
          <option value="Estados Unidos">Estados Unidos</option>
          <option value="Espana">Espana</option>
          <option value="Mexico">Mexico</option>
          <option value="Global">Global</option>
        </Select>
        <Select name="senderCurrency" required defaultValue="USD">
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="MXN">MXN</option>
          <option value="USDT">USDT</option>
        </Select>
        <Input name="sendAmount" type="number" step="0.01" min="1" placeholder="Monto a enviar" required />
        <Select name="paymentMethodId" required defaultValue={methods[0]?.id ?? ""}>
          <option value="">Selecciona metodo de pago</option>
          {methods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.name} - {method.country} / {method.currency}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input name="recipientFullName" placeholder="Nombre completo del receptor en Cuba" required />
        <Input name="recipientPhone" placeholder="Telefono del receptor" required />
        <Select
          name="recipientProvince"
          required
          value={recipientProvince}
          onChange={(event) => handleRecipientProvinceChange(event.target.value)}
        >
          {cubaLocations.map((location) => (
            <option key={location.province} value={location.province}>
              {location.province}
            </option>
          ))}
        </Select>
        <Select
          name="recipientMunicipality"
          required
          value={recipientMunicipality}
          onChange={(event) => setRecipientMunicipality(event.target.value)}
        >
          <option value="">Municipio</option>
          {recipientMunicipalities.map((municipality) => (
            <option key={municipality} value={municipality}>
              {municipality}
            </option>
          ))}
        </Select>
        <Input name="recipientAddress" placeholder="Direccion o referencia" required />
        <Select name="payoutMethod" required defaultValue="cup_efectivo">
          {receiveMethods.map((method) => (
            <option key={method.value} value={method.value}>{method.label}</option>
          ))}
        </Select>
        <Select name="payoutCurrency" required defaultValue="CUP">
          {receiveMethods.map((method) => (
            <option key={method.value} value={method.currency}>{method.label} - {method.currency}</option>
          ))}
        </Select>
      </div>

      <Textarea name="note" placeholder="Nota opcional para economia o entrega de la remesa" />

      <label className="flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-msm-ink">
        <input name="legalAccepted" type="checkbox" required className="mt-1 h-5 w-5 accent-msm-blue" />
        Acepto que MSM my store revisara el pago, asignara cuenta disponible y registrara esta remesa de forma auditable.
      </label>

      {state.message ? (
        <div className={state.ok ? "rounded-md border border-blue-200 bg-blue-50 p-3" : ""}>
          <p className={state.ok ? "text-sm font-semibold text-msm-blue" : "text-sm font-semibold text-red-700"}>
            {state.orderNumber ? `${state.message} Numero: ${state.orderNumber}` : state.message}
          </p>
          {state.ok && state.id ? (
            <Link
              href={`/remittances/${state.id}/proof`}
              className="mt-3 inline-flex min-h-10 items-center justify-center rounded-md bg-msm-blue px-4 py-2 text-sm font-bold text-white transition hover:bg-msm-navy"
            >
              Subir comprobante ahora
            </Link>
          ) : null}
        </div>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full md:w-auto">
        <Send size={17} />
        {pending ? "Creando remesa..." : "Crear remesa pendiente de pago"}
      </Button>
    </form>
  );
}
