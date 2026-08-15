# PrivPass – Privacy-Preserving Eligibility & Credential Verification

[![CI/CD Pipeline](https://github.com/harshaljagdale0222/midnight-level3/actions/workflows/ci.yml/badge.svg)](https://github.com/harshaljagdale0222/midnight-level3/actions/workflows/ci.yml)

> 🌙 **Level 3 — First Quarter Submission**  
> **INTO the Midnight SPPU Bootcamp (Rise In)**  
> *Production-grade dApp with tests, CI/CD, and a polished build on Midnight Preprod Network.*

---

## 🌐 Live Demo & Submission Details

- **Live DApp:** [https://midnight-level3-frontend.vercel.app](https://midnight-level3-frontend.vercel.app)
- **Demo Video (Loom):** [Watch Demo Video](https://www.loom.com/share/0fa0b88fd30740a8b6c6ab596ec5565a)
- **Preprod Contract Address:** `02008f5a91724a73e4b70db64e43e2e8e94553b9bf1335c024d0ad42398bf234`
- **Commits:** ✅ 25+ Commits (Verified via GitHub history)

---

## 🖥️ PrivPass Frontend UI Preview

![PrivPass Zero-Knowledge DApp Frontend UI](./privpass_ui_preview.png)

---

## 🔒 Observable Privacy Claim: "Proven Without Being Shown"

PrivPass implements an observable privacy behavior using Midnight's native Zero-Knowledge Proof (Groth16) architecture. When an eligibility check is performed:

### What an On-Chain Observer / Indexer Sees:
- ✅ **Boolean Verification Outcome:** `passed: true` (or `false`).
- ✅ **Holder Identifier & Purpose:** `holder: 0x...`, `purpose: INCOME`.
- ✅ **Block Timestamp:** Block height when proof was verified.

### What an On-Chain Observer / Indexer CANNOT See:
- ❌ **The actual income/age value** (e.g. ₹6,00,000 or age 24 is never sent across the network or written to the ledger).
- ❌ **The blinding salt or witness pre-image**.
- ❌ **Any raw credential payload or personal data**.

---

## 🚀 Key Features

| Feature | Privacy Model |
|---------|--------------|
| **Lace Wallet Integration** | Full DApp connector API integration (`window.midnight.mnLace`). Interactive popup modal with permissions. |
| **ZK Income Eligibility Proof** | Proves `income ≥ threshold` without revealing the exact income amount. |
| **ZK Age Eligibility Proof** | Proves `age ≥ 18` without revealing the holder's actual age. |
| **Selective Disclosure** | Holders choose which credentials to prove and for which purpose. |
| **On-chain Eligibility Records** | Only `true/false` results are stored publicly — never the raw values. |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | **Compact** (Midnight's native ZK language) |
| Blockchain | **Midnight Network** (Preprod) |
| ZK Proof System | Groth16 (via Midnight's native proof circuits) |
| Backend/Scripts | Node.js (ESM), TypeScript |
| Frontend | React 19 + Vite 5 + TypeScript 5.6 |
| Wallet Integration | Midnight DApp Connector (`window.midnight`) |
| Testing | Vitest (23 passing tests) |
| Deployment | Vercel |

---

## 💻 Local Development Setup

### Prerequisites
- Node.js ≥ 20
- npm ≥ 10
- Git

### 1. Clone & Install
```bash
git clone https://github.com/harshaljagdale0222/midnight-level3.git
cd midnight-level3
npm install
```

### 2. Smart Contract Testing
All Zero-Knowledge circuits and state transitions are thoroughly tested.
```bash
npm test
```
> Output: 23 tests passing (circuit logic, state transitions, privacy invariants)

### 3. Frontend Local Server
```bash
cd frontend
npm install
npm run dev
```
> Open `http://localhost:5173` in your browser.

---

## 📂 Project Structure

```text
midnight-level3/
├── contracts/
│   └── privpass.compact       # Compact smart contract (ZK circuits)
├── tests/
│   └── privpass.test.ts       # 23 Vitest tests ensuring ZK privacy
├── frontend/                  # React + Vite DApp Frontend
│   ├── src/
│   │   ├── hooks/useMidnight.ts        # DApp Connector hook
│   │   ├── components/                 # UI Components (Wallet, ZK Prover)
│   │   └── index.css                   # Premium CSS Design System
│   ├── package.json
│   └── tsconfig.json
├── package.json               # Root workspace
└── README.md
```

---

*Built for the INTO the Midnight — SPPU Bootcamp (Rise In), 2026.*