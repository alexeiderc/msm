import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplace.msmmystore.com";

const publicRoutes = [
  "",
  "/products",
  "/remittances",
  "/exchange",
  "/wallet",
  "/atm",
  "/payment-methods",
  "/tiendas-vip",
  "/how-it-works",
  "/quienes-somos",
  "/support",
  "/terms",
  "/vendedores/solicitud"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/products" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/products" ? 0.9 : 0.7
  }));
}
