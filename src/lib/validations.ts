import { z } from "zod";

export const checkoutSchema = z.object({
  productId: z.string().uuid().optional().or(z.literal("")),
  quantity: z.coerce.number().int().positive().default(1),
  receiverFullName: z.string().min(3, "Indica el nombre completo del receptor."),
  receiverPhone: z.string().min(7, "Indica un telefono valido."),
  provinceId: z.string().uuid(),
  municipalityId: z.string().uuid(),
  receiverProvinceName: z.string().min(2).optional(),
  receiverMunicipalityName: z.string().min(2).optional(),
  address: z.string().min(10, "La direccion necesita mas detalle."),
  references: z.string().min(5, "Agrega referencias para facilitar la entrega."),
  deliveryWindow: z.string().min(3, "Selecciona o escribe un horario de entrega."),
  note: z.string().max(500).optional(),
  paymentMode: z.enum(["saldo_msm", "manual"]).default("saldo_msm"),
  paymentCountry: z.string().min(2, "Selecciona el pais de pago."),
  paymentCurrency: z.string().min(3, "Selecciona la moneda."),
  paymentMethodId: z.string().uuid("Selecciona un metodo de pago valido.").optional().or(z.literal("")),
  couponCode: z.string().max(50).optional(),
  legalAccepted: z.literal("on", {
    message: "Debes aceptar las politicas legales de MSM."
  })
});

export const loginSchema = z.object({
  email: z.string().email("Escribe un correo valido."),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres."),
  next: z.string().optional()
});

export const passwordResetSchema = z.object({
  email: z.string().email("Escribe un correo valido.")
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres."),
  confirmPassword: z.string().min(8, "Confirma la contrasena.")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contrasenas no coinciden.",
  path: ["confirmPassword"]
});

export const signupSchema = z.object({
  fullName: z.string().min(3, "Escribe tu nombre completo."),
  phone: z.string().min(7, "Escribe un telefono valido."),
  country: z.string().min(2, "Indica tu pais.").default("Estados Unidos"),
  email: z.string().email("Escribe un correo valido."),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres."),
  confirmPassword: z.string().min(8, "Confirma la contrasena."),
  termsAccepted: z.literal("on", {
    message: "Debes aceptar los terminos para crear cuenta."
  }),
  next: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contrasenas no coinciden.",
  path: ["confirmPassword"]
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(3, "Escribe tu nombre completo."),
  phone: z.string().min(7, "Escribe un telefono valido."),
  country: z.string().min(2, "Indica tu pais."),
  address: z.string().max(500).optional(),
  whatsapp: z.string().max(80).optional(),
  bio: z.string().max(300, "La bio debe tener 300 caracteres o menos.").optional(),
  preferredLanguage: z.enum(["es", "en"]).default("es"),
  timezone: z.string().min(2).max(80).default("America/New_York"),
  notificationEmailEnabled: z.string().optional(),
  notificationWhatsappEnabled: z.string().optional()
});

export const avatarUploadSchema = z.object({
  avatarUrl: z.string().url("URL de avatar invalida.").optional().or(z.literal(""))
});

export const securityUpdateSchema = resetPasswordSchema;

export const adminUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["cliente", "vendedor_vip", "administrador", "administrador_economico", "superadmin"]),
  note: z.string().max(700).optional()
});

export const adminUserStatusSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(["activo", "pausado", "bloqueado"]),
  note: z.string().max(700).optional()
});

export const adminUserKycSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(["pendiente", "aprobado", "rechazado", "requiere_revision"]),
  riskLevel: z.enum(["normal", "revision", "alto", "bloqueado"]).default("normal"),
  paymentMethodValid: z.string().optional(),
  note: z.string().max(700).optional()
});

export const sellerKycSchema = z.object({
  fullName: z.string().min(3),
  phone: z.string().min(7),
  document: z.string().min(4),
  location: z.string().min(3),
  operationZone: z.string().min(3),
  videoUrl: z.string().url().optional().or(z.literal("")),
  communityVerificationVip: z.string().optional()
});

export const productSchema = z.object({
  name: z.string().min(3),
  description: z.string().max(1000).optional(),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  categorySlug: z.string().min(2).optional(),
  price: z.coerce.number().positive(),
  currency: z.string().min(3).max(10).default("USD"),
  subcategory: z.string().max(80).optional(),
  country: z.string().min(2).max(120).default("Cuba"),
  province: z.string().max(120).optional(),
  municipality: z.string().max(120).optional(),
  deliveryZone: z.string().max(180).optional(),
  warranty: z.string().max(500).optional(),
  availability: z.string().max(160).optional(),
  stock: z.coerce.number().int().min(0),
  imageUrl: z.string().url().optional().or(z.literal("")),
  galleryUrls: z.string().max(2000).optional(),
  promisedSla: z.enum(["h24", "h48", "h72", "bajo_gestion"]).default("h48"),
  status: z.enum(["borrador", "activo", "pausado", "agotado"]).default("borrador"),
  deliveryNotes: z.string().max(700).optional(),
  featured: z.string().optional(),
  internalNotes: z.string().max(1000).optional(),
  isActive: z.string().optional()
});

export const adminVipStoreSchema = z.object({
  commercialName: z.string().min(3),
  ownerName: z.string().min(3),
  companyName: z.string().optional(),
  phone: z.string().min(7),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  country: z.string().min(2).default("Cuba"),
  province: z.string().min(2),
  municipality: z.string().min(2),
  deliveryZones: z.string().min(2),
  address: z.string().optional(),
  categories: z.string().min(2),
  servicesActive: z.string().optional(),
  description: z.string().min(10),
  warranty: z.string().max(500).optional(),
  type: z.enum(["vendedor_independiente", "tienda_oficial"]).default("vendedor_independiente"),
  level: z.enum(["vendedor_nuevo", "vendedor_verificado", "vendedor_destacado", "vendedor_vip", "super_vip", "tienda_oficial"]),
  status: z.enum(["activo", "pausado", "suspendido"]).default("activo"),
  dailyCapacity: z.coerce.number().int().positive(),
  commissionRate: z.coerce.number().min(0).max(100),
  remittancesActive: z.string().optional(),
  remittanceDeliveryMethods: z.string().optional(),
  cashAvailable: z.coerce.number().min(0).optional(),
  remittanceDailyLimit: z.coerce.number().min(0).optional(),
  remittanceEta: z.string().optional(),
  reputationLabel: z.string().optional(),
  isFeatured: z.string().optional()
});

export const adminStoreProductSchema = productSchema.extend({
  storeId: z.string().uuid()
});

export const stockUpdateSchema = z.object({
  productId: z.string().uuid(),
  stock: z.coerce.number().int().min(0)
});

export const orderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([
    "confirmada_vip",
    "preparando",
    "en_ruta",
    "entregada",
    "incidencia",
    "cancelada"
  ]),
  note: z.string().max(500).optional()
});

export const paymentMethodSchema = z.object({
  country: z.string().min(2),
  currency: z.string().min(3).max(10),
  type: z.string().min(2),
  status: z.enum(["activo", "pausado", "oculto"]),
  minAmount: z.coerce.number().min(0),
  maxAmount: z.coerce.number().positive(),
  feePercent: z.coerce.number().min(0).max(100),
  visibleInstructions: z.string().min(5),
  internalInstructions: z.string().optional(),
  priority: z.coerce.number().int().min(1),
  dailyCapacity: z.coerce.number().positive(),
  responsibleEconomicId: z.string().uuid().optional().or(z.literal(""))
});

export const paymentAccountSchema = z.object({
  methodId: z.string().uuid(),
  visibleName: z.string().min(2),
  internalAlias: z.string().min(2),
  dailyLimit: z.coerce.number().positive(),
  status: z.enum(["activa", "pausada", "bloqueada"]),
  expiresAt: z.string().optional(),
  internalNote: z.string().optional(),
  usageRules: z.string().optional()
});

export const paymentProofSchema = z.object({
  orderId: z.string().uuid(),
  paymentMethodId: z.string().uuid(),
  paymentAccountId: z.string().uuid().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  reference: z.string().min(3),
  amount: z.coerce.number().positive(),
  currency: z.string().min(3).max(10),
  country: z.string().min(2),
  senderName: z.string().min(3),
  paidAt: z.string().min(8)
});

export const paymentReviewSchema = z.object({
  proofId: z.string().uuid(),
  orderId: z.string().uuid(),
  decision: z.enum(["aprobado", "rechazado", "nueva_evidencia"]),
  note: z.string().max(1000).optional()
});

export const payoutSchema = z.object({
  sellerId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  method: z.string().min(2),
  reference: z.string().optional(),
  receiptUrl: z.string().url().optional().or(z.literal("")),
  periodStart: z.string().min(8),
  periodEnd: z.string().min(8)
});

export const walletLoadRequestSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor que cero."),
  currency: z.string().min(3).max(10).default("USD"),
  country: z.string().min(2, "Selecciona el pais desde donde pagas."),
  paymentMethodId: z.string().uuid("Selecciona un metodo valido.").optional().or(z.literal("")),
  paymentAccountId: z.string().uuid().optional().or(z.literal("")),
  senderName: z.string().min(3, "Indica quien envia el dinero."),
  reference: z.string().min(3, "Agrega una referencia del pago."),
  proofUrl: z.string().url("Pega una URL valida del comprobante.").optional().or(z.literal("")),
  note: z.string().max(700).optional()
});

export const walletLoadReviewSchema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["aprobado", "rechazado", "nueva_evidencia"]),
  note: z.string().max(1000).optional()
});

export const sellerApprovalSchema = z.object({
  sellerId: z.string().uuid()
});

export const sellerCommissionSchema = z.object({
  sellerId: z.string().uuid(),
  commissionRate: z.coerce.number().min(0).max(100)
});

export const orderReassignmentSchema = z.object({
  orderId: z.string().uuid(),
  sellerId: z.string().uuid(),
  note: z.string().max(500).optional()
});

export const sellerApplicationReviewSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(["en_revision", "aprobada", "rechazada", "mas_informacion", "suspendida"]),
  adminNote: z.string().max(1000).optional()
});

export const deliveryEvidenceSchema = z.object({
  orderId: z.string().uuid(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  signatureUrl: z.string().url().optional().or(z.literal("")),
  receiverName: z.string().max(120).optional(),
  receiverDocumentLast4: z.string().max(12).optional(),
  message: z.string().max(700).optional(),
  otpCode: z.string().max(32).optional()
});

export const sellerApplicationSchema = z.object({
  fullName: z.string().min(3),
  phone: z.string().min(7),
  country: z.string().min(2).default("Cuba"),
  province: z.string().min(2),
  municipality: z.string().min(2),
  originCommunity: z.string().min(2),
  contactHandle: z.string().min(3),
  categories: z.string().min(2),
  videoUrl: z.string().url().optional().or(z.literal("")),
  productPhotoUrls: z.string().optional(),
  deliveryZone: z.string().min(3),
  weeklyHours: z.string().min(3),
  dailyCapacity: z.coerce.number().int().positive(),
  offeredWarranty: z.string().min(3),
  agreementAccepted: z.literal("on", {
    message: "Debes aceptar el acuerdo vendedor VIP."
  })
});

export const supportTicketSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.enum([
    "demora",
    "producto_incorrecto",
    "producto_danado",
    "falta_de_entrega",
    "garantia",
    "otro"
  ]),
  subject: z.string().min(5),
  body: z.string().min(10),
  evidenceUrl: z.string().url().optional().or(z.literal(""))
});

export const customerKycSchema = z.object({
  fullName: z.string().min(3, "Escribe tu nombre completo."),
  phone: z.string().min(7, "Escribe un telefono valido."),
  country: z.string().min(2, "Indica el pais donde resides."),
  address: z.string().min(10, "Agrega una direccion con mas detalle."),
  identityDocumentType: z.string().min(2, "Indica el tipo de documento."),
  identityDocumentLast4: z
    .string()
    .regex(/^[A-Za-z0-9]{3,8}$/, "Indica los ultimos 3 a 8 caracteres del documento."),
  paymentAppName: z.string().max(80).optional(),
  paymentAccountOwner: z.string().min(3, "Indica el nombre del titular del pago."),
  kycProviderReference: z.string().max(180).optional(),
  chargebackPolicyAccepted: z.literal("on", {
    message: "Debes aceptar la politica contra reclamos falsos o contracargos indebidos."
  }),
  paymentMethodValid: z.string().optional(),
  identityNote: z.string().max(700).optional()
});

export const customerKycReviewSchema = z.object({
  profileId: z.string().uuid("ID de cliente invalido."),
  status: z.enum(["pendiente", "aprobado", "rechazado", "requiere_revision"]),
  riskLevel: z.enum(["normal", "revision", "alto", "bloqueado"]).default("normal"),
  paymentMethodValid: z.string().optional(),
  decisionNote: z.string().max(700).optional()
});

export const sellerKycReviewSchema = z.object({
  sellerId: z.string().uuid(),
  status: z.enum(["pendiente", "aprobado", "rechazado"]),
  adminNote: z.string().max(700).optional()
});

export const sellerReviewSchema = z.object({
  sellerId: z.string().uuid(),
  orderId: z.string().uuid().optional().or(z.literal("")),
  compliance: z.coerce.number().int().min(1).max(5),
  quality: z.coerce.number().int().min(1).max(5),
  attention: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(700).optional()
});

export const remittanceSchema = z.object({
  senderFullName: z.string().min(3, "Escribe el nombre completo de quien envia."),
  senderPhone: z.string().min(7, "Escribe un telefono valido de quien envia."),
  senderCountry: z.string().min(2, "Selecciona pais de origen."),
  senderCurrency: z.string().min(3).max(10),
  sendAmount: z.coerce.number().positive("El monto a enviar debe ser mayor que cero."),
  recipientFullName: z.string().min(3, "Escribe el nombre completo del receptor."),
  recipientPhone: z.string().min(7, "Escribe un telefono valido del receptor."),
  recipientProvince: z.string().min(2, "Indica provincia del receptor."),
  recipientMunicipality: z.string().min(2, "Indica municipio del receptor."),
  recipientAddress: z.string().min(8, "Agrega direccion o referencia del receptor."),
  payoutCurrency: z.string().min(3).max(10),
  payoutMethod: z.enum(["usd_efectivo", "cup_efectivo", "cup_transferencia", "mlc_clasica", "mlc_tropical"]),
  paymentMethodId: z.string().uuid("Selecciona metodo de pago MSM."),
  note: z.string().max(700).optional(),
  legalAccepted: z.literal("on", {
    message: "Debes aceptar los terminos de remesas MSM."
  })
});

export const remittanceStatusSchema = z.object({
  remittanceId: z.string().uuid(),
  status: z.enum([
    "pendiente_pago",
    "pago_recibido",
    "en_revision",
    "lista_para_entrega",
    "entregada",
    "cerrada",
    "incidencia",
    "cancelada"
  ]),
  note: z.string().max(700).optional()
});

export const remittancePaymentProofSchema = z.object({
  remittanceId: z.string().uuid(),
  paymentMethodId: z.string().uuid(),
  paymentAccountId: z.string().uuid().optional().or(z.literal("")),
  imageUrl: z.string().url("Pega una URL valida del comprobante.").optional().or(z.literal("")),
  reference: z.string().min(3, "Agrega referencia del pago."),
  amount: z.coerce.number().positive("El monto debe ser mayor que cero."),
  currency: z.string().min(3).max(10),
  country: z.string().min(2),
  senderName: z.string().min(3, "Indica quien envio el dinero."),
  paidAt: z.string().min(8)
});

export const remittancePaymentReviewSchema = z.object({
  proofId: z.string().uuid(),
  remittanceId: z.string().uuid(),
  decision: z.enum(["aprobado", "rechazado", "nueva_evidencia"]),
  note: z.string().max(1000).optional()
});

export const couponSchema = z.object({
  code: z.string().min(3).max(30).transform(s => s.toUpperCase()),
  description: z.string().max(300).optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().min(0).default(0),
  maxUses: z.coerce.number().int().min(0).default(0),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional()
});

export const taxRateSchema = z.object({
  country: z.string().min(2),
  province: z.string().optional().or(z.literal("")),
  ratePercent: z.coerce.number().min(0).max(100),
  taxName: z.string().min(2).default("VAT")
});

export const shippingRateSchema = z.object({
  country: z.string().min(2),
  province: z.string().optional().or(z.literal("")),
  municipality: z.string().optional().or(z.literal("")),
  minOrderAmount: z.coerce.number().min(0).default(0),
  cost: z.coerce.number().min(0),
  estimatedDays: z.string().default("3-5")
});

export const productReviewSchema = z.object({
  productId: z.string().uuid(),
  orderId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().max(1000).optional(),
  images: z.string().optional()
});

export const returnRequestSchema = z.object({
  orderId: z.string().uuid(),
  orderItemId: z.string().uuid().optional().or(z.literal("")),
  reason: z.string().min(5),
  description: z.string().max(1000).optional(),
  evidenceUrls: z.string().optional()
});

export const returnReviewSchema = z.object({
  returnId: z.string().uuid(),
  status: z.enum(["pendiente", "aprobado", "rechazado", "en_transito", "recibido", "reembolsado"]),
  resolutionType: z.enum(["refund", "replacement", "store_credit"]).optional(),
  resolutionAmount: z.coerce.number().min(0).optional(),
  adminNote: z.string().max(700).optional()
});

export const inventoryAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  quantityChange: z.coerce.number().int(),
  reason: z.enum(["adjustment", "restock", "cancellation"]),
  note: z.string().max(500).optional()
});
