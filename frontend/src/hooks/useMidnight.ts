// =============================================================================
// hooks/useMidnight.ts – Universal 1AM / Midnight Connector + Auto Permission Retry
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
  connect: (walletId?: string) => Promise<void>;
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

  // Discover all injected wallet providers in window
  const discoverWallets = useCallback((): MidnightWalletApi[] => {
    if (typeof window === "undefined") return [];

    const w = window as any;
    const providers: MidnightWalletApi[] = [];

    const addIfValid = (obj: any, id: string, name: string) => {
      if (obj && typeof obj.enable === "function") {
        providers.push({
          serviceId: id,
          name: obj.name || name,
          icon: obj.icon,
          apiVersion: obj.apiVersion || "0.1.0",
          enable: obj.enable.bind(obj),
          isEnabled: obj.isEnabled ? obj.isEnabled.bind(obj) : async () => false,
        });
      }
    };

    if (w.midnight) {
      addIfValid(w.midnight, "midnight_direct", "1AM Wallet");

      const knownKeys = ["mnLace", "1am-wallet", "1am", "midnight", "lace", "provider", "mn", "night"];
      knownKeys.forEach((key) => {
        addIfValid(w.midnight[key], key, key);
      });

      try {
        Object.keys(w.midnight).forEach((key) => {
          if (!knownKeys.includes(key)) {
            addIfValid(w.midnight[key], key, key);
          }
        });
      } catch {
        // Ignore
      }
    }

    addIfValid(w.lace, "lace_root", "Lace Wallet");
    if (w.cardano?.midnight) {
      addIfValid(w.cardano.midnight, "cardano_midnight", "Midnight Wallet");
    }

    setAvailableWallets(providers);
    return providers;
  }, []);

  useEffect(() => {
    discoverWallets();
    const interval = setInterval(discoverWallets, 300);
    return () => clearInterval(interval);
  }, [discoverWallets]);

  // Connect via real Midnight DApp Connector
  const connect = useCallback(async (walletId?: string) => {
    setConnectionState({ status: "connecting" });

    try {
      const w = window as any;
      const providers = discoverWallets();

      let targetProvider: any = null;

      if (providers.length > 0) {
        targetProvider = walletId
          ? providers.find((p) => p.serviceId === walletId) || providers[0]
          : providers[0];
      } else if (w.midnight) {
        targetProvider =
          w.midnight.mnLace ||
          w.midnight["1am-wallet"] ||
          w.midnight.midnight ||
          w.midnight["1am"] ||
          (typeof w.midnight.enable === "function" ? w.midnight : null);
      }

      if (!targetProvider || typeof targetProvider.enable !== "function") {
        throw new Error(
          "Chrome status shows 'Action required'. Chrome is blocking the extension script. Click the orange 'Action required' button at the top right of Chrome and select 'Allow on localhost'."
        );
      }

      // OPENS NATIVE EXTENSION POPUP WINDOW IN CHROME
      const api = await targetProvider.enable();

      const connectedNetwork = await api.networkId();
      const walletAddress = await api.getAddress();

      setConnectorApi(api);
      setConnectionState({
        status: "connected",
        address: walletAddress,
        network: connectedNetwork,
        walletName: targetProvider.name || "1AM Wallet",
      });
    } catch (err) {
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
