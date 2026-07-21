"use client";

import { useActionState } from "react";
import { Camera, CheckCircle2, PackageCheck, Save, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { CubaLocationSelects } from "@/components/forms/cuba-location-selects";
import { createVipProduct, toggleProductActive, updateProductStock } from "@/server/actions/products";
import {
  submitDeliveryEvidence,
  updateVipOrderStatusAction
} from "@/server/actions/orders";
import { acceptSellerAgreement } from "@/server/actions/sellers";
import { emptyActionResult, type ActionResult } from "@/types/actions";

function ActionMessage({ state }: { state: ActionResult }) {
  if (!state.message) return null;

  return (
    <p className={state.ok ? "text-sm font-semibold text-msm-blue" : "text-sm font-semibold text-red-700"}>
      {state.id ? `${state.message} ID: ${state.id}` : state.message}
    </p>
  );
}

export function VipProductForm() {
  const [state, formAction, pending] = useActionState(createVipProduct, emptyActionResult);

  return (
    <form action={formAction} className="mt-4 grid gap-3">
      <Input name="name" placeholder="Nombre del producto" required />
      <Select name="categorySlug" required defaultValue="alimentos">
        <option value="alimentos">Alimentos</option>
        <option value="ferreteria">Ferreteria</option>
        <option value="energia-solar">Energia solar</option>
        <option value="electrodomesticos">Electrodomesticos</option>
        <option value="servicios">Servicios</option>
        <option value="remesas">Remesas</option>
        <option value="productos-generales">Productos generales</option>
      </Select>
      <Input name="subcategory" placeholder="Subcategoria" />
      <div className="grid grid-cols-3 gap-3">
        <Input name="price" type="number" step="0.01" placeholder="Precio" required />
        <Input name="currency" placeholder="Moneda" defaultValue="USD" required />
        <Input name="stock" type="number" placeholder="Stock" required />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <CubaLocationSelects />
        <Input name="deliveryZone" placeholder="Zona de entrega" />
      </div>
      <Select name="promisedSla" defaultValue="h48">
        <option value="h24">24h</option>
        <option value="h48">48h</option>
        <option value="h72">72h</option>
        <option value="bajo_gestion">Bajo gestion</option>
      </Select>
      <Select name="status" defaultValue="activo">
        <option value="activo">Activo</option>
        <option value="borrador">Borrador</option>
        <option value="pausado">Pausado</option>
        <option value="agotado">Agotado</option>
      </Select>
      <Textarea name="description" placeholder="Descripcion, zonas de entrega, horarios y condiciones" />
      <Input name="imageUrl" type="url" placeholder="URL de imagen del producto" />
      <Textarea name="galleryUrls" placeholder="Galeria: una URL por linea o separadas por coma" />
      <Input name="warranty" placeholder="Garantia" />
      <Input name="availability" placeholder="stock real, por confirmar, bajo gestion" />
      <Textarea name="internalNotes" placeholder="Notas internas" />
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input name="isActive" type="checkbox" defaultChecked className="h-5 w-5" />
        Publicar activo
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input name="featured" type="checkbox" className="h-5 w-5" />
        Destacar producto
      </label>
      <ActionMessage state={state} />
      <Button type="submit" disabled={pending}>
        <Save size={17} />
        {pending ? "Guardando..." : "Guardar producto"}
      </Button>
    </form>
  );
}

export function StockUpdateForm() {
  const [state, formAction, pending] = useActionState(updateProductStock, emptyActionResult);

  return (
    <form action={formAction} className="mt-4 grid gap-3">
      <Input name="productId" placeholder="ID producto real" required />
      <Input name="stock" type="number" placeholder="Nuevo stock" required />
      <ActionMessage state={state} />
      <Button type="submit" disabled={pending}>
        {pending ? "Actualizando..." : "Editar stock"}
      </Button>
    </form>
  );
}

export function VipOrderStatusForm() {
  const [state, formAction, pending] = useActionState(updateVipOrderStatusAction, emptyActionResult);

  return (
    <form action={formAction} className="mt-4 grid gap-3">
      <Input name="orderId" placeholder="ID interno de la orden" required />
      <Select name="status" defaultValue="confirmada_vip">
        <option value="confirmada_vip">Confirmar disponibilidad</option>
        <option value="preparando">Preparando</option>
        <option value="en_ruta">En ruta</option>
        <option value="incidencia">Incidencia</option>
        <option value="cancelada">Cancelar</option>
      </Select>
      <Input name="note" placeholder="Nota opcional" />
      <ActionMessage state={state} />
      <Button type="submit" disabled={pending}>
        <CheckCircle2 size={17} />
        {pending ? "Guardando..." : "Guardar estado"}
      </Button>
    </form>
  );
}

export function DeliveryEvidenceForm() {
  const [state, formAction, pending] = useActionState(submitDeliveryEvidence, emptyActionResult);

  return (
    <form action={formAction} className="mt-4 grid gap-3">
      <Input name="orderId" placeholder="ID interno de la orden" required />
      <Input name="photoUrl" type="url" placeholder="URL foto evidencia" />
      <Input name="signatureUrl" type="url" placeholder="URL firma o comprobante" />
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="receiverName" placeholder="Nombre de quien recibe" />
        <Input name="receiverDocumentLast4" placeholder="Ultimos digitos documento receptor, si aplica" />
      </div>
      <Input name="otpCode" placeholder="Codigo OTP de entrega" />
      <Textarea name="message" placeholder="Mensaje de entrega, estado del producto y observaciones" />
      <p className="text-xs font-semibold leading-5 text-slate-500">
        La orden solo se marca entregada con evidencia valida: foto, firma u OTP correcto. Si Economia genero OTP,
        el codigo debe coincidir.
      </p>
      <ActionMessage state={state} />
      <Button type="submit" disabled={pending}>
        <Camera size={17} />
        {pending ? "Subiendo..." : "Guardar evidencia y entregar"}
      </Button>
    </form>
  );
}

export function SellerAgreementForm() {
  const [state, formAction, pending] = useActionState(acceptSellerAgreement, emptyActionResult);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3 md:flex-row">
      <input type="hidden" name="version" value="vip-2026-06" />
      <Input name="sellerId" placeholder="ID vendedor opcional" />
      <ActionMessage state={state} />
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Aceptar acuerdo version vip-2026-06"}
      </Button>
    </form>
  );
}

export function ProductToggleForm({ productId, isActive }: { productId: string; isActive: boolean }) {
  const [state, formAction, pending] = useActionState(toggleProductActive, emptyActionResult);

  return (
    <form action={formAction} className="grid gap-1">
      <input type="hidden" name="productId" value={productId} />
      <Button type="submit" disabled={pending} className="min-h-8 min-w-[90px] px-2 text-xs">
        {pending ? "..." : isActive ? "Desactivar" : "Activar"}
      </Button>
      <ActionMessage state={state} />
    </form>
  );
}

export function StaticOrderButtonsNotice() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 md:grid-cols-3">
      <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-msm-line px-2">
        <CheckCircle2 size={15} /> Confirmar
      </span>
      <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-msm-line px-2">
        <PackageCheck size={15} /> Preparar
      </span>
      <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-msm-line px-2">
        <Truck size={15} /> Ruta
      </span>
    </div>
  );
}
