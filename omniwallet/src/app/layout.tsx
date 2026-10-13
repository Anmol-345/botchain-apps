import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniWallet - Multi-Chain Asset Aggregator on BOT Chain Mainnet",
  description: "Unified portfolio aggregator, cross-network liquidity tracking, and batch dispatch on BOT Chain Mainnet.",
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
      <body className="bg-[#050711] text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
