import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portwise — AI Portfolio Screener",
  description: "Interactive admissions portfolio screening mockup",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
