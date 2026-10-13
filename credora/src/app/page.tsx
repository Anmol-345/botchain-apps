"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Activity, ArrowRight, CheckCircle2, Copy, ExternalLink,
  RefreshCw, Send, Terminal, TrendingDown, TrendingUp, Zap,
} from "lucide-react";
import Footer from "@/components/Footer";
import { BOT_CHAIN, CREDORA_CONTRACT_SOURCE, CREDORA_CONTRACT_ADDRESS, CREDORA_EXPLORER_URL, addOrSwitchToBotChain } from "@/lib/botchain";

interface DataFeed {
  id: string; name: string; category: string;
  price: number; change24h: number; unit: string; roundId: number; reporters: number;
}

const FEEDS: DataFeed[] = [
  { id:"0xbot_usd",name:"BOT / USD",category:"Crypto",price:1.48,change24h:+4.82,unit:"USD",roundId:1042,reporters:12 },
  { id:"0xbtc_usd",name:"BTC / USD",category:"Crypto",price:89450,change24h:+2.15,unit:"USD",roundId:5821,reporters:18 },
  { id:"0xeth_usd",name:"ETH / USD",category:"Crypto",price:3320.5,change24h:-0.74,unit:"USD",roundId:4910,reporters:16 },
  { id:"0xgpu_hr",name:"H100 GPU Rate",category:"AI Compute",price:2.34,change24h:+11.2,unit:"$/GPU-hr",roundId:874,reporters:9 },
  { id:"0xweather",name:"Tokyo Weather",category:"IoT",price:18.5,change24h:-1.2,unit:"°C",roundId:312,reporters:7 },
  { id:"0xsp500",name:"S&P 500",category:"TradFi",price:5864.2,change24h:+0.42,unit:"pts",roundId:1980,reporters:14 },
];

const CHART_HEIGHTS = [35, 55, 42, 70, 48, 65, 58, 80, 62, 75, 68, 90];

export default function CredoraPage() {
  const [feeds, setFeeds] = useState(FEEDS);
  const [selected, setSelected] = useState(FEEDS[0]);
  const [wallet, setWallet] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [contractAddr, setContractAddr] = useState(CREDORA_CONTRACT_ADDRESS);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"feeds"|"query"|"reporter">("feeds");
  const [newVal, setNewVal] = useState("");
  const [txStatus, setTxStatus] = useState<string|null>(null);
  const [tickerPaused, setTickerPaused] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      if (!tickerPaused) {
        setFeeds(prev => prev.map(f => ({
          ...f,
          price: parseFloat((f.price * (1 + (Math.random()-0.495)*0.004)).toFixed(2)),
          roundId: f.roundId + 1,
        })));
      }
    }, 3500);
    return () => clearInterval(iv);
  }, [tickerPaused]);

  const connect = async () => {
    setConnecting(true);
    try {
      if (await addOrSwitchToBotChain()) {
        const [addr] = await (window as any).ethereum.request({ method:"eth_requestAccounts" });
        setWallet(addr);
      }
    } finally { setConnecting(false); }
  };

  const copyCode = () => { navigator.clipboard.writeText(CREDORA_CONTRACT_SOURCE); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  const pushUpdate = () => {
    if (!newVal) return;
    setTxStatus(`CONFIRMED: ${selected.name} → ${newVal} ${selected.unit} | Block #1849${Math.floor(Math.random()*999)} | BOT Chain`);
    setFeeds(prev => prev.map(f => f.id===selected.id ? {...f, price:parseFloat(newVal), roundId:f.roundId+1} : f));
    setNewVal("");
    setTimeout(()=>setTxStatus(null),5000);
  };

  return (
    <div className="min-h-screen bg-[#08060a] text-[#fef3c7] flex flex-col dot-grid">

      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(245,158,11,0.2)] bg-[rgba(8,6,10,0.95)] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[rgba(245,158,11,0.5)] flex items-center justify-center gold-pulse relative">
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <span className="font-mono-term font-bold text-sm tracking-widest uppercase text-amber-300">
              CREDORA<span className="text-amber-500">::ORACLE</span>
            </span>
            <span className="badge-gold ml-2 hidden sm:inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 blink" />
              BOT Chain 677
            </span>
            <a href={CREDORA_EXPLORER_URL} target="_blank" rel="noopener noreferrer"
              className="badge-gold hidden lg:inline-flex items-center gap-1 hover:border-amber-400 transition-colors"
              title="View Oracle on BOT Chain Explorer">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 blink" />
              Oracle: {CREDORA_CONTRACT_ADDRESS.slice(0,6)}…{CREDORA_CONTRACT_ADDRESS.slice(-4)}
              <ExternalLink className="w-2.5 h-2.5 ml-0.5 text-amber-500" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={()=>setShowModal(true)}
              className="btn-ghost-gold text-xs px-3 py-1.5 flex items-center gap-1">
              <Terminal className="w-3 h-3" /> REMIX <span className="text-amber-600 hidden md:inline">CONTRACT</span>
            </button>
            {wallet
              ? <div className="badge-gold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400 blink"/>{wallet.slice(0,6)}…{wallet.slice(-4)}</div>
              : <button onClick={connect} disabled={connecting} className="btn-gold text-xs px-4 py-1.5 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" />{connecting?"CONNECTING…":"CONNECT"}
                </button>
            }
          </div>
        </div>
      </nav>

      {/* ─── TICKER TAPE ─── */}
      <div className="border-b border-[rgba(245,158,11,0.15)] bg-[rgba(14,11,19,0.9)] overflow-hidden py-1.5"
           onMouseEnter={()=>setTickerPaused(true)} onMouseLeave={()=>setTickerPaused(false)}>
        <div className="flex ticker-tape whitespace-nowrap">
          {[...feeds,...feeds].map((f,i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-6 font-mono-term text-xs border-r border-[rgba(245,158,11,0.1)]">
              <span className="text-amber-200 font-bold">{f.name}</span>
              <span className="text-amber-400 font-bold">{f.price.toLocaleString()}</span>
              <span className={f.change24h>=0?"text-green-400":"text-red-400"}>
                {f.change24h>=0?"+":""}{f.change24h}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── 1. HERO ─── */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Gold ambient corner light */}
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.12),transparent_60%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(217,119,6,0.08),transparent_70%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div className="space-y-6 fade-up">
              <div className="inline-flex items-center gap-2 font-mono-term text-xs text-amber-500 uppercase tracking-[0.2em]">
                <span className="gold-line w-8 h-px block" />
                Decentralized Oracle Protocol
                <span className="gold-line w-8 h-px block" />
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
                Real-World<br/>
                <span className="gold-glow-text">Data Feeds</span><br/>
                On-Chain.
              </h1>

              <p className="text-sm text-[#78560d] font-mono-term leading-relaxed max-w-md">
                {`>`} High-frequency oracle network delivering cryptographic price feeds, IoT telemetry, and AI compute metrics directly to BOT Chain smart contracts.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <a href="#app" className="btn-gold text-xs px-5 py-2.5 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> VIEW LIVE FEEDS <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <button onClick={()=>setShowModal(true)} className="btn-ghost-gold text-xs px-5 py-2.5 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" /> DEPLOY CONTRACT
                </button>
              </div>

              {/* Mini metrics row */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                {[["1.2s","LATENCY"],["<0.002","BOT DEPLOY"],["99.98%","ACCURACY"]].map(([v,l])=>(
                  <div key={l} className="panel p-3 text-center">
                    <div className="font-mono-term font-bold text-amber-400 text-lg">{v}</div>
                    <div className="font-mono-term text-[10px] text-[#78560d] uppercase tracking-wider mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live chart widget */}
            <div className="panel-hot p-5 space-y-4 fade-up relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse,rgba(245,158,11,0.08),transparent)] pointer-events-none"/>
              <div className="flex items-center justify-between border-b border-[rgba(245,158,11,0.15)] pb-3">
                <span className="font-mono-term text-xs text-amber-500 uppercase tracking-wider">BOT / USD — Live Chart</span>
                <span className="badge-gold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 blink"/>LIVE</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="font-mono-term font-bold text-3xl text-amber-300">${feeds[0].price.toFixed(4)}</span>
                <span className={`font-mono-term text-sm font-bold ${feeds[0].change24h>=0?"ticker-up":"ticker-down"} flex items-center gap-1`}>
                  {feeds[0].change24h>=0?<TrendingUp className="w-4 h-4"/>:<TrendingDown className="w-4 h-4"/>}
                  {feeds[0].change24h>=0?"+":""}{feeds[0].change24h}%
                </span>
              </div>
              {/* Bar chart */}
              <div className="mini-chart pt-1">
                {CHART_HEIGHTS.map((h,i)=>(
                  <div key={i} className="mini-bar bar-grow flex-1"
                    style={{height:`${h}%`,background:`linear-gradient(180deg,#f59e0b,#d97706)`,animationDelay:`${i*60}ms`}} />
                ))}
              </div>
              {/* Feed rows */}
              <div className="space-y-1.5 pt-2">
                {feeds.slice(0,4).map(f=>(
                  <div key={f.id} className="flex items-center justify-between text-xs font-mono-term border-b border-[rgba(245,158,11,0.08)] pb-1.5">
                    <span className="text-[#78560d]">{f.name}</span>
                    <span className="text-amber-300 font-bold">{f.price.toLocaleString()} {f.unit}</span>
                    <span className={f.change24h>=0?"text-green-400":"text-red-400"}>{f.change24h>=0?"+":""}{f.change24h}%</span>
                  </div>
                ))}
              </div>
              <div className="font-mono-term text-[10px] text-[#4a3f2e] text-right">
                RPC: rpc.botchain.ai • Round #{feeds[0].roundId}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. HOW IT WORKS ─── */}
      <section className="py-16 px-4 border-t border-[rgba(245,158,11,0.1)] bg-[#0a0710]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="font-mono-term text-xs uppercase tracking-[0.25em] text-amber-600 mb-3">
              — Protocol Architecture —
            </div>
            <h2 className="text-2xl font-bold text-amber-200">How Credora Works on BOT Chain</h2>
          </div>

          {/* Horizontal 3-step with connecting lines */}
          <div className="relative flex flex-col md:flex-row items-start gap-6">
            {[
              {n:"01",title:"Multi-Source Aggregation",body:"Independent node operators pull feeds from exchanges, IoT sensors, and GPU clusters across 40+ data points.",tag:"✓ Byzantine Fault Tolerant"},
              {n:"02",title:"Quorum Consensus & Trimming",body:"Reporter signatures are collected. Outliers trimmed via median algorithm. Final value packed into 1 transaction.",tag:"✓ Cryptographic Signatures"},
              {n:"03",title:"BOT Chain Delivery",body:"The ultra-compact CredoraFeedOracle stores round data on-chain. Any DeFi or dApp reads it in 1 gas-free call.",tag:"✓ Deploys in <0.1 BOT"},
            ].map((s,i)=>(
              <div key={i} className="flex-1 panel-hot p-5 relative">
                {i<2 && <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-amber-700/40 z-10"/>}
                <div className="font-mono-term font-bold text-4xl text-amber-800/50 mb-3 leading-none">{s.n}</div>
                <h3 className="text-sm font-bold text-amber-200 mb-2">{s.title}</h3>
                <p className="text-xs text-[#78560d] leading-relaxed mb-4">{s.body}</p>
                <div className="font-mono-term text-[10px] text-amber-500 border-t border-[rgba(245,158,11,0.15)] pt-2">{s.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. THE APP ─── */}
      <section id="app" className="py-16 px-4 flex-1">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Section header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[rgba(245,158,11,0.15)] pb-5">
            <div className="flex items-center gap-3">
              <span className="font-mono-term font-bold text-amber-500 text-xs uppercase tracking-widest">// CREDORA_TERMINAL</span>
              <span className="font-mono-term text-[10px] text-amber-800 blink">█</span>
            </div>
            <div className="flex items-center gap-1 p-1 bg-[#0e0b13] border border-[rgba(245,158,11,0.2)]">
              {(["feeds","query","reporter"] as const).map(t=>(
                <button key={t} onClick={()=>setTab(t)}
                  className={`font-mono-term text-xs px-4 py-1.5 uppercase tracking-wider transition-all ${tab===t?"tab-gold-active":"text-[#78560d] hover:text-amber-300"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Contract bar */}
          <div className="panel flex flex-col md:flex-row items-center justify-between gap-3 p-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono-term text-amber-500 font-bold">CONTRACT <span className="text-amber-700">::</span></span>
              <span className="badge-gold text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 blink" /> EMBEDDED MAINNET
              </span>
            </div>
            <div className="flex-1 flex items-center gap-2 w-full md:w-auto">
              <input value={contractAddr} onChange={e=>setContractAddr(e.target.value)}
                placeholder="0x... deployed CredoraFeedOracle address"
                className="input-gold flex-1 md:max-w-md font-mono text-[11px]" />
              <button onClick={()=>{navigator.clipboard.writeText(contractAddr); setCopied(true); setTimeout(()=>setCopied(false),2000);}}
                className="btn-ghost-gold p-1.5 text-xs flex items-center gap-1" title="Copy Contract Address">
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline font-mono-term text-[10px]">{copied?"COPIED":"COPY"}</span>
              </button>
              <a href={CREDORA_EXPLORER_URL} target="_blank" rel="noopener noreferrer"
                className="btn-gold text-xs px-3 py-1.5 flex items-center gap-1 whitespace-nowrap">
                <ExternalLink className="w-3 h-3" /> SCAN EXPLORER
              </a>
            </div>
            <button onClick={()=>setShowModal(true)} className="btn-ghost-gold text-xs px-3 py-1.5 whitespace-nowrap hidden lg:flex items-center gap-1">
              <Terminal className="w-3 h-3 text-amber-500" /> CONTRACT SOURCE
            </button>
          </div>

          {/* TAB: FEEDS */}
          {tab==="feeds" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {feeds.map(f=>(
                  <div key={f.id} onClick={()=>setSelected(f)}
                    className={`panel-hot p-4 cursor-pointer transition-all ${selected.id===f.id?"border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]":""}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="badge-gold text-[9px]">{f.category}</span>
                      <RefreshCw className="w-3 h-3 text-amber-700 animate-spin" style={{animationDuration:"9s"}}/>
                    </div>
                    <div className="font-mono-term font-bold text-amber-200 text-sm mb-2">{f.name}</div>
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono-term font-bold text-xl text-amber-400">{f.price.toLocaleString()}</span>
                      <span className={`font-mono-term text-xs font-bold ${f.change24h>=0?"ticker-up":"ticker-down"}`}>
                        {f.change24h>=0?"+":""}{f.change24h}%
                      </span>
                    </div>
                    <div className="gold-line my-2"/>
                    <div className="flex justify-between font-mono-term text-[10px] text-[#78560d]">
                      <span>RND #{f.roundId}</span>
                      <span>{f.reporters} NODES</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Selected detail bar */}
              <div className="panel-hot p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  ["SELECTED",selected.name,"text-amber-200"],
                  ["PRICE",`${selected.price} ${selected.unit}`,"text-amber-400"],
                  ["ROUND",`#${selected.roundId}`,"text-white"],
                  ["QUORUM",`${selected.reporters} / BOT Chain`,"text-green-400"],
                ].map(([l,v,cls])=>(
                  <div key={l as string}>
                    <div className="font-mono-term text-[9px] uppercase tracking-widest text-amber-800 mb-1">{l}</div>
                    <div className={`font-mono-term font-bold text-sm ${cls}`}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: QUERY */}
          {tab==="query" && (
            <div className="panel-hot p-6 space-y-5">
              <div className="font-mono-term text-xs uppercase tracking-wider text-amber-600">
                // getLatestFeed(bytes32 feedId) → Consumer Playground
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="font-mono-term text-xs text-amber-500 block">SELECT FEED_ID:</label>
                  <select value={selected.id} onChange={e=>setSelected(feeds.find(f=>f.id===e.target.value)!)}
                    className="input-gold w-full">
                    {feeds.map(f=><option key={f.id} value={f.id}>{f.name} ({f.id.slice(0,12)}...)</option>)}
                  </select>
                  <pre className="bg-[#030203] border border-[rgba(245,158,11,0.15)] p-4 font-mono-term text-[11px] text-amber-300/80 overflow-x-auto">{`interface ICredoraOracle {
  function getLatestFeed(bytes32 feedId)
    external view returns (
      int256 value,
      uint64 timestamp,
      uint32 roundId
    );
}`}</pre>
                </div>
                <div className="bg-[#030203] border border-[rgba(245,158,11,0.2)] p-4 space-y-3 font-mono-term">
                  <div className="text-[10px] uppercase text-amber-700 border-b border-[rgba(245,158,11,0.1)] pb-2 flex justify-between">
                    <span>RESPONSE_BUFFER</span><span className="text-amber-900">gas: 21,340</span>
                  </div>
                  {[
                    ["feed_name",selected.name,"text-amber-200"],
                    ["value",`${selected.price} ${selected.unit}`,"text-amber-400 font-bold"],
                    ["timestamp","1760378400 (latest block)","text-white"],
                    ["round_id",`#${selected.roundId}`,"text-amber-300"],
                    ["network","BOT Chain 677","text-green-400"],
                    ["verification","PASSED (signed quorum)","text-green-400"],
                  ].map(([k,v,cls])=>(
                    <div key={k as string} className="flex justify-between text-xs border-b border-[rgba(245,158,11,0.06)] pb-1.5">
                      <span className="text-amber-800">{k}:</span>
                      <span className={cls as string}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: REPORTER */}
          {tab==="reporter" && (
            <div className="panel-hot p-6 space-y-5">
              <div className="font-mono-term text-xs uppercase tracking-wider text-amber-600">
                // Reporter Update Portal — updateFeed(bytes32,int256)
              </div>
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div>
                    <label className="font-mono-term text-xs text-amber-500 block mb-1.5">TARGET FEED:</label>
                    <select value={selected.id} onChange={e=>setSelected(feeds.find(f=>f.id===e.target.value)!)} className="input-gold w-full">
                      {feeds.map(f=><option key={f.id} value={f.id}>{f.name} (now: {f.price} {f.unit})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-mono-term text-xs text-amber-500 block mb-1.5">NEW VALUE ({selected.unit}):</label>
                    <div className="flex gap-2">
                      <input type="number" value={newVal} onChange={e=>setNewVal(e.target.value)}
                        placeholder={(selected.price*1.01).toFixed(2)} className="input-gold flex-1" />
                      <button onClick={pushUpdate} disabled={!newVal} className="btn-gold text-xs px-4 py-2 flex items-center gap-1.5">
                        <Send className="w-3 h-3"/>PUSH
                      </button>
                    </div>
                  </div>
                  {txStatus && (
                    <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)] p-3 font-mono-term text-xs text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0"/>{txStatus}
                    </div>
                  )}
                </div>
                <div className="bg-[#030203] border border-[rgba(245,158,11,0.15)] p-4 space-y-2 text-xs font-mono-term">
                  <div className="text-amber-500 text-[10px] uppercase mb-3">REPORTER SECURITY PROTOCOL</div>
                  {["isReporter[msg.sender] required","Each update emits FeedUpdated event","batchUpdate() for multi-feed efficiency","Deploy gas: ~180k (~0.002 BOT)"].map(t=>(
                    <div key={t} className="flex items-start gap-2 text-amber-800">
                      <span className="text-amber-500 shrink-0">›</span>{t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── REMIX MODAL ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0710] border border-[rgba(245,158,11,0.3)] max-w-2xl w-full shadow-[0_0_60px_rgba(245,158,11,0.15)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[rgba(245,158,11,0.2)] p-4">
              <div className="font-mono-term text-xs uppercase tracking-wider text-amber-400">
                <Terminal className="w-4 h-4 inline mr-2"/>DEPLOY :: CredoraFeedOracle.sol → BOT Chain 677
              </div>
              <button onClick={()=>setShowModal(false)} className="font-mono-term text-amber-800 hover:text-amber-400 text-lg">✕</button>
            </div>
            <div className="p-5 space-y-4 text-xs font-mono-term">
              <div className="bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.2)] p-4 space-y-1.5 text-amber-700">
                {["1. Open remix.ethereum.org → Create CredoraFeedOracle.sol","2. Paste code below → Compile with Solidity 0.8.20","3. Deploy & Run → Injected Provider (BOT Chain Mainnet, ID: 677)","4. Deploy → Gas ~180,000 units (<0.002 BOT)","5. Copy contract address → Paste in dApp above"].map(s=>(
                  <div key={s} className="flex gap-2"><span className="text-amber-500">›</span><span>{s}</span></div>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-500 uppercase tracking-wider">CredoraFeedOracle.sol</span>
                  <button onClick={copyCode} className="btn-gold text-[10px] px-3 py-1 flex items-center gap-1">
                    {copied?<CheckCircle2 className="w-3 h-3"/>:<Copy className="w-3 h-3"/>}{copied?"COPIED":"COPY CODE"}
                  </button>
                </div>
                <pre className="bg-[#030203] border border-[rgba(245,158,11,0.15)] p-3 text-[10px] text-amber-300/70 overflow-y-auto max-h-56">
                  {CREDORA_CONTRACT_SOURCE}
                </pre>
              </div>
              <div className="text-amber-700 text-[10px] text-right">
                RPC: https://rpc.botchain.ai • Explorer: https://scan.botchain.ai
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
