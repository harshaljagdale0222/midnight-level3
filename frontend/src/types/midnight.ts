// =============================================================================
// types/midnight.ts – Type definitions for Midnight DApp Connector API
// =============================================================================
// These types mirror the DApp Connector API exposed by the 1am Lace wallet
// extension at window.midnight.
//
// Reference: https://docs.midnight.network/develop/tutorial/building/dapp-connector

export interface MidnightServiceState {
  status: "Connected" | "Disconnected";
  error?: string;
}

export interface MidnightWalletApi {
  /** Unique identifier for this wallet provider */
  serviceId: string;
  /** Human-readable name (e.g. "Lace") */
  name: string;
  /** Enable/connect the wallet — returns the DApp Connector API */
  enable: () => Promise<MidnightConnectorApi>;
  /** Check if already enabled */
  isEnabled: () => Promise<boolean>;
  /** Wallet version string */
  apiVersion: string;
  /** Icon as a data URI */
  icon?: string;
}

export interface MidnightConnectorApi {
  /** Current network ID (e.g. "preview", "mainnet") */
  networkId: () => Promise<string>;
  /** Get the unshielded (public) wallet address */
  getAddress: () => Promise<string>;
  /** Wallet balances */
  balances: () => Promise<{ dust: bigint; [key: string]: bigint }>;
  /** Submit a balanced/proved transaction */
  submitTransaction: (tx: unknown) => Promise<string>;
  /** Balance a transaction (add inputs/change) */
  balanceTransaction: (
    unbalancedTx: unknown,
    walletPrivateState: unknown
  ) => Promise<unknown>;
  /** Prove a balanced transaction */
  proveTransaction: (
    balancedTx: unknown,
    proofServerUrl: string
  ) => Promise<unknown>;
}

// Window augmentation for the DApp Connector
declare global {
  interface Window {
    midnight?: {
      [walletId: string]: MidnightWalletApi;
    };
  }
}

// ─── Application State Types ──────────────────────────────────────────────────

export type WalletConnectionState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "connected"; address: string; network: string; walletName: string }
  | { status: "error"; error: string }
  | { status: "network_mismatch"; expected: string; actual: string };

export type CredentialType = "income" | "age" | "credit" | "identity";

export interface Credential {
  id: string;
  type: CredentialType;
  credType: number;   // 0=income, 1=age, 2=credit, 3=identity (numeric, mirrors on-chain)
  issuer: string;
  holder: string;
  expiryBlock: number;
  isRevoked: boolean;
  valueHash: string;
}

export interface EligibilityResult {
  holder: string;
  purpose: string;
  passed: boolean;
  checkedAt: number;
  txHash?: string;
}

export type ProofState =
  | { status: "idle" }
  | { status: "preparing" }
  | { status: "proving"; message: string }
  | { status: "submitting" }
  | { status: "success"; result: boolean; txHash: string }
  | { status: "error"; error: string };

export type IssuerState =
  | { status: "idle" }
  | { status: "issuing" }
  | { status: "success"; credentialId: string; txHash: string }
  | { status: "error"; error: string };

// ─── Contract State (from Indexer) ───────────────────────────────────────────

export interface ContractState {
  contractOwner: string;
  totalCredentials: number;
  totalProofsVerified: number;
  issuers: string[];
}
