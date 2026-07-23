import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/pwa/pwa-register";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplace.msmmystore.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "MSM my store",
  description: "Plataforma principal de MSM para productos, servicios, remesas, pagos, ordenes, vendedores VIP y entregas verificadas por pais y zona.",
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "MSM my store",
    description: "Productos, servicios, remesas, pagos, ordenes y vendedores VIP en el ecosistema MSM.",
    url: siteUrl,
    siteName: "MSM my store",
    type: "website"
  },
  appleWebApp: {
    capable: true,
    title: "MSM my store",
    statusBarStyle: "black-translucent"
  },
  icons: {
    icon: "/icons/msm-icon.svg",
    apple: "/icons/msm-icon.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#197BD2"
};

const lowDataScript = `
try {
  var saved = localStorage.getItem("msm-low-data-mode");
  var connection = navigator.connection || {};
  var lite = saved ? saved === "true" : Boolean(connection.saveData || connection.effectiveType === "slow-2g" || connection.effectiveType === "2g");
  document.documentElement.dataset.lite = String(lite);
  var theme = localStorage.getItem("msm-theme");
  if (theme) document.documentElement.classList.toggle("dark", theme === "dark");
  else if (window.matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.classList.add("dark");
} catch (_) {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: lowDataScript }} />
      </head>
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
