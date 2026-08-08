// =============================================================================
// components/CredentialDashboard.tsx – User Credential & Proof History (100% Working)
// =============================================================================

import React, { useState } from "react";
import type { Credential, EligibilityResult } from "../types/midnight";

interface CredentialDashboardProps {
  credentials: Credential[];
  eligibilityHistory: EligibilityResult[];
}

const CRED_TYPE_LABELS: Record<number, { label: string; icon: string; color: string }> = {
  0: { label: "Income Credential", icon: "₹", color: "var(--color-zk-blue)" },
  1: { label: "Age Credential", icon: "🎂", color: "var(--color-zk-violet)" },
  2: { label: "Credit Score Credential", icon: "📊", color: "var(--color-zk-cyan)" },
  3: { label: "Identity Credential", icon: "🪪", color: "var(--color-zk-green)" },
};

export const CredentialDashboard: React.FC<CredentialDashboardProps> = ({
  credentials,
  eligibilityHistory,
}) => {
  const [activeTab, setActiveTab] = useState<"credentials" | "history">("credentials");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Privacy Notice */}
      <div className="alert alert-info">
        <span>🔒</span>
        <div>
          <strong>Selective Disclosure Active:</strong> Your credentials store only cryptographic Pedersen hashes on-chain. Your exact financial or age values remain completely private in your wallet.
        </div>
      </div>

      {/* Internal Tabs */}
      <div style={{ display: "flex", gap: "8px", background: "var(--color-bg-input)", padding: "6px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
        <button
          className={`btn ${activeTab === "credentials" ? "btn-primary" : "btn-ghost"} btn-sm`}
          style={{ flex: 1 }}
          onClick={() => setActiveTab("credentials")}
        >
          🗂️ My Issued Credentials ({credentials.length})
        </button>
        <button
          className={`btn ${activeTab === "history" ? "btn-primary" : "btn-ghost"} btn-sm`}
          style={{ flex: 1 }}
          onClick={() => setActiveTab("history")}
        >
          📜 Verified Proof History ({eligibilityHistory.length})
        </button>
      </div>

      {/* Credentials List */}
      {activeTab === "credentials" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {credentials.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
              <p>No credentials found. Issue one using the Issuer Panel tab!</p>
            </div>
          ) : (
            credentials.map((cred) => {
              const info = CRED_TYPE_LABELS[cred.credType] || { label: "Credential", icon: "🔑", color: "var(--color-zk-blue)" };
              return (
                <div
                  key={cred.id}
                  className="card"
                  style={{
                    borderLeft: `4px solid ${cred.isRevoked ? "var(--color-error)" : info.color}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <span style={{ fontSize: "2rem" }}>{info.icon}</span>
                      <div>
                        <h4 style={{ margin: 0 }}>{info.label}</h4>
                        <div style={{ fontSize: "0.8125rem", fontFamily: "monospace", color: "var(--color-text-muted)", marginTop: "2px" }}>
                          ID: {cred.id}
                        </div>
                      </div>
                    </div>

                    <div>
                      {cred.isRevoked ? (
                        <span className="badge badge-error">REVOKED</span>
                      ) : (
                        <span className="badge badge-success">VALID & ACTIVE</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px", background: "var(--color-bg-input)", padding: "12px", borderRadius: "var(--radius-sm)" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Issuer Address:</span>
                      <span style={{ fontSize: "0.8125rem", fontFamily: "monospace", color: "var(--color-text-secondary)" }}>
                        {cred.issuer.slice(0, 14)}...
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>On-Chain Commitment (Value Hash):</span>
                      <span style={{ fontSize: "0.8125rem", fontFamily: "monospace", color: "var(--color-zk-cyan)" }}>
                        {cred.valueHash.slice(0, 16)}... 🔒
                      </span>
                    </div>
                  </div>

                  <div className="privacy-tag" style={{ marginTop: "12px", fontSize: "0.75rem" }}>
                    <span>🔒</span> Raw value is hidden inside witness commitment
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Proof History List */}
      {activeTab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {eligibilityHistory.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
              <p>No ZK proofs generated yet. Use the Prove Eligibility tab to generate one!</p>
            </div>
          ) : (
            eligibilityHistory.map((h, i) => (
              <div
                key={i}
                className="card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderLeft: `4px solid ${h.passed ? "var(--color-success)" : "var(--color-error)"}`,
                }}
              >
                <div>
                  <h4 style={{ margin: 0 }}>{h.purpose}</h4>
                  <div style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--color-text-muted)", marginTop: "4px" }}>
                    Tx: {h.txHash}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span className={h.passed ? "badge badge-success" : "badge-error"}>
                    {h.passed ? "PASSED (ELIGIBLE)" : "FAILED (BELOW REQ)"}
                  </span>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
                    Block #{h.checkedAt}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
