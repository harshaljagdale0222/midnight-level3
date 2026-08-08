// =============================================================================
// cli.mjs – PrivPass Command-Line Interface
// =============================================================================
// Interactive CLI for testing PrivPass contract functions locally.
//
// Usage:
//   npm run cli
//   node src/cli.mjs --network preview --action prove-income
//
// Available actions:
//   status           - Show contract state
//   add-issuer       - Register an authorised issuer
//   issue-credential - Issue a credential (income/age/credit)
//   prove-income     - Submit income eligibility proof
//   prove-age        - Submit age eligibility proof
//   prove-credit     - Submit credit score eligibility proof
//   revoke           - Revoke a credential

import { resolveNetwork } from "./network.mjs";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const args = process.argv.slice(2);
const action = args.find((a) => a.startsWith("--action="))
  ? args.find((a) => a.startsWith("--action=")).split("=")[1]
  : args[args.indexOf("--action") + 1] || "status";

const PRIVACY_NOTICE = `
╔══════════════════════════════════════════════════════╗
║  🔒  PRIVACY NOTICE                                  ║
║                                                      ║
║  Private inputs (income, age, credit score) are      ║
║  used ONLY to generate a ZK proof locally.           ║
║  They are NEVER sent to the network, stored, or      ║
║  logged. Only a boolean result (pass/fail) is        ║
║  published on-chain.                                  ║
╚══════════════════════════════════════════════════════╝
`;

async function showStatus(network) {
  console.log("\n📊  PrivPass Contract Status");
  console.log("─".repeat(40));

  // Load deployed contract address
  const statePath = join(ROOT, ".midnight-state.json");
  if (!existsSync(statePath)) {
    console.log("  ⚠️   No deployed contract found.");
    console.log("  Run: npm run deploy -- --network preview");
    return;
  }

  const state = JSON.parse(readFileSync(statePath, "utf8"));
  const networkState = state[network.networkId];

  if (!networkState) {
    console.log(`  ⚠️   No deployment found for network: ${network.name}`);
    return;
  }

  console.log(`  Contract ID:   ${networkState.contractAddress}`);
  console.log(`  Network:       ${network.name}`);
  console.log(`  Deployed at:   ${networkState.deployedAt}`);
  console.log(`  Indexer:       ${network.indexerUrl}`);
  console.log();
  console.log("  To query on-chain state, visit the indexer GraphQL playground:");
  console.log(`  ${network.indexerUrl}/graphql`);
}

async function proveIncome(network) {
  console.log(PRIVACY_NOTICE);
  console.log("💰  Income Eligibility Proof\n");
  console.log("  This circuit proves your income meets a threshold WITHOUT revealing");
  console.log("  your actual income. Only 'pass' or 'fail' is recorded on-chain.\n");

  // In a real interactive CLI, we'd use readline to prompt for:
  //   - credentialId (from previous issuance)
  //   - threshold (e.g. 500 = ₹5,00,000 in thousands)
  //   - actualIncome (PRIVATE — used only for proof generation, never stored)
  //   - privateSalt (PRIVATE — blinding factor)
  //
  // Then call the proveIncomeEligibility circuit via the Midnight SDK:
  //
  // import { callCircuit } from '@midnight-ntwrk/midnight-js-contracts';
  // const result = await callCircuit(provider, contractAddress, 'proveIncomeEligibility', {
  //   holderAddress,
  //   credentialId,
  //   threshold: BigInt(thresholdInput),
  //   resultKey,
  //   currentBlock: BigInt(await provider.getBlockHeight()),
  //   // PRIVATE witnesses — passed to the proof system, never transmitted:
  //   actualIncome: BigInt(incomeInput),
  //   privateSalt,
  // });
  //
  // console.log(`Result: ${result ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}`);
  // console.log('Proved without revealing your income ✓');

  console.log("  ℹ️   Full interactive mode requires: npm install && npm run compile");
  console.log("  ℹ️   Then use the frontend for a richer experience: npm run frontend:dev");
}

async function proveAge(network) {
  console.log(PRIVACY_NOTICE);
  console.log("🎂  Age Eligibility Proof (≥ 18)\n");
  console.log("  Proves you are 18 or older without revealing your exact age.\n");
  console.log("  ℹ️   Full interactive mode requires: npm install && npm run compile");
}

async function proveCredit(network) {
  console.log(PRIVACY_NOTICE);
  console.log("📈  Credit Score Eligibility Proof\n");
  console.log("  Proves your credit score meets the threshold without revealing the score.\n");
  console.log("  ℹ️   Full interactive mode requires: npm install && npm run compile");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const network = resolveNetwork();

console.log(`
╔═══════════════════════════════════════╗
║   PrivPass CLI — ${network.networkId.padEnd(21)}║
╚═══════════════════════════════════════╝
`);

switch (action) {
  case "status":
    await showStatus(network);
    break;
  case "prove-income":
    await proveIncome(network);
    break;
  case "prove-age":
    await proveAge(network);
    break;
  case "prove-credit":
    await proveCredit(network);
    break;
  default:
    console.log(`Unknown action: "${action}"`);
    console.log("Available actions: status, prove-income, prove-age, prove-credit");
    process.exit(1);
}
