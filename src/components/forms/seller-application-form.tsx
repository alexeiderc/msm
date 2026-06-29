"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { submitSellerApplication } from "@/server/actions/sellers";
import { emptyActionResult } from "@/types/actions";
import { MarketLocationSelects } from "@/components/forms/market-location-selects";

export function SellerApplicationForm() {
  const [state, formAction, pending] = useActionState(submitSellerApplication, emptyActionResult);

  return (
    <form action={formAction} className="mt-6 grid gap-4 rounded-lg border border-msm-line bg-white p-4 shadow-soft md:grid-cols-2">
      <Input name="fullName" placeholder="Nombre completo" required />
      <Input name="phone" placeholder="Telefono" required />
      <MarketLocationSelects required />
      <Input name="originCommunity" placeholder="Comunidad de origen" required />
      <Input name="contactHandle" placeholder="WhatsApp o Telegram" required />
      <Input name="categories" placeholder="Categorias separadas por coma" required />
      <Input name="videoUrl" type="url" placeholder="Video demostrando producto o servicio" />
      <Input name="productPhotoUrls" placeholder="URLs de fotos separadas por coma" />
      <Input name="deliveryZone" placeholder="Zona de entrega" required />
      <Input name="weeklyHours" placeholder="Horario" required />
      <Input name="dailyCapacity" type="number" placeholder="Capacidad diaria" required />
      <Textarea name="offeredWarranty" placeholder="Garantia ofrecida" required className="md:col-span-2" />
      <label className="flex items-start gap-3 text-sm font-semibold md:col-span-2">
        <input name="agreementAccepted" type="checkbox" required className="mt-1 h-5 w-5" />
        Acepto que soy responsable por veracidad, disponibilidad, precio, entrega, calidad, garantia, evidencia, tiempos y cumplimiento.
      </label>
      {state.message ? (
        <p className={state.ok ? "text-sm font-semibold text-msm-blue md:col-span-2" : "text-sm font-semibold text-red-700 md:col-span-2"}>
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="md:col-span-2">
        {pending ? "Enviando..." : "Enviar solicitud"}
      </Button>
    </form>
  );
}
