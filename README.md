# PrivPass – Privacy-Preserving Eligibility & Credential Verification

PrivPass is a privacy-preserving credential and eligibility verification DApp built natively on the **Midnight blockchain**. It solves a fundamental real-world privacy problem: people are routinely required to share sensitive personal and financial information — income, age, credit score, employment status — simply to prove eligibility for a service.

PrivPass changes this paradigm. Users receive cryptographically signed credentials from trusted issuers (banks, employers, government authorities) and prove specific eligibility conditions **without revealing the underlying sensitive information**. Zero-Knowledge Proofs allow statements like:
- *"My income is above ₹5 lakh"*
- *"My credit score is above 700"*
- *"I am above 18 years old"*

…to be verified by any party **without ever disclosing the exact value**.

---

## Project Vision

PrivPass envisions a world where privacy is the default in financial and identity services. Today, applying for a loan requires exposing your full income, credit history, and identity documents to multiple parties who may store, share, or misuse this data. PrivPass eliminates this exposure entirely.

By building on the **Midnight Network** — a zero-knowledge, data-protection blockchain — PrivPass makes selective disclosure a first-class citizen. Midnight's native ZK capabilities, private state model, and Compact smart contract language make it uniquely suited for this use case: the contract verifies proofs and records only pass/fail results; sensitive data never appears in any on-chain transaction, event log, or indexer query.

The goal is a **reusable privacy-preserving verification layer** for financial services, employment, education, insurance, rental, and any context where eligibility must be proven without unnecessary exposure.

---

## Smart Contract Deployment

- **Network:** Preview (Midnight Preview Network)
- **Deployed contract ID:** `[PENDING — run: npm run deploy -- --network preview]`

> **To deploy:**
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

*Built for the INTO the Midnight — SPPU Bootcamp (Rise In), 2026.*
