import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Credora - Decentralized Oracle Network on BOT Chain Mainnet",
  description: "Real-time high frequency decentralized data feeds, weather telemetry, and AI compute metrics on BOT Chain Mainnet.",
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
      <body className="bg-[#04060d] text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
