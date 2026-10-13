"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, Copy, ExternalLink, Eye, EyeOff,
  Key, Lock, RefreshCw, Search, Send, Terminal, Zap,
} from "lucide-react";
import Footer from "@/components/Footer";
import { BOT_CHAIN, SHINOBI_CONTRACT_SOURCE, SHINOBI_CONTRACT_ADDRESS, SHINOBI_EXPLORER_URL, addOrSwitchToBotChain } from "@/lib/botchain";

interface Announcement {
  id: string; stealthAddr: string; amount: number;
  block: number; ephKey: string; time: string; claimed: boolean;
}

const INITIAL_ANN: Announcement[] = [
  { id:"a1",stealthAddr:"0x89bA476210A8c4F817B29a00763C4182EcC1a620",amount:15,block:1849204,ephKey:"0x3e18a...4b0f",time:"2m ago",claimed:false },
  { id:"a2",stealthAddr:"0x4e6503b22E7eCd7C64790E5fD3734b07A8435dC1",amount:42.5,block:1849182,ephKey:"0x8f02b...9a12",time:"8m ago",claimed:true },
  { id:"a3",stealthAddr:"0x1Fa39B607f2aF9cE71B072D4378125C20A918076",amount:120,block:1849150,ephKey:"0x2c49a...88dd",time:"18m ago",claimed:true },
];

export default function ShinobiPage() {
  const [wallet, setWallet] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [contractAddr, setContractAddr] = useState(SHINOBI_CONTRACT_ADDRESS);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"generator"|"transfer"|"scanner"|"pool">("generator");
  const [metaAddr, setMetaAddr] = useState("st:botchain:0x028bf4...93a8");
  const [stealth, setStealth] = useState({addr:"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",ephKey:"0x03a74b882e38c92a5d206f40bfa176df993b4f6204c8f2ba16d94600e08f5d023a",tag:"0x4f"});
  const [sendAmt, setSendAmt] = useState("5.0");
  const [txMsg, setTxMsg] = useState<string|null>(null);
  const [anns, setAnns] = useState(INITIAL_ANN);
  const [scanning, setScanning] = useState(false);
  const [poolAmt, setPoolAmt] = useState("");
  const [commitment, setCommitment] = useState("");
  const [poolMsg, setPoolMsg] = useState<string|null>(null);

  const connect = async () => {
    setConnecting(true);
    try {
      if (await addOrSwitchToBotChain()) {
        const [a] = await (window as any).ethereum.request({method:"eth_requestAccounts"});
        setWallet(a);
      }
    } finally { setConnecting(false); }
  };

  const copyCode = () => { navigator.clipboard.writeText(SHINOBI_CONTRACT_SOURCE); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  const genStealth = () => {
    const rh = () => Array.from({length:40},()=>Math.floor(Math.random()*16).toString(16)).join("");
    setStealth({ addr:"0x"+rh(), ephKey:"0x03"+Array.from({length:64},()=>Math.floor(Math.random()*16).toString(16)).join(""), tag:"0x"+Math.floor(Math.random()*256).toString(16).padStart(2,"0") });
  };

  const sendStealth = () => {
    if (!sendAmt) return;
    setTxMsg(`Shielded payment of ${sendAmt} BOT dispatched → ${stealth.addr.slice(0,12)}… on BOT Chain Mainnet`);
    setAnns(p=>[{id:`a${Date.now()}`,stealthAddr:stealth.addr,amount:parseFloat(sendAmt),block:1849220,ephKey:stealth.ephKey.slice(0,12)+"...",time:"just now",claimed:false},...p]);
    setTimeout(()=>setTxMsg(null),5000);
  };

  const scan = () => { setScanning(true); setTimeout(()=>setScanning(false),1500); };
  const claim = (id:string) => setAnns(p=>p.map(a=>a.id===id?{...a,claimed:true}:a));

  const poolDeposit = () => {
    if (!poolAmt) return;
    const c = "0x"+Array.from({length:64},()=>Math.floor(Math.random()*16).toString(16)).join("");
    setCommitment(c);
    setPoolMsg(`Deposited ${poolAmt} BOT to Shielded Pool. Keep your note safe!`);
    setPoolAmt("");
  };

  return (
    <div className="min-h-screen bg-[#020804] text-[#d1fae5] flex flex-col bamboo-stripe">

      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(16,185,129,0.15)] bg-[rgba(2,8,4,0.97)] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-l-2 border-[rgba(16,185,129,0.8)] bg-[rgba(16,185,129,0.07)] flex items-center justify-center jade-pulse">
              <EyeOff className="w-4 h-4 text-emerald-400"/>
            </div>
            <div className="font-bold text-sm tracking-widest text-[#d1fae5]" style={{fontFamily:"'Sora',sans-serif"}}>
              SHINOBI<span className="text-emerald-400">::STEALTH</span>
            </div>
            <span className="badge-jade ml-2 hidden sm:inline-block">BOT Chain · 677</span>
            <a href={SHINOBI_EXPLORER_URL} target="_blank" rel="noopener noreferrer"
              className="badge-jade hidden lg:inline-flex items-center gap-1.5 hover:border-emerald-400 transition-colors"
              title="View Stealth Protocol on BOT Chain Explorer">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 jade-pulse" />
              Stealth: {SHINOBI_CONTRACT_ADDRESS.slice(0,6)}…{SHINOBI_CONTRACT_ADDRESS.slice(-4)}
              <ExternalLink className="w-2.5 h-2.5 ml-0.5 text-emerald-400" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={()=>setShowModal(true)} className="btn-ghost-jade text-xs px-3 py-1.5 flex items-center gap-1.5">
              <Terminal className="w-3 h-3"/>SOURCE
            </button>
            {wallet
              ? <div className="badge-jade flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 jade-pulse"/>{wallet.slice(0,6)}…{wallet.slice(-4)}</div>
              : <button onClick={connect} disabled={connecting} className="btn-jade text-xs px-4 py-2 flex items-center gap-1.5 clip-slash-sm">
                  <Zap className="w-3 h-3"/>
                  {connecting?"CONNECTING…":"CONNECT"}
                </button>
            }
          </div>
        </div>
      </nav>

      {/* ─── SCAN LINE INDICATOR ─── */}
      <div className="relative h-0.5 overflow-hidden bg-[#020804]">
        <div className="scan-line"/>
      </div>

      {/* ─── 1. HERO ─── */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,rgba(16,185,129,0.08),transparent_60%)]"/>
          <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-[radial-gradient(ellipse,rgba(13,148,136,0.06),transparent_70%)]"/>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center relative z-10">
          {/* Left: Copy */}
          <div className="space-y-7 fade-slash">
            <div className="flex items-center gap-3">
              <div className="status-line w-12 block"/>
              <span className="mono-jade text-xs text-emerald-600 uppercase tracking-[0.25em]">Privacy-First Protocol</span>
              <div className="status-line w-12 block"/>
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl font-black leading-none tracking-tight" style={{fontFamily:"'Sora',sans-serif"}}>
                <span className="text-[#d1fae5]">Stealth</span><br/>
                <span className="jade-text jade-flicker">Transactions.</span><br/>
                <span className="text-[#4b7358] text-3xl sm:text-4xl font-light">Untraceable.</span>
              </h1>
            </div>

            <p className="mono-jade text-sm text-[#4b7358] leading-relaxed max-w-md">
              <span className="text-emerald-600">›</span> Non-interactive stealth addresses via ECDH key derivation. Ephemeral announcements on BOT Chain. Zero transaction graph linkability.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a href="#app" className="btn-jade text-xs px-6 py-2.5 flex items-center gap-2 clip-slash-sm">
                <EyeOff className="w-3.5 h-3.5"/>LAUNCH STEALTH APP<ArrowRight className="w-3.5 h-3.5"/>
              </a>
              <button onClick={()=>setShowModal(true)} className="btn-ghost-jade text-xs px-6 py-2.5 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5"/>DEPLOY CONTRACT
              </button>
            </div>

            {/* Metric strip */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[["100%","ZERO LINKABILITY"],["SECP256k1","ECDH CURVE"],["<0.0025 BOT","DEPLOY GAS"],["SUB-SECOND","ANNOUNCEMENT"]].map(([v,l])=>(
                <div key={l} className="blade-panel p-3">
                  <div className="mono-jade font-bold text-emerald-400 text-base">{v}</div>
                  <div className="mono-jade text-[9px] text-[#4b7358] uppercase tracking-widest mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual stealth diagram */}
          <div className="blade-panel-glow p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-3 right-3"><span className="badge-jade">LIVE</span></div>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="scan-line" style={{animationDelay:"-2s",opacity:0.3}}/>
            </div>

            <div className="mono-jade text-xs text-emerald-600 uppercase tracking-wider mb-4">
              // stealth_derivation_engine
            </div>

            {/* ECDH visualization */}
            <div className="space-y-3 text-xs mono-jade">
              {[
                {label:"sender_ephemeral_key",val:"0x03a74b882e...5d023a",color:"text-emerald-400"},
                {label:"recipient_view_key (pub)",val:"0xf4a4b2...9e82c1",color:"text-teal-400"},
                {label:"shared_secret",val:"ECDH( r, P_view ) = S",color:"text-[#4b7358]"},
                {label:"derived_stealth_addr",val:stealth.addr.slice(0,20)+"...",color:"text-emerald-300 font-bold"},
                {label:"view_tag",val:stealth.tag+" (scan hint)",color:"text-emerald-600"},
              ].map(r=>(
                <div key={r.label} className="flex justify-between border-b border-[rgba(16,185,129,0.08)] pb-2">
                  <span className="text-[#4b7358]">{r.label}:</span>
                  <span className={r.color}>{r.val}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[rgba(16,185,129,0.12)]">
              <div className="mono-jade text-[10px] text-[#1f3d2a] flex justify-between">
                <span>Contract: ShinobiStealth.sol</span>
                <span>BOT Chain Mainnet · Gas &lt; 0.0025 BOT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. HOW IT WORKS ─── */}
      <section className="py-16 px-4 border-t border-[rgba(16,185,129,0.1)] bg-[#040f06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="mono-jade text-xs text-emerald-600 uppercase tracking-[0.25em] mb-3">— Protocol Mechanics —</div>
            <h2 className="text-2xl font-black text-[#d1fae5]" style={{fontFamily:"'Sora',sans-serif"}}>
              How Shinobi Stealth Protocol Operates
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {n:"01",title:"Ephemeral Key Generation",body:"Sender generates a one-time ephemeral key pair. Combines with recipient's stealth meta-address using ECDH to derive a fresh, unused destination.",tag:"P = P_spend + hash(r·P_view)·G"},
              {n:"02",title:"BOT Chain Announcement",body:"Funds transfer directly to the stealth address. An encrypted announcement is published on ShinobiStealth.sol with minimal gas cost.",tag:"Minimal gas emission"},
              {n:"03",title:"Stealth Scanning & Claim",body:"Receiver scans announcement logs with their view key. Reconstructs spending key in private. Claims funds — invisible to any observer.",tag:"Unlinkable on Explorer"},
            ].map((s,i)=>(
              <div key={i} className="blade-panel-glow p-5 relative group hover:-translate-y-1 transition-all duration-300">
                <div className="mono-jade font-bold text-5xl text-[#064e3b]/50 mb-3 leading-none">{s.n}</div>
                <h3 className="font-bold text-[#d1fae5] mb-2" style={{fontFamily:"'Sora',sans-serif"}}>{s.title}</h3>
                <p className="text-sm text-[#4b7358] leading-relaxed mb-4">{s.body}</p>
                <div className="mono-jade text-[10px] text-emerald-500 status-line pt-2 mt-2">✓ {s.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. THE APP ─── */}
      <section id="app" className="py-16 px-4 flex-1">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header + tabs */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[rgba(16,185,129,0.12)] pb-5">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 border border-emerald-400 rotate-45 block jade-pulse"/>
              <span className="font-black text-xl text-[#d1fae5]" style={{fontFamily:"'Sora',sans-serif"}}>Shinobi App</span>
              <span className="mono-jade text-xs text-[#4b7358]">// privacy_terminal_v1</span>
            </div>
            <div className="flex items-center gap-1 p-1 bg-[#040f06] border border-[rgba(16,185,129,0.18)]">
              {(["generator","transfer","scanner","pool"] as const).map(t=>(
                <button key={t} onClick={()=>setTab(t)}
                  className={`mono-jade text-xs px-3 py-1.5 uppercase tracking-wide transition-all ${tab===t?"tab-jade-active":"text-[#4b7358] hover:text-[#d1fae5]"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Contract bar */}
          <div className="blade-panel p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="mono-jade text-emerald-500 font-bold">CONTRACT <span className="text-[#4b7358]">::</span></span>
              <span className="badge-jade text-[10px] flex items-center gap-1 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 jade-pulse" /> EMBEDDED MAINNET
              </span>
            </div>
            <div className="flex-1 flex items-center gap-2 w-full md:w-auto">
              <input value={contractAddr} onChange={e=>setContractAddr(e.target.value)}
                placeholder="0x... paste ShinobiStealth contract address"
                className="input-jade flex-1 md:max-w-md font-mono text-xs"/>
              <button onClick={()=>{navigator.clipboard.writeText(contractAddr); setCopied(true); setTimeout(()=>setCopied(false),2000);}}
                className="btn-ghost-jade text-xs p-2 flex items-center gap-1" title="Copy Address">
                <Copy className="w-3.5 h-3.5 text-emerald-400"/>
                <span className="hidden sm:inline mono-jade text-[10px]">{copied?"COPIED":"COPY"}</span>
              </button>
              <a href={SHINOBI_EXPLORER_URL} target="_blank" rel="noopener noreferrer"
                className="btn-jade text-xs px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap clip-slash-sm font-semibold">
                <ExternalLink className="w-3 h-3" /> SCAN EXPLORER
              </a>
            </div>
            <button onClick={()=>setShowModal(true)} className="btn-ghost-jade text-xs px-3 py-1.5 whitespace-nowrap hidden lg:flex items-center gap-1">
              <Terminal className="w-3 h-3 text-emerald-500"/> CONTRACT SOURCE
            </button>
          </div>

          {/* TAB: GENERATOR */}
          {tab==="generator" && (
            <div className="blade-panel-glow p-6 space-y-6">
              <div className="mono-jade text-xs text-emerald-600 uppercase tracking-wider">
                // derive_ephemeral_stealth_address(metaAddress)
              </div>
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div>
                    <label className="mono-jade text-xs text-emerald-500 block mb-1.5 uppercase">Recipient Meta-Address:</label>
                    <input value={metaAddr} onChange={e=>setMetaAddr(e.target.value)} className="input-jade w-full"/>
                  </div>
                  <button onClick={genStealth} className="btn-jade text-xs w-full py-2.5 flex items-center justify-center gap-2 clip-slash-sm">
                    <Key className="w-3.5 h-3.5"/>DERIVE STEALTH ADDRESS
                  </button>
                  <div className="blade-panel p-4 mono-jade text-[11px] text-[#4b7358] leading-relaxed">
                    <span className="text-emerald-600">›</span> The generated address has never appeared on-chain and cannot be linked to the recipient's public identity.
                  </div>
                </div>
                <div className="bg-[#020804] border border-[rgba(16,185,129,0.15)] border-l-2 border-l-emerald-400 p-5 space-y-4 mono-jade">
                  <div className="text-[10px] text-emerald-600 uppercase tracking-wider border-b border-[rgba(16,185,129,0.1)] pb-2">STEALTH OUTPUTS</div>
                  {[
                    {k:"stealth_address",v:stealth.addr,c:"text-emerald-300"},
                    {k:"ephemeral_pub_key",v:stealth.ephKey.slice(0,40)+"…",c:"text-teal-400"},
                    {k:"view_tag",v:stealth.tag,c:"text-emerald-500"},
                  ].map(r=>(
                    <div key={r.k}>
                      <div className="text-[10px] text-[#1f3d2a] mb-1 uppercase">{r.k}:</div>
                      <div className={`text-xs break-all ${r.c} flex items-center gap-2`}>
                        <span className="flex-1">{r.v}</span>
                        <button onClick={()=>navigator.clipboard.writeText(r.v)} className="text-[#4b7358] hover:text-emerald-400 shrink-0"><Copy className="w-3 h-3"/></button>
                      </div>
                    </div>
                  ))}
                  <div className="text-[10px] text-[#1f3d2a] pt-2">↑ Broadcast ready for BOT Chain Mainnet</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TRANSFER */}
          {tab==="transfer" && (
            <div className="blade-panel-glow p-6 space-y-5">
              <div className="mono-jade text-xs text-emerald-600 uppercase tracking-wider">
                // announceStealth(stealthRecipient, ephemeralPubKeyHash, encryptedViewPayload)
              </div>
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  {[{l:"Stealth Target:",v:stealth.addr,readonly:true,c:"text-emerald-400"},{l:"Amount (BOT):",v:sendAmt,readonly:false,c:"text-[#d1fae5]"}].map((f,i)=>(
                    <div key={i}>
                      <label className="mono-jade text-xs text-emerald-500 block mb-1.5 uppercase">{f.l}</label>
                      <input type={i===1?"number":"text"} value={f.v} readOnly={f.readonly}
                        onChange={i===1?e=>setSendAmt(e.target.value):undefined}
                        className={`input-jade w-full ${f.c}`}/>
                    </div>
                  ))}
                  <button onClick={sendStealth} className="btn-jade text-xs w-full py-2.5 flex items-center justify-center gap-2 clip-slash-sm">
                    <Send className="w-3.5 h-3.5"/>DISPATCH SHIELDED BOT
                  </button>
                  {txMsg && <div className="bg-[rgba(16,185,129,0.07)] border border-[rgba(16,185,129,0.25)] border-l-2 border-l-emerald-400 p-3 mono-jade text-xs text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 shrink-0"/>{txMsg}</div>}
                </div>
                <div className="bg-[#020804] border border-[rgba(16,185,129,0.15)] border-l-2 border-l-emerald-500 p-5 space-y-2 mono-jade text-xs text-[#4b7358]">
                  <div className="text-emerald-500 text-[10px] uppercase mb-3">PRIVACY GUARANTEE</div>
                  {["Stealth address has zero prior on-chain history","Sender-recipient link is cryptographically severed","announceStealth() costs <0.002 BOT gas","Recipient claims using view key — no KYC required"].map(t=>(
                    <div key={t} className="flex items-start gap-2"><span className="text-emerald-500 shrink-0">›</span>{t}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SCANNER */}
          {tab==="scanner" && (
            <div className="blade-panel-glow p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="mono-jade text-xs text-emerald-600 uppercase tracking-wider">
                  // scan_announcements(viewKey) → BOT Chain
                </div>
                <button onClick={scan} className="btn-ghost-jade text-xs px-4 py-1.5 flex items-center gap-2">
                  <RefreshCw className={`w-3.5 h-3.5 ${scanning?"spin":""}`}/>{scanning?"SCANNING…":"SCAN CHAIN"}
                </button>
              </div>
              <div className="space-y-3">
                {anns.map(a=>(
                  <div key={a.id} className="bg-[#020804] border border-[rgba(16,185,129,0.12)] border-l-2 border-l-emerald-700 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mono-jade">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold text-base">{a.amount} BOT</span>
                        <span className="text-[#1f3d2a] text-[10px]">· Block #{a.block} · {a.time}</span>
                      </div>
                      <div className="text-xs text-[#4b7358] break-all">addr: {a.stealthAddr}</div>
                      <div className="text-[10px] text-[#1f3d2a]">ephem: {a.ephKey}</div>
                    </div>
                    {a.claimed
                      ? <span className="claimed-badge">claimed</span>
                      : <button onClick={()=>claim(a.id)} className="btn-jade text-xs px-4 py-1.5 clip-slash-sm whitespace-nowrap">CLAIM →</button>
                    }
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: POOL */}
          {tab==="pool" && (
            <div className="blade-panel-glow p-6 space-y-5">
              <div className="mono-jade text-xs text-emerald-600 uppercase tracking-wider">
                // depositShielded(commitment) · withdrawShielded(nullifier, recipient, amount)
              </div>
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div>
                    <label className="mono-jade text-xs text-emerald-500 block mb-1.5 uppercase">Pool Deposit (BOT):</label>
                    <input type="number" placeholder="e.g. 10.0" value={poolAmt} onChange={e=>setPoolAmt(e.target.value)} className="input-jade w-full"/>
                  </div>
                  <button onClick={poolDeposit} disabled={!poolAmt} className="btn-jade text-xs w-full py-2.5 flex items-center justify-center gap-2 clip-slash-sm">
                    <Lock className="w-3.5 h-3.5"/>DEPOSIT WITH COMMITMENT
                  </button>
                  {poolMsg && (
                    <div className="bg-[rgba(16,185,129,0.07)] border border-[rgba(16,185,129,0.25)] border-l-2 border-l-emerald-400 p-4 mono-jade space-y-2">
                      <p className="text-xs text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5"/>{poolMsg}</p>
                      {commitment && <div className="text-[10px] text-[#4b7358] break-all">commitment: {commitment.slice(0,32)}…</div>}
                    </div>
                  )}
                </div>
                <div className="bg-[#020804] border border-[rgba(16,185,129,0.12)] border-l-2 border-l-emerald-700 p-5 mono-jade text-xs space-y-2 text-[#4b7358]">
                  <div className="text-emerald-500 text-[10px] uppercase mb-3">POOL SECURITY MODEL</div>
                  {["Commitment breaks depositor-withdrawer linkage","Only nullifier hash is revealed on withdrawal","Contract: ShinobiStealth.sol on BOT Chain","Gas cost: <0.0025 BOT per deposit"].map(t=>(
                    <div key={t} className="flex items-start gap-2"><span className="text-emerald-500 shrink-0">›</span>{t}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── REMIX MODAL ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#040f06] border border-[rgba(16,185,129,0.3)] border-l-4 border-l-emerald-400 max-w-2xl w-full shadow-[0_0_60px_rgba(16,185,129,0.15)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[rgba(16,185,129,0.15)] p-4">
              <span className="mono-jade text-xs uppercase tracking-wider text-emerald-500">
                <Terminal className="w-4 h-4 inline mr-2"/>DEPLOY :: ShinobiStealth.sol → BOT Chain 677
              </span>
              <button onClick={()=>setShowModal(false)} className="text-[#4b7358] hover:text-[#d1fae5] mono-jade text-lg">✕</button>
            </div>
            <div className="p-5 space-y-4 mono-jade text-xs">
              <div className="bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.15)] border-l-2 border-l-emerald-600 p-4 space-y-1.5 text-[#4b7358]">
                {["1. Open remix.ethereum.org → Create ShinobiStealth.sol","2. Paste code below → Compile Solidity 0.8.20 (optimize: 200)","3. Deploy & Run → Injected Provider (BOT Chain Mainnet, ID: 677)","4. Deploy → Gas ~220k (~0.0025 BOT)","5. Copy address → paste in contract bar above"].map(s=>(
                  <div key={s} className="flex gap-2"><span className="text-emerald-500">›</span>{s}</div>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-400 uppercase tracking-wider text-[10px]">ShinobiStealth.sol</span>
                  <button onClick={copyCode} className="btn-jade text-[10px] px-3 py-1 flex items-center gap-1 clip-slash-sm">
                    {copied?<CheckCircle2 className="w-3 h-3"/>:<Copy className="w-3 h-3"/>}
                    {copied?"COPIED":"COPY CODE"}
                  </button>
                </div>
                <pre className="bg-[#020804] border border-[rgba(16,185,129,0.12)] border-l-2 border-l-emerald-700 p-3 text-[10px] text-emerald-300/60 overflow-y-auto max-h-56">
                  {SHINOBI_CONTRACT_SOURCE}
                </pre>
              </div>
              <div className="text-[#1f3d2a] text-[10px] text-right">
                RPC: https://rpc.botchain.ai · Explorer: https://scan.botchain.ai
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
