import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { PostHogProvider } from "@/components/providers/PostHogProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "OnePercent | Mejora un 1% cada día - Hábitos Atómicos",
  description: "Descubre OnePercent, el motor de progresión incremental con IA inspirado en Hábitos Atómicos. Mejora un 1% cada día con micro-pasos inteligentes y conviértete en un 37% mejor en un año.",
  keywords: ["hábitos", "crecimiento personal", "hábitos atómicos", "IA", "inteligencia artificial", "interés compuesto", "productividad", "mejora continua", "James Clear", "progreso diario"],
  authors: [{ name: "OnePercent Team" }],
  openGraph: {
    title: "OnePercent | Mejora un 1% cada día - Hábitos Atómicos",
    description: "Domina tus hábitos con el poder del interés compuesto y la IA. Sé un 3700% mejor en un año.",
    url: "https://onepercent.app",
    siteName: "OnePercent",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OnePercent | Mejora un 1% cada día",
    description: "La app inspirada en James Clear para transformar tu vida un 1% a la vez.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OnePercent",
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={cn(inter.variable, "font-sans min-h-screen bg-zinc-950 text-zinc-50 selection:bg-emerald-500/30 selection:text-emerald-200")}>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
