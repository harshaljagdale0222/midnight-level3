// =============================================================================
// hooks/useMidnight.ts – Universal 1AM / Midnight Provider Resolution
// =============================================================================

import { useState, useCallback, useEffect } from "react";
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

  // Robust Midnight provider resolver (handles Manifest V3 proxies & getters)
  const resolveMidnightProvider = useCallback((midnightObj: any): any => {
    if (!midnightObj) return null;

    // 1. Direct enable on window.midnight
    if (typeof midnightObj.enable === "function") return midnightObj;

    // 2. Known key names (mnLace, 1am-wallet, 1am, midnight, lace, etc.)
    const knownKeys = ["mnLace", "1am-wallet", "1am", "midnight", "lace", "provider", "mn", "night"];
    for (const key of knownKeys) {
      if (midnightObj[key]) return midnightObj[key];
    }

    // 3. Any property on window.midnight
    try {
      const keys = Object.keys(midnightObj);
      if (keys.length > 0 && midnightObj[keys[0]]) {
        return midnightObj[keys[0]];
      }
    } catch {
      // Ignore
    }

    // 4. Any property name including getters/proxies
    try {
      const propNames = Object.getOwnPropertyNames(midnightObj);
      if (propNames.length > 0 && midnightObj[propNames[0]]) {
        return midnightObj[propNames[0]];
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

  useEffect(() => {
    discoverWallets();
    const interval = setInterval(discoverWallets, 500);
    return () => clearInterval(interval);
  }, [discoverWallets]);

  // Connect via real Midnight DApp Connector
  const connect = useCallback(async () => {
    setConnectionState({ status: "connecting" });

    try {
      const w = window as any;

      console.log("[PrivPass] Injected window.midnight:", w.midnight);

      if (!w.midnight && !w.lace && !w.cardano?.midnight) {
        throw new Error(
          "1AM / Midnight Wallet extension is not injected in Chrome window object. Please check if the extension is enabled."
        );
      }

      // Resolve the provider object directly inside window.midnight
      let provider = resolveMidnightProvider(w.midnight);
      if (!provider) provider = w.lace || w.cardano?.midnight;

      console.log("[PrivPass] Resolved target provider:", provider);

      if (!provider) {
        throw new Error(
          "Midnight wallet provider could not be resolved from window.midnight."
        );
      }

      // CALL ENABLE() TO OPEN CHROME WALLET POPUP WINDOW
      const enableMethod = provider.enable || provider.connect;

      if (typeof enableMethod !== "function") {
        console.log("[PrivPass] Provider object keys:", Object.keys(provider));
        throw new Error(
          "Wallet provider found in window.midnight but enable() function is not ready. Please unlock your 1AM Wallet extension in Chrome."
        );
      }

      // EXECUTE ENABLE TO TRIGGER NATIVE POPUP WINDOW
      const api = await enableMethod.call(provider);

      console.log("[PrivPass] Obtained DApp Connector API:", api);

      const connectedNetwork = await api.networkId();
      const walletAddress = await api.getAddress();

      setConnectorApi(api);
      setConnectionState({
        status: "connected",
        address: walletAddress, // REAL address from wallet extension
        network: connectedNetwork,
        walletName: provider.name || "1AM Wallet",
      });
    } catch (err) {
      console.error("[PrivPass] Connection failed:", err);
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
