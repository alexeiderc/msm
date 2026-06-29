import { PrismaClient } from "@prisma/client";
import { cubaLocations } from "../src/lib/cuba-locations";
import { seedRemittanceMethods } from "../src/lib/remittance-methods";

const prisma = new PrismaClient();

const categories = [
  ["Electrodomesticos", "electrodomesticos", 10],
  ["Ferreteria", "ferreteria", 8],
  ["Energia solar", "energia-solar", 12],
  ["Alimentos", "alimentos", 6],
  ["Servicios", "servicios", 15],
  ["Remesas", "remesas", 6],
  ["Cambios", "cambios", 6],
  ["Productos generales", "productos-generales", 10]
] as const;

const provinces = cubaLocations.map(({ province, municipalities }) => [province, municipalities] as const);

const officialProfileId = "00000000-0000-4000-8000-000000000101";
const officialSellerId = "00000000-0000-4000-8000-000000000201";
const officialStoreId = "00000000-0000-4000-8000-000000000301";

const officialProducts = [
  {
    imageId: "00000000-0000-4000-9000-000000000001",
    slug: "freidora-de-aire-eko",
    name: "Freidora de aire EKO",
    category: "electrodomesticos",
    image: "/products/msm-freidora-aire.jpg",
    price: 70,
    stock: 6,
    description: "Freidora de aire EKO para entrega local MSM MY STORE en Segundo Frente.",
    subcategory: "Cocina",
    sla: "h48"
  },
  {
    imageId: "00000000-0000-4000-9000-000000000002",
    slug: "batidora-fagor",
    name: "Batidora Fagor",
    category: "electrodomesticos",
    image: "/products/msm-batidora.jpg",
    price: 45,
    stock: 8,
    description: "Batidora de vaso para cocina domestica, publicada por MSM MY STORE.",
    subcategory: "Cocina",
    sla: "h48"
  },
  {
    imageId: "00000000-0000-4000-9000-000000000003",
    slug: "lavadora-semidoble-eko",
    name: "Lavadora semidoble EKO",
    category: "electrodomesticos",
    image: "/products/msm-lavadora.jpg",
    price: 198,
    stock: 3,
    description: "Lavadora semidoble con entrega coordinada en Santiago de Cuba y Segundo Frente.",
    subcategory: "Lavado",
    sla: "h72"
  },
  {
    imageId: "00000000-0000-4000-9000-000000000004",
    slug: "cocina-infrarroja-eko2202",
    name: "Cocina infrarroja EKO2202",
    category: "electrodomesticos",
    image: "/products/msm-cocina-infrarroja.jpg",
    price: 45,
    stock: 10,
    description: "Cocina infrarroja tactil EKO2202, producto demo de tienda oficial.",
    subcategory: "Cocina",
    sla: "h48"
  },
  {
    imageId: "00000000-0000-4000-9000-000000000005",
    slug: "nevera-35-pies-gris-perlado",
    name: "Nevera 3.5 pies gris perlado",
    category: "electrodomesticos",
    image: "/products/msm-nevera-35.jpg",
    price: 255,
    stock: 2,
    description: "Nevera compacta 3.5 pies para entrega por zona.",
    subcategory: "Refrigeracion",
    sla: "bajo_gestion"
  },
  {
    imageId: "00000000-0000-4000-9000-000000000006",
    slug: "freezer-7-pies-eko",
    name: "Freezer 7 pies EKO",
    category: "electrodomesticos",
    image: "/products/msm-freezer-7.jpg",
    price: 320,
    stock: 4,
    description: "Freezer 7 pies publicado por MSM MY STORE, disponibilidad por confirmar.",
    subcategory: "Refrigeracion",
    sla: "bajo_gestion"
  },
  {
    imageId: "00000000-0000-4000-9000-000000000007",
    slug: "olla-reina-eko",
    name: "Olla reina EKO",
    category: "electrodomesticos",
    image: "/products/msm-olla-reina.jpg",
    price: 36,
    stock: 12,
    description: "Olla reina EKO para entrega local en Segundo Frente.",
    subcategory: "Cocina",
    sla: "h48"
  },
  {
    imageId: "00000000-0000-4000-9000-000000000008",
    slug: "combo-alimentos-msm",
    name: "Combo alimentos MSM",
    category: "alimentos",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e",
    price: 58,
    stock: 20,
    description: "Combo de alimentos demo para entrega local.",
    subcategory: "Combos",
    sla: "h48"
  },
  {
    imageId: "00000000-0000-4000-9000-000000000009",
    slug: "kit-solar-basico-msm",
    name: "Kit solar basico MSM",
    category: "energia-solar",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276",
    price: 420,
    stock: 2,
    description: "Kit solar bajo gestion con coordinacion MSM.",
    subcategory: "Energia",
    sla: "bajo_gestion"
  },
  {
    imageId: "00000000-0000-4000-9000-000000000010",
    slug: "televisor-smart-msm",
    name: "Televisor smart MSM",
    category: "electrodomesticos",
    image: "/brand/msm-my-store-logo.jpeg",
    price: 280,
    stock: 2,
    description: "Televisor smart demo publicado por MSM MY STORE para Segundo Frente.",
    subcategory: "Entretenimiento",
    sla: "bajo_gestion"
  },
  {
    imageId: "00000000-0000-4000-9000-000000000011",
    slug: "ventilador-recargable",
    name: "Ventilador recargable",
    category: "electrodomesticos",
    image: "/brand/msm-my-store-logo.jpeg",
    price: 55,
    stock: 5,
    description: "Ventilador recargable demo para zonas con necesidad energetica.",
    subcategory: "Energia domestica",
    sla: "h48"
  },
  {
    imageId: "00000000-0000-4000-9000-000000000012",
    slug: "leche-en-polvo",
    name: "Leche en polvo",
    category: "alimentos",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e",
    price: 18,
    stock: 20,
    description: "Leche en polvo demo con entrega local MSM.",
    subcategory: "Alimentos",
    sla: "h48"
  },
  {
    imageId: "00000000-0000-4000-9000-000000000013",
    slug: "cambio-divisas-segundo-frente",
    name: "Servicio de cambio de divisas Segundo Frente",
    category: "cambios",
    image: "/brand/msm-my-store-logo.jpeg",
    price: 1,
    stock: 999,
    description: "Servicio demo de cambio de divisas con revision economica MSM.",
    subcategory: "Cambios",
    sla: "h24"
  },
  {
    imageId: "00000000-0000-4000-9000-000000000014",
    slug: "remesa-efectivo-segundo-frente",
    name: "Servicio de remesa efectivo Segundo Frente",
    category: "remesas",
    image: "/brand/msm-my-store-logo.jpeg",
    price: 1,
    stock: 999,
    description: "Servicio demo para remesas con entrega local por zona y revision economica MSM.",
    subcategory: "Efectivo",
    sla: "h24"
  }
] as const;

async function main() {
  for (const [name, slug, baseCommission] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name, baseCommission },
      create: { name, slug, baseCommission }
    });
  }

  for (const [provinceName, municipalities] of provinces) {
    const province = await prisma.province.upsert({
      where: { name: provinceName },
      update: {},
      create: { name: provinceName }
    });

    for (const name of municipalities) {
      await prisma.municipality.upsert({
        where: { provinceId_name: { provinceId: province.id, name } },
        update: {},
        create: { provinceId: province.id, name }
      });
    }
  }

  const officialProfile = await prisma.profile.upsert({
    where: { id: officialProfileId },
    update: {
      email: "official-demo@msmmystore.local",
      fullName: "Miguel Soria Martinez",
      phone: "+1 772 301 5523",
      role: "vendedor_vip",
      address: "MSM MY STORE LLC - Segundo Frente, Santiago de Cuba"
    },
    create: {
      id: officialProfileId,
      email: "official-demo@msmmystore.local",
      fullName: "Miguel Soria Martinez",
      phone: "+1 772 301 5523",
      role: "vendedor_vip",
      address: "MSM MY STORE LLC - Segundo Frente, Santiago de Cuba"
    }
  });

  const officialSeller = await prisma.seller.upsert({
    where: { id: officialSellerId },
    update: {
      profileId: officialProfile.id,
      level: "super_vip",
      status: "aprobado",
      commissionRate: 6,
      dailyCapacity: 30,
      maxConfirmMinutes: 45,
      operationZone: "Mayari Arriba y Segundo Frente"
    },
    create: {
      id: officialSellerId,
      profileId: officialProfile.id,
      level: "super_vip",
      status: "aprobado",
      commissionRate: 6,
      dailyCapacity: 30,
      maxConfirmMinutes: 45,
      operationZone: "Mayari Arriba y Segundo Frente"
    }
  });

  const officialStore = await prisma.store.upsert({
    where: { id: officialStoreId },
    update: {
      sellerId: officialSeller.id,
      name: "MSM MY STORE",
      slug: "msm-my-store-oficial-segundo-frente",
      type: "tienda_oficial",
      status: "activo",
      ownerName: "Miguel Soria Martinez",
      companyName: "MSM MY STORE LLC",
      phone: "+1 772 301 5523",
      whatsapp: "+1 772 301 5523",
      email: "commercial@msmmystore.com",
      province: "Santiago de Cuba",
      municipality: "Segundo Frente",
      address: "Mayari Arriba y Segundo Frente",
      description: "MSM MY STORE conecta la diaspora con Cuba mediante productos, servicios, remesas, pagos organizados, entregas locales, vendedores VIP y confianza centralizada.",
      warranty: "Garantia coordinada por MSM segun producto y evidencia de entrega.",
      categories: ["remesas", "cambios", "alimentos", "electrodomesticos", "energia-solar", "servicios", "productos-generales"],
      servicesActive: ["remesas", "cambios", "productos", "servicios"],
      pickupAvailable: true,
      deliveryAvailable: true,
      transferAvailable: true,
      remittancesActive: true,
      remittanceDeliveryMethods: ["efectivo", "transferencia", "pickup", "domicilio"],
      remittanceMunicipalities: ["Segundo Frente", "Mayari Arriba"],
      cashAvailable: 5000,
      remittanceDailyLimit: 15000,
      remittanceEta: "24h a 48h segun zona y disponibilidad",
      remittanceEvidenceMode: "Foto, firma, mensaje o codigo OTP",
      reputationLabel: "Tienda oficial destacada",
      isFeatured: true,
      isActive: true,
      deliveryZones: ["Santiago de Cuba", "Segundo Frente", "Mayari Arriba"],
      weeklyHours: {
        monday: "9:00-18:00",
        tuesday: "9:00-18:00",
        wednesday: "9:00-18:00",
        thursday: "9:00-18:00",
        friday: "9:00-18:00",
        saturday: "9:00-14:00"
      }
    },
    create: {
      id: officialStoreId,
      sellerId: officialSeller.id,
      name: "MSM MY STORE",
      slug: "msm-my-store-oficial-segundo-frente",
      type: "tienda_oficial",
      status: "activo",
      ownerName: "Miguel Soria Martinez",
      companyName: "MSM MY STORE LLC",
      phone: "+1 772 301 5523",
      whatsapp: "+1 772 301 5523",
      email: "commercial@msmmystore.com",
      province: "Santiago de Cuba",
      municipality: "Segundo Frente",
      address: "Mayari Arriba y Segundo Frente",
      description: "MSM MY STORE conecta la diaspora con Cuba mediante productos, servicios, remesas, pagos organizados, entregas locales, vendedores VIP y confianza centralizada.",
      warranty: "Garantia coordinada por MSM segun producto y evidencia de entrega.",
      categories: ["remesas", "cambios", "alimentos", "electrodomesticos", "energia-solar", "servicios", "productos-generales"],
      servicesActive: ["remesas", "cambios", "productos", "servicios"],
      pickupAvailable: true,
      deliveryAvailable: true,
      transferAvailable: true,
      remittancesActive: true,
      remittanceDeliveryMethods: ["efectivo", "transferencia", "pickup", "domicilio"],
      remittanceMunicipalities: ["Segundo Frente", "Mayari Arriba"],
      cashAvailable: 5000,
      remittanceDailyLimit: 15000,
      remittanceEta: "24h a 48h segun zona y disponibilidad",
      remittanceEvidenceMode: "Foto, firma, mensaje o codigo OTP",
      reputationLabel: "Tienda oficial destacada",
      isFeatured: true,
      isActive: true,
      deliveryZones: ["Santiago de Cuba", "Segundo Frente", "Mayari Arriba"],
      weeklyHours: {
        monday: "9:00-18:00",
        tuesday: "9:00-18:00",
        wednesday: "9:00-18:00",
        thursday: "9:00-18:00",
        friday: "9:00-18:00",
        saturday: "9:00-14:00"
      }
    }
  });

  for (const product of officialProducts) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: product.category } });
    const saved = await prisma.product.upsert({
      where: { storeId_slug: { storeId: officialStore.id, slug: product.slug } },
      update: {
        name: product.name,
        categoryId: category.id,
        description: product.description,
        price: product.price,
        currency: "USD",
        subcategory: product.subcategory,
        province: "Santiago de Cuba",
        municipality: "Segundo Frente",
        deliveryZone: "Mayari Arriba y Segundo Frente",
        warranty: "Garantia MSM segun disponibilidad y evidencia.",
        availability: product.stock > 0 ? "stock real o por confirmar" : "por confirmar",
        status: "activo",
        featured: true,
        stock: product.stock,
        promisedSla: product.sla,
        isActive: true,
        internalNotes: "Producto demo tienda oficial MSM MY STORE."
      },
      create: {
        storeId: officialStore.id,
        categoryId: category.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        currency: "USD",
        subcategory: product.subcategory,
        province: "Santiago de Cuba",
        municipality: "Segundo Frente",
        deliveryZone: "Mayari Arriba y Segundo Frente",
        warranty: "Garantia MSM segun disponibilidad y evidencia.",
        availability: product.stock > 0 ? "stock real o por confirmar" : "por confirmar",
        status: "activo",
        featured: true,
        stock: product.stock,
        promisedSla: product.sla,
        isActive: true,
        internalNotes: "Producto demo tienda oficial MSM MY STORE."
      }
    });

    await prisma.productImage.upsert({
      where: { id: product.imageId },
      update: {
        productId: saved.id,
        url: product.image,
        alt: product.name,
        position: 0
      },
      create: {
        id: product.imageId,
        productId: saved.id,
        url: product.image,
        alt: product.name,
        position: 0
      }
    });
  }

  const food = await prisma.category.findUniqueOrThrow({ where: { slug: "alimentos" } });
  const demoProfile = await prisma.profile.findFirst({
    where: { role: "vendedor_vip" },
    orderBy: { createdAt: "asc" }
  });

  if (demoProfile) {
    const seller = await prisma.seller.upsert({
      where: { profileId: demoProfile.id },
      update: {
        level: "vendedor_vip",
        status: "aprobado",
        commissionRate: 6,
        dailyCapacity: 12,
        operationZone: "Santiago de Cuba"
      },
      create: {
        profileId: demoProfile.id,
        level: "vendedor_vip",
        status: "aprobado",
        commissionRate: 6,
        dailyCapacity: 12,
        operationZone: "Santiago de Cuba"
      }
    });

    const store = await prisma.store.upsert({
      where: { slug: "bodega-vip-santiago" },
      update: {
        sellerId: seller.id,
        isActive: true
      },
      create: {
        sellerId: seller.id,
        name: "Bodega VIP Santiago",
        slug: "bodega-vip-santiago",
        description: "Entrega local verificada en Santiago de Cuba.",
        isActive: true,
        deliveryZones: ["Santiago de Cuba", "Palma Soriano"],
        weeklyHours: {
          monday: "9:00-17:00",
          tuesday: "9:00-17:00",
          friday: "9:00-14:00"
        }
      }
    });

    await prisma.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: "combo-familiar-basico" } },
      update: {
        stock: 20,
        isActive: true
      },
      create: {
        storeId: store.id,
        categoryId: food.id,
        name: "Combo familiar basico",
        slug: "combo-familiar-basico",
        description: "Modulo de alimentos de alta rotacion para entrega local.",
        price: 58,
        stock: 20,
        isActive: true,
        images: {
          create: {
            url: "https://images.unsplash.com/photo-1542838132-92c53300491e",
            alt: "Combo de alimentos",
            position: 0
          }
        }
      }
    });
  } else {
    console.warn("Seed: no hay perfil vendedor_vip; se omite tienda/producto demo hasta crear un usuario VIP en Supabase Auth.");
  }

  const zelle = await prisma.paymentMethod.upsert({
    where: { id: "00000000-0000-4000-8000-000000000501" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000501",
      country: "Estados Unidos",
      currency: "USD",
      type: "Zelle",
      status: "activo",
      minAmount: 20,
      maxAmount: 1500,
      feePercent: 0,
      visibleInstructions: "Crea la orden para recibir la cuenta asignada. No uses cuentas anteriores.",
      internalInstructions: "Rotar cuenta con menor recibido hoy.",
      priority: 1,
      dailyCapacity: 5000
    }
  });

  await prisma.paymentAccount.upsert({
    where: { id: "00000000-0000-4000-8000-000000000601" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000601",
      methodId: zelle.id,
      visibleName: "Cuenta Zelle asignada A",
      internalAlias: "zelle-us-a",
      dailyLimit: 2500,
      receivedToday: 0,
      status: "activa",
      internalNote: "Cuenta demo. No usar datos reales.",
      usageRules: { rotation: "least_received_today", showOnlyInsideOrder: true }
    }
  });

  await prisma.paymentMethod.upsert({
    where: { id: "00000000-0000-4000-8000-000000000502" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000502",
      country: "Global",
      currency: "USDT",
      type: "USDT",
      status: "activo",
      minAmount: 25,
      maxAmount: 3000,
      feePercent: 1,
      visibleInstructions: "Crea la orden para recibir red y wallet asignada.",
      priority: 2,
      dailyCapacity: 8000
    }
  });

  await prisma.paymentMethod.upsert({
    where: { id: "00000000-0000-4000-8000-000000000503" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000503",
      country: "Mexico",
      currency: "MXN",
      type: "Oxxo",
      status: "pausado",
      minAmount: 200,
      maxAmount: 20000,
      feePercent: 2,
      visibleInstructions: "Metodo temporalmente pausado.",
      priority: 50,
      dailyCapacity: 0
    }
  });

  for (const method of seedRemittanceMethods) {
    await prisma.paymentMethod.upsert({
      where: { id: method.id },
      update: {
        country: method.country,
        currency: method.currency,
        type: method.type,
        status: "activo",
        visibleInstructions: "Crea la remesa para recibir la cuenta asignada. No uses cuentas anteriores.",
        priority: method.priority
      },
      create: {
        id: method.id,
        country: method.country,
        currency: method.currency,
        type: method.type,
        status: "activo",
        minAmount: 1,
        maxAmount: 100000,
        feePercent: 0,
        visibleInstructions: "Crea la remesa para recibir la cuenta asignada. No uses cuentas anteriores.",
        internalInstructions: "Metodo sembrado desde lista COMPRO de remesas. No publicar tarifas.",
        priority: method.priority,
        dailyCapacity: 100000
      }
    });
  }

  const templates = [
    ["orden_creada", "email", "Orden creada {{orderNumber}}", "Tu orden fue creada.", ["orderNumber"]],
    ["pago_pendiente", "email", "Pago pendiente {{orderNumber}}", "Sube el comprobante de pago.", ["orderNumber"]],
    ["comprobante_recibido", "email", "Comprobante recibido", "Economia revisara el comprobante.", ["orderNumber"]],
    ["pago_aprobado", "email", "Pago aprobado", "La entrega VIP queda activada.", ["orderNumber"]],
    ["orden_asignada_vip", "email", "Orden asignada", "Tu orden fue asignada a un VIP.", ["orderNumber"]],
    ["vip_confirmo", "email", "VIP confirmo", "El VIP confirmo disponibilidad.", ["orderNumber"]],
    ["preparando", "email", "Preparando", "La orden esta en preparacion.", ["orderNumber"]],
    ["en_ruta", "email", "En ruta", "La orden esta en ruta.", ["orderNumber"]],
    ["entregada", "email", "Entregada", "La orden fue entregada.", ["orderNumber"]],
    ["incidencia_abierta", "email", "Incidencia abierta", "Se abrio una incidencia.", ["orderNumber"]],
    ["reclamacion_recibida", "email", "Reclamacion recibida", "Recibimos tu reclamacion.", ["ticketId"]],
    ["payout_enviado", "email", "Payout enviado", "Se registro un payout.", ["payoutId"]],
    ["metodo_pago_pausado", "email", "Metodo pausado", "Un metodo de pago fue pausado.", ["methodName"]]
  ] as const;

  for (const [key, channel, subject, body, variables] of templates) {
    await prisma.notificationTemplate.upsert({
      where: { key_channel: { key, channel } },
      update: { subject, body, variables: [...variables] },
      create: { key, channel, subject, body, variables: [...variables] }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
