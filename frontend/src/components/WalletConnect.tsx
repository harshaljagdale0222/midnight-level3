// =============================================================================
// components/WalletConnect.tsx – Fail-Proof 1AM Wallet Extension Connector UI
// =============================================================================

import React, { useState } from "react";
import type { UseMidnightReturn } from "../hooks/useMidnight";

interface WalletConnectProps {
  midnight: UseMidnightReturn;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ midnight }) => {
  const {
    connectionState,
    connect,
    connectWithAddress,
    disconnect,
    clearError,
  } = midnight;

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [customAddressInput, setCustomAddressInput] = useState("0x1am_user_wallet_address");

  const truncateAddress = (addr: string) =>
    addr.length > 18 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* ── 1. Idle Status ── */}
        {connectionState.status === "idle" && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              id="btn-connect-wallet"
              className="btn btn-primary btn-sm"
              type="button"
              onClick={() => connect()}
            >
              <span>⚡</span>
              Connect 1AM Wallet
            </button>
          </div>
        )}

        {/* ── 2. Connecting Status ── */}
        {connectionState.status === "connecting" && (
          <button className="btn btn-primary btn-sm" disabled type="button">
            <div className="spinner" />
            Connecting 1AM Wallet...
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

      {/* ── Custom Address Input Modal ── */}
      {showAddressModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#0d1226",
              border: "2px solid var(--color-border-glow)",
              borderRadius: "var(--radius-xl)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <h3 style={{ margin: 0, color: "#fff" }}>🔑 Enter 1AM Wallet Address</h3>
            <input
              className="form-input"
              type="text"
              value={customAddressInput}
              onChange={(e) => setCustomAddressInput(e.target.value)}
              placeholder="0x..."
              style={{ fontFamily: "monospace" }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn btn-primary btn-full"
                onClick={() => {
                  connectWithAddress(customAddressInput);
                  setShowAddressModal(false);
                }}
              >
                Connect Address
              </button>
              <button className="btn btn-ghost" onClick={() => setShowAddressModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
