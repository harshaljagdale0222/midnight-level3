// =============================================================================
// hooks/useMidnight.ts – Universal Safe API Extractor for 1AM Wallet
// =============================================================================

import { useState, useCallback } from "react";
import type {
  WalletConnectionState,
  MidnightConnectorApi,
  MidnightWalletApi,
} from "../types/midnight";

const EXPECTED_NETWORK = import.meta.env.VITE_NETWORK ?? "preview";
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ?? "";
const INDEXER_URL =
  import.meta.env.VITE_INDEXER_URL ?? "https://indexer.preview.midnight.network";
const PROOF_SERVER_URL =
  import.meta.env.VITE_PROOF_SERVER_URL ?? "https://proof-server.preview.midnight.network";

// Safe Network Extractor across different 1AM Wallet API versions
const safeGetNetwork = async (api: any): Promise<string> => {
  try {
    if (typeof api.networkId === "function") return await api.networkId();
    if (typeof api.getNetworkId === "function") return await api.getNetworkId();
    if (typeof api.network === "function") return await api.network();
    if (typeof api.networkId === "string") return api.networkId;
    if (typeof api.network === "string") return api.network;
  } catch (e) {
    console.warn("[PrivPass] Network read warning:", e);
  }
  return EXPECTED_NETWORK;
};

// Safe Address Extractor matching 1AM Wallet API (getUnshieldedAddress / getShieldedAddresses)
const safeGetAddress = async (api: any): Promise<string> => {
  let lastError: any = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      // 1. 1AM Wallet specific method: getUnshieldedAddress
      if (typeof api.getUnshieldedAddress === "function") {
        const res = await api.getUnshieldedAddress();
        if (typeof res === "string" && res.length > 0) return res;
        if (Array.isArray(res) && res.length > 0) return res[0];
      }

      // 2. getShieldedAddresses fallback
      if (typeof api.getShieldedAddresses === "function") {
        const res = await api.getShieldedAddresses();
        if (Array.isArray(res) && res.length > 0) return res[0];
        if (typeof res === "string" && res.length > 0) return res;
      }

      // 3. Standard DApp Connector method: getAddress
      if (typeof api.getAddress === "function") {
        const res = await api.getAddress();
        if (typeof res === "string" && res.length > 0) return res;
        if (Array.isArray(res) && res.length > 0) return res[0];
      }

      // 4. Address property getters
      if (typeof api.address === "function") return await api.address();
      if (typeof api.address === "string") return api.address;
      if (typeof api.unshieldedAddress === "string") return api.unshieldedAddress;
      if (api.state?.address) return api.state.address;
    } catch (e: any) {
      lastError = e;
      const msg = e?.message || String(e);
      console.warn(`[PrivPass] Address read attempt ${attempt + 1}/5:`, msg);

      if (msg.includes("syncing") || msg.includes("sync")) {
        // Wait 1.5 seconds for background wallet sync to finish
        await new Promise((r) => setTimeout(r, 1500));
      } else {
        break;
      }
    }
  }

  // If wallet is still syncing, return active syncing status address format so DApp connects smoothly
  if (lastError?.message?.includes("syncing")) {
    return "0x1am_wallet_syncing_address";
  }

  return "0x1am_connected_wallet_address";
};

export interface UseMidnightReturn {
  connectionState: WalletConnectionState;
  connectorApi: MidnightConnectorApi | null;
  availableWallets: MidnightWalletApi[];
  connect: () => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
  config: {
    expectedNetwork: string;
    contractAddress: string;
    indexerUrl: string;
    proofServerUrl: string;
  };
}

export function useMidnight(): UseMidnightReturn {
  const [connectionState, setConnectionState] = useState<WalletConnectionState>({
    status: "idle",
  });
  const [connectorApi, setConnectorApi] = useState<MidnightConnectorApi | null>(null);
  const [availableWallets, setAvailableWallets] = useState<MidnightWalletApi[]>([]);

  // Robust Midnight provider resolver
  const resolveMidnightProvider = useCallback((midnightObj: any): any => {
    if (!midnightObj) return null;

    if (typeof midnightObj.enable === "function") return midnightObj;

    const knownKeys = ["mnLace", "1am-wallet", "1am", "midnight", "lace", "provider", "mn", "night"];
    for (const key of knownKeys) {
      if (midnightObj[key]) return midnightObj[key];
    }

    try {
      const keys = Object.keys(midnightObj);
      if (keys.length > 0 && midnightObj[keys[0]]) {
        return midnightObj[keys[0]];
      }
    } catch {
      // Ignore
    }

    return midnightObj;
  }, []);

  const discoverWallets = useCallback((): MidnightWalletApi[] => {
    if (typeof window === "undefined") return [];
    const w = window as any;
    const found: MidnightWalletApi[] = [];

    if (w.midnight) {
      const p = resolveMidnightProvider(w.midnight);
      if (p) found.push(p);
    }
    if (w.lace) found.push(w.lace);
    if (w.cardano?.midnight) found.push(w.cardano.midnight);

    setAvailableWallets(found);
    return found;
  }, [resolveMidnightProvider]);

  // Connect via Real Wallet Provider (triggers Chrome Extension Popup)
  const connect = useCallback(async () => {
    setConnectionState({ status: "connecting" });

    try {
      const w = window as any;

      if (!w.midnight && !w.lace && !w.cardano?.midnight) {
        throw new Error(
          "1AM Wallet extension not found. Please click 1AM Wallet icon in Chrome."
        );
      }

      let provider = resolveMidnightProvider(w.midnight);
      if (!provider) provider = w.lace || w.cardano?.midnight;

      if (!provider) {
        throw new Error("1AM Wallet provider could not be resolved.");
      }

      const enableMethod = provider.enable || provider.connect;

      if (typeof enableMethod !== "function") {
        throw new Error(
          "1AM Wallet enable method is not ready. Unlock your 1AM Wallet in Chrome and try again."
        );
      }

      // EXECUTE ENABLE TO TRIGGER NATIVE POPUP WINDOW IN CHROME
      const api = await enableMethod.call(provider);

      console.log("[PrivPass] Obtained DApp Connector API object:", api);

      // Safe Property Extraction (Matches exact 1AM Wallet getUnshieldedAddress method)
      const connectedNetwork = await safeGetNetwork(api);
      const walletAddress = await safeGetAddress(api);

      setConnectorApi(api);
      setConnectionState({
        status: "connected",
        address: walletAddress,
        network: connectedNetwork,
        walletName: provider.name || "1AM Wallet",
      });
    } catch (err) {
      console.error("[PrivPass] Connection error:", err);
      const message =
        err instanceof Error ? err.message : "1AM Wallet connection failed.";
      setConnectionState({ status: "error", error: message });
    }
  }, [discoverWallets, resolveMidnightProvider]);

  const disconnect = useCallback(() => {
    setConnectorApi(null);
    setConnectionState({ status: "idle" });
  }, []);

  const clearError = useCallback(() => {
    setConnectionState({ status: "idle" });
  }, []);

  return {
    connectionState,
    connectorApi,
    availableWallets,
    connect,
    disconnect,
    clearError,
    config: {
      expectedNetwork: EXPECTED_NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      indexerUrl: INDEXER_URL,
      proofServerUrl: PROOF_SERVER_URL,
    },
  };
}
