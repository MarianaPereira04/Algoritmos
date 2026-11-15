import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OS Lab",
  description: "Laboratorio educativo de Sistemas Operativos.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
