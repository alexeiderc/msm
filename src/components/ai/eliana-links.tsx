"use client";

import Link from "next/link";

const internalRouteLabels: Record<string, string> = {
  "/products": "Abrir productos",
  "/remittances": "Abrir remesas",
  "/orders": "Abrir ordenes",
  "/payment-methods": "Abrir metodos",
  "/tiendas-vip": "Abrir tiendas VIP",
  "/support": "Abrir soporte",
  "/terms": "Abrir terminos",
  "/auth/signup": "Crear cuenta",
  "/account/kyc": "Validar cuenta",
  "/vendedores/solicitud": "Solicitar perfil VIP",
  "/checkout": "Abrir checkout",
  "/help": "Abrir ayuda",
  "/eliana": "Abrir ELIANA",
  "/dashboard/vip": "Abrir panel VIP",
  "/dashboard/economic": "Abrir panel economico",
  "/dashboard/admin": "Abrir panel admin"
};

export const elianaActionLinks = [
  ["/products", "Productos"],
  ["/remittances", "Remesas"],
  ["/orders", "Ordenes"],
  ["/support", "Soporte"],
  ["/payment-methods", "Metodos"],
  ["/tiendas-vip", "Tiendas VIP"],
  ["/auth/signup", "Crear cuenta"]
] as const;

function cleanToken(token: string) {
  const trailing = token.match(/[.,;:!?)]$/)?.[0] ?? "";
  return {
    href: trailing ? token.slice(0, -1) : token,
    trailing
  };
}

function isInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

export function ElianaMessageContent({ content, inverted = false }: { content: string; inverted?: boolean }) {
  const pieces = content.split(/(https?:\/\/[^\s]+|\/[a-z0-9][a-z0-9/-]*(?:\?[^\s]+)?)/gi);

  return (
    <>
      {pieces.map((piece, index) => {
        if (!piece) return null;
        const { href, trailing } = cleanToken(piece);

        if (isInternalHref(href)) {
          return (
            <span key={`${piece}-${index}`}>
              <Link
                href={href}
                className={
                  inverted
                    ? "font-bold underline decoration-white/60 underline-offset-4"
                    : "font-bold text-msm-blue underline decoration-blue-200 underline-offset-4 hover:text-msm-electric"
                }
              >
                {internalRouteLabels[href] ?? href}
              </Link>
              {trailing}
            </span>
          );
        }

        if (href.startsWith("http://") || href.startsWith("https://")) {
          return (
            <span key={`${piece}-${index}`}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className={
                  inverted
                    ? "font-bold underline decoration-white/60 underline-offset-4"
                    : "font-bold text-msm-blue underline decoration-blue-200 underline-offset-4 hover:text-msm-electric"
                }
              >
                Abrir enlace
              </a>
              {trailing}
            </span>
          );
        }

        return <span key={`${piece}-${index}`}>{piece}</span>;
      })}
    </>
  );
}

export function ElianaActionLinks({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {elianaActionLinks.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className={
            compact
              ? "rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-bold text-msm-blue transition hover:border-msm-blue hover:bg-white"
              : "inline-flex min-h-10 items-center justify-center rounded-md border border-blue-100 bg-white px-3 text-sm font-bold text-msm-blue shadow-soft transition hover:border-msm-blue hover:bg-blue-50"
          }
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
