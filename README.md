# ⚡ BOT Chain Ecosystem Applications

A suite of three decentralized applications built on **BOT Chain Mainnet (Chain ID: 677)** with optimized smart contracts and distinct designs.

- **BOT Chain Official Website**: https://botchain.ai
- **BOT Chain Explorer**: https://scan.botchain.ai
- **RPC URL**: `https://rpc.botchain.ai`

---

## 📦 Projects Overview

### 1. 🟡 Credora — Decentralized Oracle Network
High-frequency oracle protocol delivering real-world price feeds, IoT sensor telemetry, and AI compute metrics directly to BOT Chain smart contracts.
- **Directory**: [`credora/`](./credora)
- **Design Theme**: Gold/Amber Bloomberg-style financial terminal with live ticker and scanlines
- **Deployed Contract**: [`0x5822d2021fd4a4C8Cb6f9761cD35D8a5e1f3Fe8f`](https://scan.botchain.ai/address/0x5822d2021fd4a4C8Cb6f9761cD35D8a5e1f3Fe8f)

### 2. 🔵 OmniWallet — Multi-Chain Asset Vault & Aggregator
Futuristic multi-chain wallet aggregator connecting balances across EVM, rollups, and non-EVM networks with automated batch transfers.
- **Directory**: [`omniwallet/`](./omniwallet)
- **Design Theme**: Electric Blue futuristic deep-space interface with celestial aurora glows
- **Deployed Contract**: [`0xF8c0062A507E345BAa1FB92cC72031eb5171E159`](https://scan.botchain.ai/address/0xF8c0062A507E345BAa1FB92cC72031eb5171E159)

### 3. 🟢 Shinobi — Privacy Stealth Transaction Protocol
Next-gen privacy protocol utilizing Diffie-Hellman ephemeral stealth address derivation and shielded nullifier pools for private value transfer on BOT Chain.
- **Directory**: [`shinobi/`](./shinobi)
- **Design Theme**: Cyber-Ninja Jade/Emerald stealth terminal with diagonal blade panels
- **Deployed Contract**: [`0x8e1EAFaC5D8086845434398fa6a177F360BC84e4`](https://scan.botchain.ai/address/0x8e1EAFaC5D8086845434398fa6a177F360BC84e4)

---

## 🚀 Getting Started

Each dApp is a standalone Next.js 16 application with embedded contract addresses. No `.env` setup required!

```bash
# Clone the repository
git clone https://github.com/Anmol-345/botchain-apps.git
cd botchain-apps

# Run Credora
cd credora
npm install
npm run dev

# Run OmniWallet
cd ../omniwallet
npm install
npm run dev

# Run Shinobi
cd ../shinobi
npm install
npm run dev
```

---

## ⛓️ Network Specifications

| Parameter | Value |
|---|---|
| **Network Name** | BOT Chain Mainnet |
| **Chain ID** | `677` (`0x2a5`) |
| **Native Currency** | BOT (18 Decimals) |
| **RPC Endpoint** | `https://rpc.botchain.ai` |
| **Block Explorer** | `https://scan.botchain.ai` |
