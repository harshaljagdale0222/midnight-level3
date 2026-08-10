// =============================================================================
// components/WalletConnect.tsx – Real 1AM Wallet Extension Connector & Popup UI
// =============================================================================

import React from "react";
import type { UseMidnightReturn } from "../hooks/useMidnight";

interface WalletConnectProps {
  midnight: UseMidnightReturn;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ midnight }) => {
  const {
    connectionState,
    isPopupVisible,
    openPopup,
    closePopup,
    connect,
    disconnect,
    clearError,
  } = midnight;

  const truncateAddress = (addr: string) =>
    addr.length > 18 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* ── 1. Idle Status ── */}
        {connectionState.status === "idle" && (
          <button
            id="btn-connect-wallet"
            className="btn btn-primary btn-sm"
            type="button"
            onClick={openPopup}
          >
            <span>⚡</span>
            Connect Lace Wallet
          </button>
        )}

        {/* ── 2. Connecting Status ── */}
        {connectionState.status === "connecting" && (
          <button className="btn btn-primary btn-sm" disabled type="button">
            <div className="spinner" />
            Connecting Lace Wallet...
          </button>
        )}

        {/* ── 3. Connected Status ── */}
        {connectionState.status === "connected" && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="badge badge-success" id="badge-network">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
              Preprod
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
            <button className="btn btn-primary btn-sm" onClick={openPopup} id="btn-retry-connect" type="button">
              ⚡ Connect Lace Wallet
            </button>
            <button className="btn btn-ghost btn-sm" onClick={clearError} type="button">
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* ── REAL LACE WALLET EXTENSION CONNECTION POPUP WINDOW MODAL ───────── */}
      {isPopupVisible && (
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
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#0d1226",
              border: "2px solid var(--color-border-glow)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(124, 58, 237, 0.4)",
              overflow: "hidden",
            }}
          >
            {/* Lace Wallet Popup Window Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                padding: "18px 22px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.5rem" }}>⚡</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1.125rem", letterSpacing: "0.02em" }}>
                    Lace Midnight Wallet
                  </div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                    Midnight Network Connector
                  </div>
                </div>
              </div>

              <span className="badge" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                Preprod Testnet
              </span>
            </div>

            {/* Popup Window Content Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ textAlign: "center" }}>
                <h3 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "1.125rem" }}>
                  Connect Request
                </h3>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                  PrivPass DApp is requesting connection to your Lace Midnight Wallet extension.
                </p>
              </div>

              {/* DApp Info Card */}
              <div
                style={{
                  background: "var(--color-bg-input)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--grad-brand)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    color: "#fff",
                    fontSize: "1.25rem",
                  }}
                >
                  P
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>PrivPass ZK DApp</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-zk-cyan)", fontFamily: "monospace" }}>
                    http://localhost:5173
                  </div>
                </div>
              </div>

              {/* Permissions List */}
              <div style={{ background: "rgba(124, 58, 237, 0.08)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid rgba(124, 58, 237, 0.2)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "6px", textTransform: "uppercase", fontWeight: 700 }}>
                  Requested Permissions:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.8125rem", color: "var(--color-text-primary)" }}>
                  <div>✓ Read unshielded wallet address</div>
                  <div>✓ Execute Groth16 Zero-Knowledge circuits</div>
                  <div>✓ Submit balanced Midnight transactions</div>
                </div>
              </div>

              {/* Popup Window Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px" }}>
                <button
                  id="btn-approve-1am-popup"
                  className="btn btn-primary btn-lg btn-full"
                  type="button"
                  onClick={() => connect()}
                >
                  ⚡ Approve & Connect Lace Wallet
                </button>

                <button
                  className="btn btn-ghost btn-full"
                  type="button"
                  onClick={closePopup}
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Popup Footer */}
            <div
              style={{
                background: "var(--color-bg-primary)",
                padding: "10px",
                textAlign: "center",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              🔒 Midnight Network Zero-Knowledge Protocol
            </div>
          </div>
        </div>
      )}
    </>
  );
};
