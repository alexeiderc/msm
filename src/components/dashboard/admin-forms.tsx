"use client";

import { useActionState } from "react";
import { Percent, PlusCircle, Route, Store, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { MarketLocationSelects } from "@/components/forms/market-location-selects";
import {
  approveSeller,
  createAdminStoreProduct,
  createManualVipStore,
  reassignOrder,
  reviewCustomerKyc,
  reviewSellerApplication,
  updateSellerCommission
} from "@/server/actions/admin";
import { emptyActionResult, type ActionResult } from "@/types/actions";

function ActionMessage({ state }: { state: ActionResult }) {
  if (!state.message) return null;

  return (
    <p className={state.ok ? "text-sm font-semibold text-msm-blue" : "text-sm font-semibold text-red-700"}>
      {state.message}
    </p>
  );
}

export function ManualVipStoreForm() {
  const [state, formAction, pending] = useActionState(createManualVipStore, emptyActionResult);

  return (
    <form action={formAction} className="mt-4 grid gap-3 rounded-lg border border-msm-line p-4">
      <h3 className="flex items-center gap-2 font-bold"><Store size={17} />Crear perfil VIP / tienda</h3>
      <Input name="commercialName" placeholder="Nombre comercial" required />
      <Input name="ownerName" placeholder="Propietario" required />
      <Input name="companyName" placeholder="Compania, si aplica" />
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="phone" placeholder="Telefono" required />
        <Input name="whatsapp" placeholder="WhatsApp" />
        <Input name="email" type="email" placeholder="Correo" />
        <Select name="type" defaultValue="vendedor_independiente">
          <option value="vendedor_independiente">vendedor independiente</option>
          <option value="tienda_oficial">tienda oficial</option>
        </Select>
        <Select name="level" defaultValue="vendedor_verificado">
          <option value="vendedor_nuevo">vendedor nuevo</option>
          <option value="vendedor_verificado">vendedor verificado</option>
          <option value="vendedor_destacado">vendedor destacado</option>
          <option value="vendedor_vip">vendedor VIP</option>
          <option value="super_vip">super VIP</option>
          <option value="tienda_oficial">tienda oficial</option>
        </Select>
        <Select name="status" defaultValue="activo">
          <option value="activo">activo</option>
          <option value="pausado">pausado</option>
          <option value="suspendido">suspendido</option>
        </Select>
        <MarketLocationSelects required />
      </div>
      <Input name="deliveryZones" placeholder="Zonas o municipios separados por coma" required />
      <Input name="address" placeholder="Direccion opcional" />
      <Input name="categories" placeholder="Categorias separadas por coma" required />
      <Input name="servicesActive" placeholder="Servicios activos separados por coma" />
      <Textarea name="description" placeholder="Descripcion publica" required />
      <Textarea name="warranty" placeholder="Garantia ofrecida" />
      <div className="grid gap-3 md:grid-cols-3">
        <Input name="dailyCapacity" type="number" placeholder="Capacidad diaria" defaultValue="10" required />
        <Input name="commissionRate" type="number" step="0.01" placeholder="Comision %" defaultValue="10" required />
        <Input name="cashAvailable" type="number" step="0.01" placeholder="Efectivo disponible remesas" />
        <Input name="remittanceDailyLimit" type="number" step="0.01" placeholder="Limite diario remesas" />
        <Input name="remittanceEta" placeholder="Tiempo estimado remesas" />
        <Input name="reputationLabel" placeholder="Etiqueta de reputacion" />
      </div>
      <Input name="remittanceDeliveryMethods" placeholder="efectivo, transferencia, pickup, domicilio" />
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input name="remittancesActive" type="checkbox" className="h-5 w-5 accent-msm-blue" />
        Activar remesas para este VIP
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input name="isFeatured" type="checkbox" className="h-5 w-5 accent-msm-blue" />
        Destacar perfil
      </label>
      <ActionMessage state={state} />
      <Button type="submit" disabled={pending} className="bg-msm-blue">
        <PlusCircle size={17} />
        {pending ? "Creando..." : "Crear perfil VIP"}
      </Button>
    </form>
  );
}

export function AdminStoreProductForm() {
  const [state, formAction, pending] = useActionState(createAdminStoreProduct, emptyActionResult);

  return (
    <form action={formAction} className="mt-4 grid gap-3 rounded-lg border border-msm-line p-4">
      <h3 className="flex items-center gap-2 font-bold"><PlusCircle size={17} />Crear producto por tienda</h3>
      <Input name="storeId" placeholder="ID tienda" required />
      <Input name="name" placeholder="Nombre producto o servicio" required />
      <Input name="categorySlug" placeholder="Categoria slug: electrodomesticos, alimentos, remesas..." required />
      <Input name="subcategory" placeholder="Subcategoria" />
      <Textarea name="description" placeholder="Descripcion publica" />
      <div className="grid gap-3 md:grid-cols-3">
        <Input name="price" type="number" step="0.01" placeholder="Precio" required />
        <Input name="currency" placeholder="Moneda" defaultValue="USD" required />
        <Input name="stock" type="number" placeholder="Stock" defaultValue="1" required />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <MarketLocationSelects />
        <Input name="deliveryZone" placeholder="Zona de entrega" />
      </div>
      <Input name="imageUrl" type="url" placeholder="Imagen principal URL o /products/archivo.jpg" />
      <Textarea name="galleryUrls" placeholder="Galeria: una URL por linea o separadas por coma" />
      <Input name="warranty" placeholder="Garantia" />
      <Input name="availability" placeholder="stock real, por confirmar, bajo gestion" />
      <Select name="promisedSla" defaultValue="h48">
        <option value="h24">24h</option>
        <option value="h48">48h</option>
        <option value="h72">72h</option>
        <option value="bajo_gestion">bajo gestion</option>
      </Select>
      <Select name="status" defaultValue="activo">
        <option value="activo">activo</option>
        <option value="borrador">borrador</option>
        <option value="pausado">pausado</option>
        <option value="agotado">agotado</option>
      </Select>
      <Textarea name="internalNotes" placeholder="Notas internas" />
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input name="isActive" type="checkbox" defaultChecked className="h-5 w-5 accent-msm-blue" />
        Publicar si tiene vendedor, ubicacion y tienda activa
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input name="featured" type="checkbox" className="h-5 w-5 accent-msm-blue" />
        Destacado
      </label>
      <ActionMessage state={state} />
      <Button type="submit" disabled={pending}>{pending ? "Creando..." : "Crear producto"}</Button>
    </form>
  );
}

export function ApproveSellerForm() {
  const [state, formAction, pending] = useActionState(approveSeller, emptyActionResult);

  return (
    <form action={formAction} className="mt-4 grid gap-3 rounded-lg border border-msm-line p-4">
      <h3 className="font-bold">Aprobar vendedor por ID</h3>
      <Input name="sellerId" placeholder="ID vendedor" required />
      <ActionMessage state={state} />
      <Button type="submit" disabled={pending} className="bg-msm-blue">
        <UserCheck size={17} />
        {pending ? "Aprobando..." : "Aprobar vendedor"}
      </Button>
    </form>
  );
}

export function ReviewCustomerKycForm() {
  const [state, formAction, pending] = useActionState(reviewCustomerKyc, emptyActionResult);

  return (
    <form action={formAction} className="mt-4 grid gap-3 rounded-lg border border-msm-line p-4">
      <h3 className="font-bold">Revisar KYC cliente</h3>
      <Input name="profileId" placeholder="ID cliente / perfil" required />
      <div className="grid gap-3 md:grid-cols-2">
        <Select name="status" defaultValue="requiere_revision">
          <option value="pendiente">pendiente</option>
          <option value="requiere_revision">requiere_revision</option>
          <option value="aprobado">aprobado</option>
          <option value="rechazado">rechazado</option>
        </Select>
        <Select name="riskLevel" defaultValue="normal">
          <option value="normal">normal</option>
          <option value="revision">revision</option>
          <option value="alto">alto</option>
          <option value="bloqueado">bloqueado</option>
        </Select>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input name="paymentMethodValid" type="checkbox" className="h-5 w-5 accent-msm-blue" />
        Metodo de pago validado por MSM
      </label>
      <Textarea name="decisionNote" placeholder="Nota de decision: documento, titular, riesgo o motivo" />
      <ActionMessage state={state} />
      <Button type="submit" disabled={pending} className="bg-msm-blue">
        <UserCheck size={17} />
        {pending ? "Guardando..." : "Guardar KYC cliente"}
      </Button>
    </form>
  );
}

export function ReviewSellerApplicationForm() {
  const [state, formAction, pending] = useActionState(reviewSellerApplication, emptyActionResult);

  return (
    <form action={formAction} className="mt-4 grid gap-3 rounded-lg border border-msm-line p-4">
      <h3 className="font-bold">Revisar solicitud VIP</h3>
      <Input name="applicationId" placeholder="ID solicitud" required />
      <Select name="status" defaultValue="en_revision">
        <option value="en_revision">en_revision</option>
        <option value="aprobada">aprobada</option>
        <option value="mas_informacion">mas_informacion</option>
        <option value="rechazada">rechazada</option>
        <option value="suspendida">suspendida</option>
      </Select>
      <Textarea name="adminNote" placeholder="Nota interna o solicitud de informacion" />
      <ActionMessage state={state} />
      <Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar revision"}</Button>
    </form>
  );
}

export function SellerCommissionForm() {
  const [state, formAction, pending] = useActionState(updateSellerCommission, emptyActionResult);

  return (
    <form action={formAction} className="mt-4 grid gap-3 rounded-lg border border-msm-line p-4">
      <h3 className="font-bold">Cambiar comision VIP</h3>
      <Input name="sellerId" placeholder="ID vendedor" required />
      <Input name="commissionRate" type="number" min="0" max="100" step="0.01" placeholder="Comision MSM %" required />
      <ActionMessage state={state} />
      <Button type="submit" disabled={pending}>
        <Percent size={17} />
        {pending ? "Guardando..." : "Actualizar comision"}
      </Button>
    </form>
  );
}

export function ReassignOrderForm() {
  const [state, formAction, pending] = useActionState(reassignOrder, emptyActionResult);

  return (
    <form action={formAction} className="mt-4 grid gap-3 rounded-lg border border-msm-line p-4">
      <h3 className="font-bold">Reasignar orden por SLA</h3>
      <Input name="orderId" placeholder="ID orden" required />
      <Input name="sellerId" placeholder="ID nuevo vendedor VIP" required />
      <Textarea name="note" placeholder="Motivo o nota de reasignacion" />
      <ActionMessage state={state} />
      <Button type="submit" disabled={pending} className="bg-msm-blue">
        <Route size={17} />
        {pending ? "Reasignando..." : "Reasignar orden"}
      </Button>
    </form>
  );
}
