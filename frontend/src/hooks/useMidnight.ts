// =============================================================================
// hooks/useMidnight.ts – Direct 1AM Wallet Extension Connector
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

  // Scan injected window.midnight object
  const discoverWallets = useCallback((): MidnightWalletApi[] => {
    if (typeof window === "undefined" || !window.midnight) return [];
    const w = window as any;
    const found: MidnightWalletApi[] = [];

    if (typeof w.midnight.enable === "function") {
      found.push(w.midnight);
    }
    Object.keys(w.midnight).forEach((key) => {
      const provider = w.midnight[key];
      if (provider && typeof provider.enable === "function") {
        found.push(provider);
      }
    });

    setAvailableWallets(found);
    return found;
  }, []);

  useEffect(() => {
    discoverWallets();
    const interval = setInterval(discoverWallets, 500);
    return () => clearInterval(interval);
  }, [discoverWallets]);

  // DIRECT 1-CLICK EXTENSION POPUP TRIGGER
  const connect = useCallback(async () => {
    setConnectionState({ status: "connecting" });

    try {
      const w = window as any;

      // Find provider in window.midnight or retry up to 1 second
      let provider: any = null;

      for (let attempt = 0; attempt < 10; attempt++) {
        if (w.midnight) {
          provider =
            w.midnight.mnLace ||
            w.midnight["1am-wallet"] ||
            w.midnight.midnight ||
            w.midnight["1am"] ||
            (typeof w.midnight.enable === "function" ? w.midnight : null);

          if (!provider) {
            const keys = Object.keys(w.midnight);
            if (keys.length > 0) provider = w.midnight[keys[0]];
          }
        }
        if (!provider) provider = w.lace || w.cardano?.midnight;

        if (provider && typeof provider.enable === "function") break;
        await new Promise((r) => setTimeout(r, 100));
      }

      if (!provider || typeof provider.enable !== "function") {
        throw new Error(
          "1AM Wallet extension popup request failed. Please check if your 1AM Wallet extension is unlocked in Chrome."
        );
      }

      // THIS DIRECT CALL LAUNCHES THE CHROME EXTENSION POPUP WINDOW
      const api = await provider.enable();

      const connectedNetwork = await api.networkId();
      const walletAddress = await api.getAddress();

      setConnectorApi(api);
      setConnectionState({
        status: "connected",
        address: walletAddress,
        network: connectedNetwork,
        walletName: provider.name || "1AM Wallet",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "1AM Wallet connection popup failed.";
      setConnectionState({ status: "error", error: message });
    }
  }, []);

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
