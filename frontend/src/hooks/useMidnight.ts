// =============================================================================
// hooks/useMidnight.ts – Robust Direct 1AM Wallet Extension Connector
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
    if (typeof window === "undefined") return [];
    const w = window as any;
    const found: MidnightWalletApi[] = [];

    if (w.midnight) {
      if (typeof w.midnight.enable === "function") {
        found.push(w.midnight);
      }
      Object.keys(w.midnight).forEach((key) => {
        const provider = w.midnight[key];
        if (provider && typeof provider.enable === "function") {
          found.push(provider);
        }
      });
    }

    if (w.lace && typeof w.lace.enable === "function") found.push(w.lace);
    if (w.cardano?.midnight && typeof w.cardano.midnight.enable === "function")
      found.push(w.cardano.midnight);

    setAvailableWallets(found);
    return found;
  }, []);

  useEffect(() => {
    discoverWallets();
    const interval = setInterval(discoverWallets, 400);
    return () => clearInterval(interval);
  }, [discoverWallets]);

  // Robust Direct Connect
  const connect = useCallback(async () => {
    console.log("[PrivPass] Connect button clicked. Discovering Midnight provider...");
    setConnectionState({ status: "connecting" });

    try {
      const w = window as any;

      let provider: any = null;

      // Check all possible Midnight injected properties
      if (w.midnight) {
        if (typeof w.midnight.enable === "function") {
          provider = w.midnight;
        } else {
          provider =
            w.midnight.mnLace ||
            w.midnight["1am-wallet"] ||
            w.midnight.midnight ||
            w.midnight["1am"] ||
            w.midnight.lace;

          if (!provider) {
            const keys = Object.keys(w.midnight);
            if (keys.length > 0) provider = w.midnight[keys[0]];
          }
        }
      }

      if (!provider) provider = w.lace || w.cardano?.midnight;

      console.log("[PrivPass] Target Midnight provider:", provider);

      if (!provider || typeof provider.enable !== "function") {
        throw new Error(
          "Midnight wallet extension not detected in window.midnight. Please make sure the 1AM / Lace extension is installed, enabled, and unlocked in Chrome."
        );
      }

      // CALL NATIVE EXTENSION ENABLE POPUP
      const enablePromise = provider.enable();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Wallet extension request timed out. Please click your 1AM / Lace Wallet extension icon in Chrome."
              )
            ),
          12000
        )
      );

      const api = (await Promise.race([enablePromise, timeoutPromise])) as MidnightConnectorApi;

      console.log("[PrivPass] Connector API obtained:", api);

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
      console.error("[PrivPass] Connect failed:", err);
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
