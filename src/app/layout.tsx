import type { Metadata } from "next";
import { Providers } from "@/components/auth/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Infinity Comanda AI - Pedidos Inteligentes para Restaurantes",
  description: "Plataforma SaaS de comandas inteligentes com IA para bares e restaurantes. QR Code, PIX, cozinha integrada.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}