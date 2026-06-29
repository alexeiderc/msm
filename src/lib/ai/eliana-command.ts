import { officialStoreSlug } from "@/lib/demo-msm-store";

export type ElianaCommandIntent = {
  id: string;
  label: string;
  description: string;
  href: string;
  keywords: string[];
};

export const elianaCommandIntents: ElianaCommandIntent[] = [
  {
    id: "buy",
    label: "Comprar producto",
    description: "Busca productos por zona, categoria o tienda VIP.",
    href: "/products",
    keywords: ["comprar", "producto", "catalogo", "televisor", "nevera", "freidora", "lavadora", "alimento"]
  },
  {
    id: "remittance",
    label: "Enviar remesa",
    description: "Crea una remesa con metodo de pago, receptor y zona.",
    href: "/remittances",
    keywords: ["remesa", "enviar dinero", "efectivo", "transferencia"]
  },
  {
    id: "proof",
    label: "Subir comprobante",
    description: "Entra al seguimiento de ordenes para adjuntar evidencia de pago.",
    href: "/orders",
    keywords: ["comprobante", "capture", "captura", "pago", "referencia", "zelle", "paypal"]
  },
  {
    id: "official-store",
    label: "Tienda oficial MSM",
    description: "Abre el perfil oficial MSM my store en Segundo Frente.",
    href: `/vendedores/${officialStoreSlug}`,
    keywords: ["msm", "segundo frente", "mayari", "tienda oficial", "miguel", "don miguel"]
  },
  {
    id: "vip",
    label: "Tiendas VIP",
    description: "Mira vendedores, zonas, reputacion y productos activos.",
    href: "/tiendas-vip",
    keywords: ["vip", "vendedor", "tienda", "perfil", "proveedor", "socio"]
  },
  {
    id: "account",
    label: "Crear cuenta",
    description: "Crea cuenta y luego completa KYC para comprar con seguridad.",
    href: "/auth/signup",
    keywords: ["cuenta", "registrar", "registro", "signup", "kyc", "validar"]
  },
  {
    id: "wallet",
    label: "Billetera MSM",
    description: "Abre la billetera digital preparada para saldos, reservas y ledger.",
    href: "/wallet",
    keywords: ["billetera", "wallet", "saldo", "credito", "recargar"]
  },
  {
    id: "atm",
    label: "Cajeros MSM Digital",
    description: "Abre reservas de efectivo, QR temporal y Cajeros MSM Digital.",
    href: "/atm",
    keywords: ["cajero", "atm", "qr", "retirar", "reserva", "reservar efectivo"]
  },
  {
    id: "exchange",
    label: "Cambio seguro",
    description: "Abre el modulo de cambio con revision economica MSM.",
    href: "/exchange",
    keywords: ["cambio", "cambiar", "divisa", "cotizacion", "tasa"]
  },
  {
    id: "support",
    label: "Soporte",
    description: "Abre una reclamacion o pide ayuda humana.",
    href: "/support",
    keywords: ["soporte", "ayuda", "reclamo", "reclamacion", "incidencia", "problema"]
  }
];

function normalizeCommand(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const productWords = [
  "nevera",
  "freezer",
  "freidora",
  "batidora",
  "lavadora",
  "olla",
  "cocina",
  "televisor",
  "tv",
  "combo",
  "alimento",
  "solar",
  "herramienta",
  "iphone",
  "servicio"
];

function getLocationParams(command: string) {
  if (command.includes("segundo frente") || command.includes("mayari")) {
    return {
      country: "Cuba",
      province: "Santiago de Cuba",
      municipality: "Segundo Frente"
    };
  }

  if (command.includes("santiago")) {
    return {
      country: "Cuba",
      province: "Santiago de Cuba"
    };
  }

  if (command.includes("miami") || command.includes("florida")) {
    return {
      country: "Estados Unidos",
      province: "Florida",
      municipality: command.includes("miami") ? "Miami" : undefined
    };
  }

  if (command.includes("houston") || command.includes("texas")) {
    return {
      country: "Estados Unidos",
      province: "Texas",
      municipality: command.includes("houston") ? "Houston" : undefined
    };
  }

  if (command.includes("new york")) {
    return {
      country: "Estados Unidos",
      province: "New York",
      municipality: "New York City"
    };
  }

  return {};
}

function productSearchHref(rawCommand: string) {
  const raw = rawCommand.trim();
  if (!raw) return "/products";

  const command = normalizeCommand(raw);
  const query = new URLSearchParams();
  const productWord = productWords.find((word) => command.includes(word));
  const location = getLocationParams(command);

  if (productWord && !["producto", "servicio"].includes(productWord)) {
    query.set("q", productWord);
  }

  Object.entries(location).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  if (!Array.from(query.keys()).length && !command.includes("producto") && !command.includes("comprar")) {
    query.set("q", raw);
  }

  if (!Array.from(query.keys()).length) return "/products";

  return `/products?${query.toString()}`;
}

export function resolveElianaCommand(rawCommand: string) {
  const command = normalizeCommand(rawCommand);

  if (!command) {
    return {
      intent: elianaCommandIntents[0],
      href: "/products",
      reason: "Empieza revisando productos y servicios por zona."
    };
  }

  const matchedIntent =
    elianaCommandIntents.find((intent) =>
      intent.keywords.some((keyword) => command.includes(normalizeCommand(keyword)))
    ) ?? elianaCommandIntents[0];

  if (matchedIntent.id === "buy") {
    return {
      intent: matchedIntent,
      href: productSearchHref(rawCommand),
      reason: "Voy a buscar eso dentro del catalogo por zona y vendedor."
    };
  }

  return {
    intent: matchedIntent,
    href: matchedIntent.href,
    reason: matchedIntent.description
  };
}
