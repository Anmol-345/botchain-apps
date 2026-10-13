import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shinobi - Privacy Stealth Protocol on BOT Chain Mainnet",
  description: "Non-custodial stealth transactions, ephemeral key announcements, and shielded payments on BOT Chain Mainnet.",
  icons: {
    icon: "/botchain-logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#03060c] text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
