export const roles = [
  "cliente",
  "vendedor_vip",
  "administrador",
  "administrador_economico",
  "superadmin"
] as const;

export type UserRole = (typeof roles)[number];

export const orderStates = [
  "pendiente_pago",
  "pago_confirmado",
  "asignada_vip",
  "confirmada_vip",
  "preparando",
  "en_ruta",
  "entregada",
  "cerrada",
  "incidencia",
  "cancelada"
] as const;

export type OrderState = (typeof orderStates)[number];

export const sellerLevels = [
  "vendedor_nuevo",
  "vendedor_verificado",
  "vendedor_destacado",
  "vendedor_vip"
] as const;

export type SellerLevel = (typeof sellerLevels)[number];

export const paymentMethodStatuses = ["activo", "pausado", "oculto"] as const;
export type PaymentMethodStatus = (typeof paymentMethodStatuses)[number];

export const paymentAccountStatuses = ["activa", "pausada", "bloqueada"] as const;
export type PaymentAccountStatus = (typeof paymentAccountStatuses)[number];

export const paymentProofStatuses = ["recibido", "aprobado", "rechazado", "nueva_evidencia"] as const;
export type PaymentProofStatus = (typeof paymentProofStatuses)[number];

export const supportReasons = [
  "demora",
  "producto_incorrecto",
  "producto_danado",
  "falta_de_entrega",
  "garantia",
  "otro"
] as const;
export type SupportReason = (typeof supportReasons)[number];
