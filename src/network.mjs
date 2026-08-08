// =============================================================================
// network.mjs – Network configuration helpers for PrivPass
// =============================================================================
// Provides endpoint URLs for local devnet and Midnight Preview Network.
// Import from deploy.mjs and cli.mjs as needed.

export const NETWORKS = {
  devnet: {
    name: "Local Devnet",
    nodeUrl: process.env.MIDNIGHT_NODE_URL || "ws://localhost:9944",
    indexerUrl: process.env.MIDNIGHT_INDEXER_URL || "http://localhost:8088",
    proofServerUrl: process.env.MIDNIGHT_PROOF_SERVER_URL || "http://localhost:6300",
    networkId: "devnet",
  },
  preview: {
    name: "Midnight Preview Network",
    nodeUrl: process.env.MIDNIGHT_NODE_URL || "wss://rpc.preview.midnight.network",
    indexerUrl:
      process.env.MIDNIGHT_INDEXER_URL ||
      "https://indexer.preview.midnight.network",
    proofServerUrl:
      process.env.MIDNIGHT_PROOF_SERVER_URL ||
      "https://proof-server.preview.midnight.network",
    networkId: "preview",
  },
};

/**
 * Resolve network config from CLI args or env vars.
 * Usage: node src/deploy.mjs --network preview
 */
export function resolveNetwork() {
  const args = process.argv.slice(2);
  const networkFlag = args.find((a) => a.startsWith("--network="))
    ? args.find((a) => a.startsWith("--network=")).split("=")[1]
    : args[args.indexOf("--network") + 1];

  const networkName =
    networkFlag ||
    process.env.MIDNIGHT_NETWORK ||
    "devnet";

  const config = NETWORKS[networkName];
  if (!config) {
    console.error(`Unknown network: "${networkName}". Valid options: devnet, preview`);
    process.exit(1);
  }

  console.log(`\n🌐  Network: ${config.name}`);
  console.log(`   Node:         ${config.nodeUrl}`);
  console.log(`   Indexer:      ${config.indexerUrl}`);
  console.log(`   Proof Server: ${config.proofServerUrl}\n`);

  return config;
}
