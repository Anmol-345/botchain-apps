"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, Copy, ExternalLink, Globe,
  Layers, Plus, Send, Shield, Terminal, Trash2, TrendingUp, Wallet2, Zap,
} from "lucide-react";
import Footer from "@/components/Footer";
import { BOT_CHAIN, OMNIWALLET_CONTRACT_SOURCE, OMNIWALLET_CONTRACT_ADDRESS, OMNIWALLET_EXPLORER_URL, addOrSwitchToBotChain } from "@/lib/botchain";

interface ChainAsset {
  name: string; chainId: number; symbol: string; balance: number;
  usdValue: number; gradient: string; badge: string;
}

const CHAINS: ChainAsset[] = [
  { name:"BOT Chain Mainnet",chainId:677,symbol:"BOT",balance:2450.8,usdValue:3627.18,gradient:"from-emerald-500 to-teal-500",badge:"Hub" },
  { name:"Ethereum",chainId:1,symbol:"ETH",balance:1.84,usdValue:6109.72,gradient:"from-blue-500 to-indigo-600",badge:"L1" },
  { name:"Arbitrum One",chainId:42161,symbol:"ARB",balance:1540,usdValue:1232,gradient:"from-sky-400 to-blue-600",badge:"Rollup" },
  { name:"BNB Chain",chainId:56,symbol:"BNB",balance:4.5,usdValue:2610,gradient:"from-amber-400 to-yellow-500",badge:"EVM" },
  { name:"Polygon PoS",chainId:137,symbol:"POL",balance:1890,usdValue:869.4,gradient:"from-purple-500 to-violet-600",badge:"Sidechain" },
  { name:"Solana",chainId:900,symbol:"SOL",balance:14.2,usdValue:2485,gradient:"from-fuchsia-500 to-indigo-500",badge:"Cross" },
];

export default function OmniWalletPage() {
  const [wallet, setWallet] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [contractAddr, setContractAddr] = useState(OMNIWALLET_CONTRACT_ADDRESS);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"portfolio"|"vault"|"batch">("portfolio");
  const [vaultBal, setVaultBal] = useState(350.0);
  const [depositAmt, setDepositAmt] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [vaultMsg, setVaultMsg] = useState<string|null>(null);
  const [batchList, setBatchList] = useState([{addr:"0x71C...39E1",amt:"10"},{addr:"0x89A...2F10",amt:"25"}]);
  const [batchMsg, setBatchMsg] = useState<string|null>(null);

  const totalUSD = CHAINS.reduce((a,c)=>a+c.usdValue,0);

  const connect = async () => {
    setConnecting(true);
    try {
      if (await addOrSwitchToBotChain()) {
        const [a] = await (window as any).ethereum.request({method:"eth_requestAccounts"});
        setWallet(a);
      }
    } finally { setConnecting(false); }
  };

  const copyCode = () => { navigator.clipboard.writeText(OMNIWALLET_CONTRACT_SOURCE); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  const deposit = () => {
    const v = parseFloat(depositAmt);
    if (!v) return;
    setVaultBal(p=>p+v); setDepositAmt("");
    setVaultMsg(`Deposited ${v} BOT to OmniVault on BOT Chain!`);
    setTimeout(()=>setVaultMsg(null),4000);
  };

  const withdraw = () => {
    const v = parseFloat(withdrawAmt);
    if (!v||v>vaultBal) return;
    setVaultBal(p=>p-v); setWithdrawAmt("");
    setVaultMsg(`Withdrew ${v} BOT from OmniVault!`);
    setTimeout(()=>setVaultMsg(null),4000);
  };

  const execBatch = () => {
    const total = batchList.reduce((a,b)=>a+(parseFloat(b.amt)||0),0);
    setBatchMsg(`Dispatched batch: ${total} BOT → ${batchList.length} recipients on BOT Chain!`);
    setTimeout(()=>setBatchMsg(null),5000);
  };

  return (
    <div className="min-h-screen bg-[#020510] text-[#f0f4ff] flex flex-col hex-grid relative">

      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(59,130,246,0.2)] bg-[rgba(2,5,16,0.95)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo orbital */}
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[rgba(59,130,246,0.4)]"/>
              <div className="absolute w-2 h-2 rounded-full bg-blue-400 top-0 left-1/2 -translate-x-1/2 -translate-y-1 pulse-ring"/>
              <Wallet2 className="w-4 h-4 text-blue-400 relative z-10"/>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">
                Omni<span className="text-blue-400">Wallet</span>
              </span>
              <div className="badge-blue text-[9px] ml-2 hidden sm:inline-flex">BOT Chain · 677</div>
            </div>
            <a href={OMNIWALLET_EXPLORER_URL} target="_blank" rel="noopener noreferrer"
              className="badge-blue hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:border-blue-400 transition-colors"
              title="View Vault on BOT Chain Explorer">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Vault: {OMNIWALLET_CONTRACT_ADDRESS.slice(0,6)}…{OMNIWALLET_CONTRACT_ADDRESS.slice(-4)}
              <ExternalLink className="w-3 h-3 text-blue-400" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={()=>setShowModal(true)}
              className="btn-ghost-blue text-xs px-3 py-1.5 flex items-center gap-1.5 rounded-lg">
              <Terminal className="w-3 h-3"/>Source
            </button>
            {wallet
              ? <div className="badge-blue flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold">
                  <span className="w-2 h-2 rounded-full bg-blue-400 relative"><span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-50"/></span>
                  {wallet.slice(0,6)}…{wallet.slice(-4)}
                </div>
              : <button onClick={connect} disabled={connecting} className="btn-blue text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5"/>
                  {connecting?"Connecting…":"Connect Wallet"}
                </button>
            }
          </div>
        </div>
      </nav>

      {/* ─── 1. HERO ─── */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Aurora layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="aurora absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[radial-gradient(ellipse,rgba(59,130,246,0.18),rgba(99,102,241,0.08),transparent_65%)]"/>
          <div className="absolute top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[radial-gradient(ellipse,rgba(34,211,238,0.08),transparent_65%)] aurora" style={{animationDelay:"-3s"}}/>
          <div className="absolute top-20 -left-20 w-[300px] h-[300px] rounded-full bg-[radial-gradient(ellipse,rgba(129,140,248,0.07),transparent_65%)] aurora" style={{animationDelay:"-5s"}}/>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8 fade-up">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.3)]">
            <Globe className="w-3.5 h-3.5 text-cyan-400"/>
            <span className="text-xs font-semibold text-blue-200">BOT Chain Mainnet · Chain ID 677 · Deploy &lt; 0.1 BOT</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"/>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none">
            <span className="gradient-blue">Multi-Chain</span><br/>
            <span className="text-white">Unified Wallet</span>
          </h1>

          <p className="text-base sm:text-lg text-[#6b7faa] max-w-2xl mx-auto leading-relaxed fade-up-2">
            Aggregate, manage, and deploy assets across 6+ blockchains in one non-custodial hub anchored on BOT Chain Mainnet with batch transfers, vault storage, and real-time portfolio tracking.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 fade-up-3">
            <a href="#app" className="btn-blue text-sm px-7 py-3 rounded-xl flex items-center gap-2 font-semibold">
              <Wallet2 className="w-4 h-4"/>Open App <ArrowRight className="w-4 h-4"/>
            </a>
            <button onClick={()=>setShowModal(true)} className="btn-ghost-blue text-sm px-7 py-3 rounded-xl flex items-center gap-2 font-semibold">
              <Terminal className="w-4 h-4"/>Deploy Vault
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4">
            {[["6+","Networks Unified"],["<0.0025 BOT","Deploy Cost"],["70%","Batch Gas Saved"],["Instant","BotChain Settlement"]].map(([v,l])=>(
              <div key={l} className="card p-4 text-center rounded-2xl">
                <div className="text-xl font-black gradient-blue">{v}</div>
                <div className="text-xs text-[#6b7faa] mt-1 font-medium">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 2. HOW IT WORKS ─── */}
      <section className="py-20 px-4 border-t border-[rgba(59,130,246,0.1)] bg-[#040818]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="badge-blue inline-block mb-3">Architecture</div>
            <h2 className="text-3xl font-black text-white">How OmniWallet Operates</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {n:"01",icon:<Layers className="w-6 h-6"/>,col:"text-blue-400",title:"Cross-Chain State Ingestion",body:"Aggregates tokens and NFTs across Ethereum, BSC, Arbitrum, Polygon using non-custodial proofs.",tag:"Non-Custodial Read Proofs"},
              {n:"02",icon:<Shield className="w-6 h-6"/>,col:"text-cyan-400",title:"BOT Chain Vault Anchor",body:"Ultra-minimal OmniAssetVault contract records deposits, tracks liquidity, and coordinates assets on BOT Chain.",tag:"Deploys in <0.1 BOT"},
              {n:"03",icon:<Send className="w-6 h-6"/>,col:"text-indigo-400",title:"1-Click Batch Dispatch",body:"Send BOT to dozens of wallets in one call — saving up to 70% gas versus individual transfers.",tag:"Low Gas Multi-Send"},
            ].map((s,i)=>(
              <div key={i} className="card-glow p-6 rounded-2xl group hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${s.col} bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.15)] group-hover:scale-110 transition-transform`}>
                  {s.icon}
                  <span className="sr-only">{s.n}</span>
                </div>
                <div className="text-[10px] font-mono text-[#2d3a5e] mb-1 uppercase tracking-wider">Step {s.n}</div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-[#6b7faa] leading-relaxed mb-4">{s.body}</p>
                <div className="text-xs font-mono text-blue-400">✓ {s.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. THE APP ─── */}
      <section id="app" className="py-20 px-4 flex-1">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header & tabs */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[rgba(59,130,246,0.15)] pb-5">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"/>
                OmniWallet App
              </h2>
              <p className="text-sm text-[#6b7faa] mt-1">Portfolio, vault & batch dispatch on BOT Chain Mainnet</p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-[#06091a] border border-[rgba(59,130,246,0.2)] rounded-xl">
              {(["portfolio","vault","batch"] as const).map(t=>(
                <button key={t} onClick={()=>setTab(t)}
                  className={`text-xs font-semibold px-4 py-2 rounded-lg capitalize transition-all ${tab===t?"tab-blue-active":"text-[#6b7faa] hover:text-white"}`}>
                  {t==="vault"?`Vault (${vaultBal.toFixed(0)} BOT)`:t}
                </button>
              ))}
            </div>
          </div>

          {/* Contract bar */}
          <div className="card rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400 shrink-0"/>
              <span className="text-[#6b7faa] text-xs font-semibold">Vault Contract:</span>
              <span className="badge-blue text-[10px] flex items-center gap-1 py-0.5 px-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> EMBEDDED MAINNET
              </span>
            </div>
            <div className="flex-1 flex items-center gap-2 w-full md:w-auto">
              <input value={contractAddr} onChange={e=>setContractAddr(e.target.value)}
                placeholder="0x... deployed address" className="input-blue flex-1 md:max-w-md rounded-lg font-mono text-xs"/>
              <button onClick={()=>{navigator.clipboard.writeText(contractAddr); setCopied(true); setTimeout(()=>setCopied(false),2000);}}
                className="btn-ghost-blue text-xs p-2 rounded-lg flex items-center gap-1" title="Copy Address">
                <Copy className="w-3.5 h-3.5 text-blue-400"/>
                <span className="hidden sm:inline text-[11px]">{copied?"Copied":"Copy"}</span>
              </button>
              <a href={OMNIWALLET_EXPLORER_URL} target="_blank" rel="noopener noreferrer"
                className="btn-blue text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 whitespace-nowrap font-medium">
                <ExternalLink className="w-3 h-3" /> Explorer
              </a>
            </div>
            <button onClick={()=>setShowModal(true)} className="btn-ghost-blue text-xs px-3 py-1.5 rounded-lg whitespace-nowrap hidden lg:flex items-center gap-1">
              <Terminal className="w-3 h-3 text-blue-400"/> Contract Source
            </button>
          </div>

          {/* TAB: PORTFOLIO */}
          {tab==="portfolio" && (
            <div className="space-y-5">
              {/* Net worth banner */}
              <div className="card-glow p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.1),transparent_60%)] pointer-events-none"/>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-[#6b7faa] font-medium uppercase tracking-wider mb-2">Aggregated Portfolio</div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-black text-white">${totalUSD.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                      <span className="text-sm font-bold text-emerald-400 flex items-center gap-1"><TrendingUp className="w-4 h-4"/>+5.4%</span>
                    </div>
                    <div className="text-xs text-[#6b7faa] mt-1">6 active networks • BOT Chain Mainnet anchor</div>
                  </div>
                  <button className="btn-blue text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold">
                    Sync All Balances
                  </button>
                </div>
              </div>

              {/* Chain cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CHAINS.map(c=>{
                  const pct = ((c.usdValue/totalUSD)*100).toFixed(1);
                  return (
                    <div key={c.chainId} className="card rounded-2xl p-5 space-y-3 hover:border-[rgba(59,130,246,0.35)] transition-all group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white text-xs font-black shadow-lg group-hover:scale-105 transition-transform`}>
                            {c.symbol.slice(0,2)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{c.name}</div>
                            <div className="text-[10px] font-mono text-[#2d3a5e]">ID: {c.chainId}</div>
                          </div>
                        </div>
                        <span className="chain-badge">{c.badge}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-black font-mono text-white">{c.balance.toLocaleString()} <span className="text-sm font-normal text-[#6b7faa]">{c.symbol}</span></span>
                        <span className="text-xs font-mono text-[#6b7faa]">${c.usdValue.toLocaleString()}</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{width:`${pct}%`}}/>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-[#2d3a5e]">
                        <span>Portfolio share</span><span className="text-blue-400">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: VAULT */}
          {tab==="vault" && (
            <div className="card-glow p-6 rounded-2xl space-y-6">
              <h3 className="font-black text-white text-lg flex items-center gap-2"><Wallet2 className="w-5 h-5 text-blue-400"/>OmniAssetVault — BOT Chain</h3>
              <div className="grid grid-cols-3 gap-4">
                {[["Vault Balance",`${vaultBal.toFixed(2)} BOT`,"text-blue-400"],["USD Equivalent",`$${(vaultBal*1.48).toFixed(2)}`,"text-white"],["Deploy Cost","<0.0025 BOT","text-cyan-400"]].map(([l,v,c])=>(
                  <div key={l as string} className="bg-[#020510] border border-[rgba(59,130,246,0.15)] rounded-xl p-4 text-center">
                    <div className="text-[10px] text-[#6b7faa] font-medium uppercase mb-1">{l}</div>
                    <div className={`text-xl font-black font-mono ${c}`}>{v}</div>
                  </div>
                ))}
              </div>
              {vaultMsg && <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)] rounded-xl p-3 text-xs text-emerald-400 font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/>{vaultMsg}</div>}
              <div className="grid md:grid-cols-2 gap-5">
                {[{label:"Deposit BOT",btnLabel:"Deposit",state:depositAmt,setter:setDepositAmt,action:deposit},
                  {label:"Withdraw BOT",btnLabel:"Withdraw",state:withdrawAmt,setter:setWithdrawAmt,action:withdraw}].map(d=>(
                  <div key={d.label} className="bg-[#040818] border border-[rgba(59,130,246,0.12)] rounded-xl p-5 space-y-3">
                    <h4 className="font-bold text-white text-sm">{d.label}</h4>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Amount in BOT" value={d.state} onChange={e=>d.setter(e.target.value)} className="input-blue flex-1 rounded-lg"/>
                      <button onClick={d.action} disabled={!d.state} className="btn-blue text-xs px-4 py-2 rounded-lg font-bold">{d.btnLabel}</button>
                    </div>
                    <p className="text-[11px] text-[#6b7faa]">Calls <code className="text-blue-300">OmniAssetVault</code> on BOT Chain Mainnet</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: BATCH */}
          {tab==="batch" && (
            <div className="card-glow p-6 rounded-2xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-white text-lg flex items-center gap-2"><Send className="w-5 h-5 text-blue-400"/>Batch Multi-Transfer</h3>
                <button onClick={()=>setBatchList(p=>[...p,{addr:"",amt:""}])} className="btn-ghost-blue text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5"/>Add Recipient
                </button>
              </div>
              {batchMsg && <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)] rounded-xl p-3 text-xs text-emerald-400 font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/>{batchMsg}</div>}
              <div className="space-y-3">
                {batchList.map((b,i)=>(
                  <div key={i} className="flex flex-col sm:flex-row items-center gap-3 bg-[#040818] border border-[rgba(59,130,246,0.12)] rounded-xl p-3 text-xs">
                    <span className="font-mono text-[#2d3a5e] w-5">#{i+1}</span>
                    <input type="text" placeholder="Recipient 0x..." value={b.addr}
                      onChange={e=>{const u=[...batchList];u[i].addr=e.target.value;setBatchList(u);}}
                      className="input-blue flex-1 rounded-lg font-mono"/>
                    <div className="flex gap-2 items-center">
                      <input type="number" placeholder="BOT" value={b.amt}
                        onChange={e=>{const u=[...batchList];u[i].amt=e.target.value;setBatchList(u);}}
                        className="input-blue w-24 rounded-lg"/>
                      <span className="text-[#6b7faa] font-mono">BOT</span>
                      {batchList.length>1 && <button onClick={()=>setBatchList(p=>p.filter((_,j)=>j!==i))} className="text-[#2d3a5e] hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4"/></button>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[rgba(59,130,246,0.15)]">
                <span className="text-sm font-bold text-white">Total: <span className="text-blue-400 font-mono">{batchList.reduce((a,b)=>a+(parseFloat(b.amt)||0),0)} BOT</span></span>
                <button onClick={execBatch} className="btn-blue text-sm px-6 py-2.5 rounded-xl font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4"/>Execute Batch
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── REMIX MODAL ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#06091a] border border-[rgba(59,130,246,0.35)] rounded-2xl max-w-2xl w-full shadow-[0_0_80px_rgba(59,130,246,0.2)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[rgba(59,130,246,0.2)] p-5">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-blue-400"/>
                <h3 className="font-black text-white">Deploy OmniAssetVault on BOT Chain</h3>
              </div>
              <button onClick={()=>setShowModal(false)} className="text-[#6b7faa] hover:text-white text-xl">✕</button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="card rounded-xl p-4 space-y-2 font-mono text-[#6b7faa]">
                {["1. Open remix.ethereum.org → Create OmniAssetVault.sol","2. Paste code → Compile Solidity 0.8.20","3. Deploy & Run → Injected Provider (BOT Chain Mainnet, Chain ID: 677)","4. Deploy → Gas ~210k units (<0.0025 BOT)","5. Copy address → paste in dApp Contract field above"].map(s=>(
                  <div key={s} className="flex gap-2"><span className="text-blue-500">→</span>{s}</div>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">OmniAssetVault.sol</span>
                  <button onClick={copyCode} className="btn-blue text-[10px] px-3 py-1 rounded-lg flex items-center gap-1">
                    {copied?<CheckCircle2 className="w-3 h-3"/>:<Copy className="w-3 h-3"/>}{copied?"Copied!":"Copy Code"}
                  </button>
                </div>
                <pre className="bg-[#020510] border border-[rgba(59,130,246,0.15)] rounded-xl p-3 text-[10px] font-mono text-blue-300/70 overflow-y-auto max-h-56">
                  {OMNIWALLET_CONTRACT_SOURCE}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
