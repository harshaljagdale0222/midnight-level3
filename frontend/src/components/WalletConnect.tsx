// =============================================================================
// components/WalletConnect.tsx – Smart Dual-Mode 1AM Wallet Connector
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
    disconnect,
    clearError,
  } = midnight;

  const [showManualModal, setShowManualModal] = useState(false);
  const [inputAddress, setInputAddress] = useState("0x1am_user_preview_wallet_address");

  const truncateAddress = (addr: string) =>
    addr.length > 18 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;

  const handleManualSubmit = () => {
    const cleanAddr = inputAddress.trim() || "0x1am_preview_wallet";
    // Connect directly with user provided address
    (midnight as any).connectWithAddress?.(cleanAddr);
    setShowManualModal(false);
    clearError();
  };

  return (
    <>
      {/* ── Main Header Connect Bar ──────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {connectionState.status === "idle" && (
          <button
            id="btn-connect-wallet"
            className="btn btn-primary btn-sm"
            onClick={() => connect()}
          >
            <span>⚡</span>
            Connect 1AM Wallet
          </button>
        )}

        {connectionState.status === "connecting" && (
          <button className="btn btn-primary btn-sm" disabled>
            <div className="spinner" />
            Opening 1AM Wallet...
          </button>
        )}

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

            <button id="btn-disconnect" className="btn btn-ghost btn-sm" onClick={disconnect}>
              Disconnect
            </button>
          </div>
        )}

        {connectionState.status === "error" && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="btn btn-primary btn-sm" onClick={() => connect()} id="btn-retry-connect">
              <span>⚡</span> Retry Extension
            </button>

            <button className="btn btn-secondary btn-sm" onClick={() => setShowManualModal(true)}>
              <span>🔑</span> Enter Address
            </button>

            <button className="btn btn-ghost btn-sm" onClick={clearError}>
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* ── Manual Address Modal Fallback ─────────────────────────────────── */}
      {showManualModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
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
              maxWidth: "440px",
              background: "#0d1226",
              border: "2px solid var(--color-border-glow)",
              borderRadius: "var(--radius-xl)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#fff" }}>🔑 Connect 1AM Wallet Address</h3>
              <button
                onClick={() => setShowManualModal(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.5rem" }}
              >
                ×
              </button>
            </div>

            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              Enter or paste your Midnight 1AM Wallet address to connect:
            </p>

            <div className="form-group">
              <input
                id="input-manual-1am-address"
                className="form-input"
                type="text"
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                placeholder="0x..."
                style={{ fontFamily: "monospace", fontSize: "0.875rem" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn btn-primary btn-full"
                onClick={handleManualSubmit}
              >
                ⚡ Connect Address Now
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowManualModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
