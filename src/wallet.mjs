// =============================================================================
// wallet.mjs – Wallet helpers for PrivPass deployment and CLI
// =============================================================================
// Handles wallet seed phrase loading, address derivation, and balance checks.
// Secrets are NEVER logged or committed.

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WALLET_STATE_FILE = join(__dirname, "..", ".midnight-wallet-state", "wallet.json");

/**
 * Load wallet seed from environment variable (preferred) or wallet state file.
 * ⚠️  Never commit the seed to git. Add .midnight-wallet-state/ to .gitignore.
 */
export function loadWalletSeed() {
  // Prefer env var (safer for CI/CD)
  if (process.env.MIDNIGHT_WALLET_SEED) {
    console.log("🔑  Loaded wallet seed from MIDNIGHT_WALLET_SEED env var");
    return process.env.MIDNIGHT_WALLET_SEED;
  }

  // Fallback: load from local wallet state file
  if (existsSync(WALLET_STATE_FILE)) {
    const state = JSON.parse(readFileSync(WALLET_STATE_FILE, "utf8"));
    if (state.seed) {
      console.log("🔑  Loaded wallet seed from .midnight-wallet-state/wallet.json");
      return state.seed;
    }
  }

  console.error(`
❌  No wallet seed found.

To deploy PrivPass, you need a Midnight wallet seed phrase.
Choose ONE of these options:

  Option A — Environment variable (recommended):
    PowerShell:  $env:MIDNIGHT_WALLET_SEED="your 24 word mnemonic here"
    Git Bash:    export MIDNIGHT_WALLET_SEED="your 24 word mnemonic here"
    Then re-run: npm run deploy -- --network preview

  Option B — Wallet state file:
    Create: .midnight-wallet-state/wallet.json
    Contents: { "seed": "your 24 word mnemonic here" }
    ⚠️  This file is gitignored — never commit it.

Get a new wallet seed from the Lace wallet (Midnight extension).
Fund the wallet at: https://faucet.preview.midnight.network/
`);
  process.exit(1);
}

/**
 * Display wallet address without revealing the seed.
 */
export function displayWalletInfo(address) {
  console.log("\n💼  Wallet Information:");
  console.log(`   Address: ${address}`);
  console.log("\n   To fund this wallet on Preview Network:");
  console.log("   → Visit: https://faucet.preview.midnight.network/");
  console.log(`   → Paste address: ${address}`);
  console.log("   → Request tDUST tokens\n");
}
