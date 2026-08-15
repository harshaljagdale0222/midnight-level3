# PrivPass – Privacy-Preserving Eligibility & Credential Verification

[![CI/CD Pipeline](https://github.com/harshaljagdale0222/midnight-level3/actions/workflows/ci.yml/badge.svg)](https://github.com/harshaljagdale0222/midnight-level3/actions/workflows/ci.yml)

> 🌙 **Level 3 — First Quarter Submission**  
> **INTO the Midnight SPPU Bootcamp (Rise In)**  
> *Production-grade dApp with tests, CI/CD, and a polished build on Midnight Preprod Network.*

---

## 📋 Level 3 Submission Checklist & Requirements

| Requirement | Status | Details |
|-------------|--------|---------|
| **Live Demo URL** | 🌐 **Live** | [https://midnight-level3-frontend.vercel.app](https://midnight-level3-frontend.vercel.app) |
| **Demo Video (Loom)** | 🎥 **Recorded** | [Watch Demo Video on Loom](https://www.loom.com/share/0fa0b88fd30740a8b6c6ab596ec5565a) |
| **Lace Wallet Connect / Disconnect** | ✅ Implemented | Full DApp connector API integration (`window.midnight.mnLace` & `window.midnight.lace`). Interactive popup modal with permissions and status indicator. |
| **Circuit Called from Frontend** | ✅ Implemented | Compact ZK circuits (`proveIncomeEligibility`, `proveAgeEligibility`, `proveCreditEligibility`) invoked with local private witness inputs and verified on-chain. |
| **Observable Privacy Behavior** | ✅ Documented & Proven | Private witness values (e.g. ₹6,00,000 income / age 24) stay 100% local inside browser RAM; Midnight ledger records ONLY boolean `passed: true/false` and commitment hash. |
| **Deployed Preprod Contract** | ✅ Verified | **Preprod Address:** `02008f5a91724a73e4b70db64e43e2e8e94553b9bf1335c024d0ad42398bf234` |
| **Minimum 8 Commits** | ✅ 22+ Commits | Verified via `git log` history. |
| **Public GitHub Repo & README** | ✅ Public | Complete documentation of privacy model, architecture, deployment, and testing. |

---

## 🖥️ PrivPass Frontend UI Preview

![PrivPass Zero-Knowledge DApp Frontend UI](./privpass_ui_preview.png)

## ✅ Test Execution Output (23 Passing)

![Vitest Test Run Screenshot](./test-screenshot.png)

---

## 🔒 Observable Privacy Claim: "Proven Without Being Shown"

PrivPass implements an observable privacy behavior using Midnight's native Zero-Knowledge Proof (Groth16) architecture:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LOCAL BROWSER WITNESS (PRIVATE)                      │
│                                                                             │
│   • actualIncome = 600 (₹6,00,000)                                          │
│   • privateSalt  = 0x4a8f9c... (Blinding Factor)                            │
│   • holderAddr   = 0x1234...                                                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Local Witness (Never leaves browser)
                                ┌──────▼──────┐
                                │ ZK Circuit  │  proveIncomeEligibility(witness actualIncome, ...)
                                │  (Groth16)  │  evaluates: (actualIncome >= 500)
                                └──────┬──────┘
                                       │ Proof + Disclosed Boolean
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    MIDNIGHT PREPROD LEDGER (PUBLIC STATE)                   │
│                                                                             │
│   • eligibilityResults[resultKey] = EligibilityRecord {                     │
│         holder: 0x1234...,                                                  │
│         purpose: "INCOME",                                                  │
│         passed: true,         <-- ONLY THIS BOOLEAN IS RECORDED!            │
│         checkedAt: 148293                                                   │
│     }                                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What an On-Chain Observer / Indexer Sees:
- ✅ **Boolean Verification Outcome:** `passed: true` (or `false`).
- ✅ **Holder Identifier & Purpose:** `holder: 0x...`, `purpose: INCOME`.
- ✅ **Block Timestamp:** Block height when proof was verified.

### What an On-Chain Observer / Indexer CANNOT See:
- ❌ **The actual income/age value** (₹6,00,000 or age 24 is never sent across network or written to ledger).
- ❌ **The blinding salt or witness pre-image**.
- ❌ **Any raw credential payload or personal data**.

---

## 🚀 Smart Contract Deployment

- **Network:** Midnight Preprod Testnet
- **Deployed Contract Address:** `02008f5a91724a73e4b70db64e43e2e8e94553b9bf1335c024d0ad42398bf234`
- **Indexer Endpoint:** `https://indexer.preview.midnight.network`
- **Proof Server Endpoint:** `https://proof-server.preview.midnight.network`

> **To re-deploy to Preprod / Preview:**
> 1. Install the Lace wallet + Midnight extension: https://wallet.midnight.network/
> 2. Fund your wallet: https://faucet.preview.midnight.network/
> 3. Run: `npm run compile` then `npm run deploy -- --network preview`
> 4. Paste the printed contract ID above and in `frontend/.env.local`

---

## Key Features

| Feature | Privacy Model |
|---------|--------------|
| **Cryptographically Signed Credentials** | Issuers sign credentials; the raw value is committed as a Pedersen hash on-chain. The actual value is never stored. |
| **ZK Income Eligibility Proof** | Proves `income ≥ threshold` without revealing the income amount. |
| **ZK Age Eligibility Proof** | Proves `age ≥ 18` without revealing the holder's actual age. |
| **ZK Credit Score Proof** | Proves `credit score ≥ 700` without revealing the score. |
| **Selective Disclosure** | Holders choose which credentials to prove and for which purpose. |
| **Credential Revocation** | Issuers can revoke credentials (e.g. on employment termination). |
| **Credential Expiry** | Block-based expiry ensures credentials remain fresh. |
| **On-chain Eligibility Records** | Only `true/false` results are stored publicly — never the raw values. |
| **No cross-chain dependency** | 100% native Midnight — no bridges, no Ethereum, no EVM. |

### What an on-chain observer CAN see:
- ✅ That a credential was issued (but not its value)
- ✅ The credential commitment hash (not the pre-image)
- ✅ Pass/fail eligibility results
- ✅ Whether a credential is revoked

### What an on-chain observer CANNOT see:
- ❌ Your actual income, age, or credit score
- ❌ The raw credential data
- ❌ Any personally identifiable information

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | **Compact** (Midnight's native ZK language) |
| Blockchain | **Midnight Network** (Preview / Mainnet) |
| ZK Proof System | Groth16 (via Midnight's native proof circuits) |
| Backend/Scripts | Node.js (ESM), TypeScript |
| Frontend | React 19 + Vite + TypeScript |
| Wallet Integration | Midnight DApp Connector (`window.midnight`) |
| Public State | Midnight Indexer GraphQL API |
| Testing | Vitest (23 passing tests) |
| Deployment | Vercel / Netlify (SPA) |

---

## Future Scope

- **Mainnet Deployment** — migrate from Preview to Midnight Mainnet after audit
- **Identity Credential Circuit** — ZK proof of government ID without revealing PAN/Aadhaar
- **Multi-threshold Proofs** — prove income range (not just minimum)
- **Composite Eligibility** — combine income + credit + age in a single proof
- **Issuer DAO** — decentralized issuer governance via on-chain voting
- **DID Integration** — W3C Decentralized Identifiers for credential portability
- **Mobile SDK** — React Native hooks for mobile DApps
- **Insurance & Rental** — extend proof circuits to employment status, asset value
- **GDPR-Compliant Data Processing** — privacy-preserving audit trails for enterprise

---

## Local Development

### Prerequisites

```
Node.js ≥ 20     node --version
npm ≥ 10         npm --version
git              git --version
Docker Desktop   (for local devnet — optional)
compact CLI      (for contract compilation)
```

> **Windows users:** All commands below run in PowerShell. If you encounter issues with Docker, use WSL (Ubuntu) as recommended.

### Step 1 — Clone & Install

```powershell
git clone <repo-url>
cd privpass
npm install
```

### Step 2 — Setup Check

```powershell
npm run setup
```

### Step 3 — Compile the Contract

```powershell
npm run compile
# Requires: compact compiler installed
# Output: contracts/managed/
```

> If `compact` is not installed, see: https://docs.midnight.network/develop/tutorial/building/

### Step 4 — Run Tests

```powershell
npm test
# Output: 23 tests passing (circuit logic, state transitions, privacy invariants)
```

### Step 5a — Local Devnet (needs Docker Desktop running)

```powershell
# Start Docker Desktop first, then:
npm run devnet:up
npm run deploy            # Deploy to local devnet
npm run cli               # Interactive CLI
```

### Step 5b — Preview Network (recommended)

```powershell
# Set wallet seed (PowerShell — NEVER commit this)
$env:MIDNIGHT_WALLET_SEED="your 24 word mnemonic here"

# Deploy
npm run deploy -- --network preview

# Follow faucet instructions printed in the output if wallet needs funding:
# https://faucet.preview.midnight.network/
```

### Step 6 — Frontend

```powershell
# Copy and configure env vars
copy frontend\.env.example frontend\.env.local
# Edit frontend\.env.local — paste VITE_CONTRACT_ADDRESS from Step 5

# Install frontend deps and start
cd frontend
npm install
npm run dev
# Open: http://localhost:5173
```

### Step 7 — Frontend Build (production check)

```powershell
cd ..
npm run frontend:build
# Must complete with zero errors
```

### Contract Compilation (manual)

```bash
# From project root (Linux/macOS/WSL/Git Bash):
compact compile contracts/privpass.compact -o contracts/managed

# The compiled output (contracts/managed/) is gitignored.
# Re-run after any change to privpass.compact.
```

---

## Project Structure

```
privpass/
├── contracts/
│   └── privpass.compact       # Compact smart contract (ZK circuits)
├── src/
│   ├── network.mjs            # Network endpoint config
│   ├── wallet.mjs             # Wallet seed loading (secure)
│   ├── setup.mjs              # Prerequisite checker
│   ├── deploy.mjs             # Deployment script
│   └── cli.mjs                # Interactive CLI
├── tests/
│   └── privpass.test.ts       # 23 Vitest tests
├── frontend/
│   ├── src/
│   │   ├── hooks/useMidnight.ts        # DApp Connector hook
│   │   ├── components/
│   │   │   ├── WalletConnect.tsx       # Wallet UI
│   │   │   ├── EligibilityProver.tsx   # ZK proof UI (main feature)
│   │   │   ├── CredentialDashboard.tsx # Credential management
│   │   │   └── IssuerPanel.tsx         # Issuer admin panel
│   │   ├── types/midnight.ts           # TypeScript types
│   │   ├── App.tsx                     # Main app
│   │   └── index.css                   # Design system
│   ├── .env.example
│   ├── vercel.json
│   └── netlify.toml
├── compose.yml                # Local devnet Docker stack
├── package.json
├── vitest.config.ts
└── README.md
```

---

## Privacy Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRIVATE (never on-chain)                  │
│   actualIncome | actualAge | actualCreditScore | privateSalt │
└──────────────────────────┬──────────────────────────────────┘
                           │ ZK Witness (local only)
                    ┌──────▼──────┐
                    │  ZK Circuit  │  ← Midnight Compact contract
                    │  (Groth16)  │
                    └──────┬──────┘
                           │ Proof + public inputs
┌──────────────────────────▼──────────────────────────────────┐
│                    PUBLIC (on-chain, anyone can read)         │
│   valueHash (commitment) | passed: true/false | issuer addr  │
└─────────────────────────────────────────────────────────────┘
```

---

## Level 3 Product Proposal

**Selected Idea:** Confidential Credentials / Eligibility Gate (Combined)

### Problem Statement
In traditional identity and credit systems, users are forced to disclose sensitive personal data (e.g., exact income, date of birth, or precise credit score) just to prove they meet a minimum threshold. This over-sharing leads to privacy loss and increases the risk of data breaches.

### The Solution: PrivPass
PrivPass uses Midnight's ZK (Zero-Knowledge) proofs to create **Confidential Credentials** that function as an **Eligibility Gate**. 
- **Confidential Credentials:** A trusted issuer signs a credential (e.g., Income or Credit Score) and commits a cryptographic hash to the Midnight ledger. The actual value is securely stored *only* on the user's local device.
- **Eligibility Gate:** When a service (like a landlord or a lender) requires proof of eligibility (e.g., Income > $50,000), the user generates a ZK proof locally. 
- The smart contract verifies the proof against the on-chain commitment and records a simple boolean `passed: true/false`.

### What an observer CAN and CANNOT learn
- **CAN learn:** That a user participated in an eligibility check, the type of check (e.g., "INCOME"), and whether they passed or failed.
- **CANNOT learn:** The user's actual income, exact age, or exact credit score. The private values never leave the user's browser, ensuring absolute data privacy.

---

*Built for the INTO the Midnight — SPPU Bootcamp (Rise In), 2026.*