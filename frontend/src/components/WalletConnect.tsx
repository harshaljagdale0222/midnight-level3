// =============================================================================
// components/WalletConnect.tsx – Real 1AM Wallet Extension Connector UI
// =============================================================================

import React from "react";
import type { UseMidnightReturn } from "../hooks/useMidnight";

interface WalletConnectProps {
  midnight: UseMidnightReturn;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ midnight }) => {
  const {
    connectionState,
    connect,
    disconnect,
    clearError,
  } = midnight;

  const truncateAddress = (addr: string) =>
    addr.length > 18 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {/* ── 1. Idle Status ── */}
      {connectionState.status === "idle" && (
        <button
          id="btn-connect-wallet"
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() => connect()}
        >
          <span>⚡</span>
          Connect 1AM Wallet
        </button>
      )}

      {/* ── 2. Connecting Status ── */}
      {connectionState.status === "connecting" && (
        <button className="btn btn-primary btn-sm" disabled type="button">
          <div className="spinner" />
          Opening 1AM Wallet...
        </button>
      )}

      {/* ── 3. Connected Status ── */}
      {connectionState.status === "connected" && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="badge badge-success" id="badge-network">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
            Preview
          </span>

          <span
            id="display-wallet-address"
            style={{
              fontFamily: "monospace",
              fontSize: "0.8125rem",
              color: "#ffffff",
              background: "rgba(124, 58, 237, 0.25)",
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              border: "1px solid rgba(124, 58, 237, 0.4)",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            title={connectionState.address}
          >
            <span>🔑</span>
            {truncateAddress(connectionState.address)}
          </span>

          <button id="btn-disconnect" className="btn btn-ghost btn-sm" onClick={disconnect} type="button">
            Disconnect
          </button>
        </div>
      )}

      {/* ── 4. Error Status ── */}
      {connectionState.status === "error" && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button className="btn btn-primary btn-sm" onClick={() => connect()} id="btn-retry-connect" type="button">
            ⚡ Connect 1AM Wallet
          </button>
          <button className="btn btn-ghost btn-sm" onClick={clearError} type="button">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
