// =============================================================================
// hooks/useMidnight.ts – 100% Real Midnight DApp Connector (Zero Dummy Address)
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

  // Connect handler — ONLY real wallet connection (Zero dummy fallback string)
  const connect = useCallback(async () => {
    setConnectionState({ status: "connecting" });

    try {
      const w = window as any;

      console.log("[PrivPass] Scanning window object for Midnight provider...");
      console.log("[PrivPass] window.midnight:", w.midnight);

      if (!w.midnight && !w.lace && !w.cardano?.midnight) {
        throw new Error(
          "1AM / Midnight Wallet extension is not injected into `window.midnight` on this page (http://localhost:5173). Please check Chrome extension permissions."
        );
      }

      let provider: any =
        w.midnight?.mnLace ||
        w.midnight?.["1am-wallet"] ||
        w.midnight?.midnight ||
        w.midnight?.["1am"] ||
        (typeof w.midnight?.enable === "function" ? w.midnight : null);

      if (!provider) {
        const wallets = discoverWallets();
        if (wallets.length > 0) provider = wallets[0];
      }

      if (!provider) provider = w.lace || w.cardano?.midnight;

      if (!provider || typeof provider.enable !== "function") {
        throw new Error(
          "Midnight wallet provider not found in window.midnight. Please ensure 1AM Wallet extension is enabled for all sites in chrome://extensions."
        );
      }

      // THIS DIRECT CALL OPENS THE CHROME EXTENSION POPUP
      const api = await provider.enable();
      const connectedNetwork = await api.networkId();
      const walletAddress = await api.getAddress();

      setConnectorApi(api);
      setConnectionState({
        status: "connected",
        address: walletAddress, // REAL address from extension only
        network: connectedNetwork,
        walletName: provider.name || "1AM Wallet",
      });
    } catch (err) {
      console.error("[PrivPass] Connect error:", err);
      const message =
        err instanceof Error ? err.message : "1AM Wallet connection failed.";
      setConnectionState({ status: "error", error: message });
    }
  }, [discoverWallets]);

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
