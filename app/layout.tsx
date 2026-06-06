import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeliWood — Masívne drevo a nábytok",
  description: "Predaj masívneho dreva — dosky, hranoly, živá hrana. Dub, orech, buk. Nábytok na mieru.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk" className="h-full" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col font-body antialiased">
        {children}
      </body>
    </html>
  );
}
