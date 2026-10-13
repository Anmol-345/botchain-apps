import Image from "next/image";
import { ExternalLink, Globe, Search, Wallet2, Layers } from "lucide-react";
import { BOT_CHAIN } from "@/lib/botchain";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#04060d] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pb-10 border-b border-slate-800/60">
          {/* Brand info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                <Wallet2 className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Omni<span className="text-indigo-400">Wallet</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Universal multi-chain wallet aggregator unifying portfolio balances, cross-network liquidity, and batch transactions anchored on BOT Chain Mainnet.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Ultra-Compact Contract: Deploys in &lt; 0.1 BOT
            </div>
          </div>

          {/* BOT Chain Ecosystem Spotlight */}
          <div className="md:col-span-4 space-y-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-emerald-500/40 shadow-sm shrink-0 bg-black">
                <Image
                  src="/botchain-logo.jpeg"
                  alt="BOT Chain Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white tracking-wide">
                  BOT Chain Ecosystem
                </h4>
                <p className="text-xs text-emerald-400">Mainnet • Chain ID: 677</p>
              </div>
            </div>
            
            <div className="space-y-2 pt-1 text-xs">
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 hover:bg-emerald-500/10 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/30 transition-all group"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  BOT Chain official website
                </span>
                <span className="text-slate-500 text-[11px] group-hover:text-emerald-400 flex items-center gap-1">
                  https://botchain.ai
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </span>
              </a>

              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 hover:bg-emerald-500/10 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/30 transition-all group"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  BOT Chain Explorer
                </span>
                <span className="text-slate-500 text-[11px] group-hover:text-cyan-400 flex items-center gap-1">
                  https://scan.botchain.ai
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </span>
              </a>
            </div>
          </div>

          {/* Developer Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              BOT Chain Specs
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://remix.ethereum.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Deploy OmniVault on Remix
                </a>
              </li>
              <li>
                <span className="text-slate-500">RPC Endpoint:</span>{" "}
                <code className="text-indigo-300 text-[11px] bg-slate-900 px-1 py-0.5 rounded">
                  {BOT_CHAIN.rpcUrl}
                </code>
              </li>
              <li>
                <span className="text-slate-500">Chain ID:</span>{" "}
                <span className="text-white font-mono">677 (0x2a5)</span>
              </li>
              <li>
                <span className="text-slate-500">Gas Asset:</span>{" "}
                <span className="text-white font-mono">BOT</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 OmniWallet Protocol. Powered by BOT Chain Mainnet.</p>
          <div className="flex items-center gap-6">
            <a href="https://botchain.ai" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
              * BOT Chain official website: https://botchain.ai
            </a>
            <a href="https://scan.botchain.ai" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
              * BOT Chain Explorer: https://scan.botchain.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
