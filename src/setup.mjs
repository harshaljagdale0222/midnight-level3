// =============================================================================
// setup.mjs – One-time setup helper for PrivPass
// =============================================================================
// Checks prerequisites: Node version, npm packages, Docker availability,
// and wallet seed configuration.

import { execSync } from "child_process";
import { existsSync } from "fs";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

const check = (label, fn) => {
  try {
    const result = fn();
    console.log(`  ${GREEN}✓${RESET}  ${label}${result ? `: ${result}` : ""}`);
    return true;
  } catch (e) {
    console.log(`  ${RED}✗${RESET}  ${label}: ${e.message}`);
    return false;
  }
};

const warn = (label, fn) => {
  try {
    const result = fn();
    console.log(`  ${GREEN}✓${RESET}  ${label}${result ? `: ${result}` : ""}`);
    return true;
  } catch (e) {
    console.log(`  ${YELLOW}⚠${RESET}  ${label}: ${e.message} (optional)`);
    return false;
  }
};

console.log(`\n${BOLD}╔══════════════════════════════════════════╗${RESET}`);
console.log(`${BOLD}║   PrivPass – Environment Setup Check     ║${RESET}`);
console.log(`${BOLD}╚══════════════════════════════════════════╝${RESET}\n`);

console.log("📋  Checking required tools:\n");

const nodeOk = check("Node.js ≥ 20", () => {
  const version = process.version;
  const major = parseInt(version.slice(1).split(".")[0]);
  if (major < 20) throw new Error(`Found ${version}, need ≥ v20`);
  return version;
});

const npmOk = check("npm", () => {
  return execSync("npm --version", { encoding: "utf8" }).trim();
});

const gitOk = check("git", () => {
  return execSync("git --version", { encoding: "utf8" }).trim();
});

console.log("\n📋  Checking optional tools:\n");

const dockerOk = warn("Docker / Docker Compose", () => {
  execSync("docker compose version", { encoding: "utf8", stdio: "pipe" });
  return execSync("docker compose version", { encoding: "utf8", stdio: "pipe" }).trim().split("\n")[0];
});

const compactOk = warn("compact compiler", () => {
  return execSync("compact --version", { encoding: "utf8", stdio: "pipe" }).trim();
});

console.log("\n📋  Checking project files:\n");

const contractOk = check("privpass.compact contract", () => {
  if (!existsSync("contracts/privpass.compact")) {
    throw new Error("Not found");
  }
  return "contracts/privpass.compact";
});

const managedOk = warn("compiled contract (managed/)", () => {
  if (!existsSync("contracts/managed")) {
    throw new Error("Run `npm run compile` first");
  }
  return "contracts/managed/";
});

const walletSeed = warn("Wallet seed (MIDNIGHT_WALLET_SEED env var)", () => {
  if (!process.env.MIDNIGHT_WALLET_SEED) {
    throw new Error("Not set — required for deployment");
  }
  return "Set ✓ (not shown for security)";
});

console.log(`\n${BOLD}Summary:${RESET}`);

if (!dockerOk) {
  console.log(`
  ${YELLOW}⚠  Docker Desktop is not running or not installed.${RESET}
     To run the local devnet:
       1. Start Docker Desktop
       2. Run: npm run devnet:up
     
     To skip Docker and deploy directly to Preview Network:
       npm run deploy -- --network preview
     
     ${YELLOW}Windows tip:${RESET} If Docker fails, use WSL (Ubuntu) instead:
       wsl -- bash -c "cd /mnt/c/Users/User01/Desktop/DeFi/privpass && npm run devnet:up"
`);
}

if (!compactOk) {
  console.log(`
  ${YELLOW}⚠  compact compiler not found.${RESET}
     Install it from: https://docs.midnight.network/develop/tutorial/building/
     Or run inside the Midnight devnet Docker container:
       docker compose exec midnight-node compact compile contracts/privpass.compact
`);
}

if (!walletSeed) {
  console.log(`
  ${YELLOW}⚠  No wallet seed configured.${RESET}
     Set before deploying:
       PowerShell: $env:MIDNIGHT_WALLET_SEED="your 24 word mnemonic"
       Git Bash:   export MIDNIGHT_WALLET_SEED="your 24 word mnemonic"
`);
}

const allRequired = nodeOk && npmOk && gitOk && contractOk;

if (allRequired) {
  console.log(`\n  ${GREEN}${BOLD}✅  All required checks passed!${RESET}`);
  console.log(`\n  Next steps:`);
  console.log(`    1. npm install                        # Install dependencies`);
  console.log(`    2. npm run compile                    # Compile the contract`);
  console.log(`    3. npm run devnet:up                  # Start local devnet (needs Docker)`);
  console.log(`    4. npm run deploy -- --network preview # Deploy to Preview Network`);
  console.log(`    5. npm run test                       # Run tests`);
  console.log(`    6. npm run frontend:dev               # Start the frontend\n`);
} else {
  console.log(`\n  ${RED}${BOLD}❌  Some required checks failed. Please fix the issues above.${RESET}\n`);
  process.exit(1);
}
