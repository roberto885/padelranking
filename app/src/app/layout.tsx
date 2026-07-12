import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "./pwa-register";

export const metadata: Metadata = {
  title: "Punto | Club de pádel",
  description: "Partidos, eventos y ranking de tu club de pádel.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Punto", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#123a35", colorScheme: "light" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body className="min-h-full flex flex-col"><PwaRegister />{children}</body>
    </html>
  );
}
