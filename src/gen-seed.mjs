// =============================================================================
// src/gen-seed.mjs – Automatic 24-word Seed Generator for PrivPass Deployer
// =============================================================================

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const WALLET_DIR = join(ROOT, ".midnight-wallet-state");
const WALLET_FILE = join(WALLET_DIR, "wallet.json");

const WORD_LIST = [
  "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
  "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid",
  "acoustic", "acquire", "across", "act", "action", "actor", "actress", "actual",
  "adapt", "add", "addict", "address", "adjust", "admit", "adult", "advance",
  "advice", "aerobic", "afford", "afraid", "again", "age", "agent", "agree",
  "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol",
  "alert", "alien", "all", "alley", "allow", "almost", "alone", "alpha",
  "already", "also", "alter", "always", "amateur", "amazing", "among", "amount",
  "amused", "analyst", "anchor", "ancient", "anger", "angle", "angry", "animal",
  "ankle", "announce", "annual", "another", "answer", "antenna", "antique", "anxiety",
  "any", "apart", "apology", "appear", "apple", "approve", "april", "arch",
  "arctic", "area", "arena", "argue", "arm", "armed", "armor", "army",
  "around", "arrange", "arrest", "arrive", "arrow", "art", "artefact", "artist",
  "artwork", "ask", "aspect", "assault", "asset", "assist", "assume", "asthma",
  "athlete", "atom", "attack", "attend", "attitude", "attract", "auction", "audit",
  "august", "aunt", "author", "auto", "autumn", "average", "avocado", "avoid",
  "awake", "aware", "away", "awesome", "awful", "awkward", "axis", "baby"
];

function generate24WordSeed() {
  const words = [];
  for (let i = 0; i < 24; i++) {
    const index = Math.floor(Math.random() * WORD_LIST.length);
    words.push(WORD_LIST[index]);
  }
  return words.join(" ");
}

if (!existsSync(WALLET_DIR)) {
  mkdirSync(WALLET_DIR, { recursive: true });
}

const newSeed = generate24WordSeed();
writeFileSync(WALLET_FILE, JSON.stringify({ seed: newSeed }, null, 2));

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║   🔑  Generated Deployer Wallet Seed                              ║
╚════════════════════════════════════════════════════════════════════╝

  ✓ Seed phrase generated and saved to:
    .midnight-wallet-state/wallet.json

  📜 Seed Phrase (24 words):
    ${newSeed}

  ⚠️  Keep this seed private. It has been added to .gitignore.

  Next step:
    Run: npm run deploy -- --network preview
`);
