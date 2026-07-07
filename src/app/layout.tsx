import type { Metadata } from "next";
import { PwaRegister } from "@/components/pwa/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "MSM my store",
  description: "Plataforma principal de MSM para productos, servicios, remesas, pagos, ordenes, vendedores VIP y entregas verificadas por pais y zona.",
  manifest: "/manifest.webmanifest",
  themeColor: "#197BD2",
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
    <html lang="es">
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
