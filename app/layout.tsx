import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import BotonSubir from "@/components/BotonSubir";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Postulaciones | PERTEC",
  description:
    "Formulario de postulación laboral PERTEC — continuidad operativa para la gran minería.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-crema text-tinta">
        {children}
        <BotonSubir />
      </body>
    </html>
  );
}
