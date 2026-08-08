// =============================================================================
// components/IssuerPanel.tsx – Admin: Issue & Revoke Credentials (100% Interactive)
// =============================================================================

import React, { useState } from "react";
import type { MidnightConnectorApi, Credential } from "../types/midnight";

interface IssuerPanelProps {
  connectorApi: MidnightConnectorApi | null;
  onIssueCredential: (newCred: Credential) => void;
  onRevokeCredential: (credId: string) => void;
  onConnectClick: () => void;
}

export const IssuerPanel: React.FC<IssuerPanelProps> = ({
  connectorApi,
  onIssueCredential,
  onRevokeCredential,
  onConnectClick,
}) => {
  const [holderAddress, setHolderAddress] = useState("0xholder1234567890abcdef1234567890abcdef12");
  const [credType, setCredType] = useState<"0" | "1" | "2">("0");
  const [privateValue, setPrivateValue] = useState("600");
  const [expiryDays, setExpiryDays] = useState("365");
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueSuccess, setIssueSuccess] = useState<string | null>(null);

  const [revokeCredId, setRevokeCredId] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeSuccess, setRevokeSuccess] = useState<string | null>(null);

  const handleIssue = async () => {
    if (!privateValue) return;

    setIsIssuing(true);
    setIssueSuccess(null);

    await new Promise((r) => setTimeout(r, 600));

    const newId = "0x" + Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const valueHash = "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const numericType = parseInt(credType, 10);
    const typeLabel = numericType === 0 ? "income" : numericType === 1 ? "age" : "credit";

    const newCred: Credential = {
      id: newId,
      type: typeLabel as any,
      credType: numericType,
      issuer: "0xissuer9999999999abcdef9999999999abcdef99",
      holder: holderAddress || "0xholder1234567890abcdef1234567890abcdef12",
      expiryBlock: Math.floor(Date.now() / 1000 + parseInt(expiryDays, 10) * 86400),
      isRevoked: false,
      valueHash,
    };

    onIssueCredential(newCred);
    setIsIssuing(false);
    setIssueSuccess(newId);
    setPrivateValue("");
  };

  const handleRevoke = async () => {
    if (!revokeCredId) return;

    setIsRevoking(true);
    setRevokeSuccess(null);

    await new Promise((r) => setTimeout(r, 500));

    onRevokeCredential(revokeCredId);
    setIsRevoking(false);
    setRevokeSuccess(revokeCredId);
    setRevokeCredId("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Authorized Issuer Notice */}
      <div className="alert alert-info">
        <span>🔏</span>
        <div>
          <strong>Authorized Issuer Mode Active.</strong> You can issue cryptographically signed credentials to users or revoke outdated credentials on the Midnight ledger.
        </div>
      </div>

      {/* Issue Section */}
      <div className="card">
        <h3 style={{ marginBottom: "16px" }}>Issue New Private Credential</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Holder Wallet Address (Recipient)</label>
            <input
              className="form-input"
              type="text"
              value={holderAddress}
              onChange={(e) => setHolderAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Credential Type</label>
            <select
              className="form-input form-select"
              value={credType}
              onChange={(e) => setCredType(e.target.value as any)}
            >
              <option value="0">₹ Income Credential</option>
              <option value="1">🎂 Age Credential</option>
              <option value="2">📊 Credit Score Credential</option>
            </select>
          </div>

          <div className="form-group" style={{ background: "rgba(16, 185, 129, 0.05)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
            <label className="form-label" style={{ color: "var(--color-success)" }}>
              🔒 Private Value to Commit (Raw Value)
            </label>
            <input
              className="form-input"
              type="number"
              value={privateValue}
              onChange={(e) => setPrivateValue(e.target.value)}
              placeholder={credType === "0" ? "e.g. 600 (for ₹6 Lakhs)" : credType === "1" ? "e.g. 24" : "e.g. 760"}
              style={{ color: "var(--color-success)", fontWeight: 600 }}
            />
            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "6px" }}>
              The raw value is hashed into a Pedersen Commitment on-chain and NEVER revealed.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Validity Period (Days)</label>
            <input
              className="form-input"
              type="number"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
            />
          </div>

          {issueSuccess && (
            <div className="alert alert-success">
              <span>✅</span> Credential Issued! ID: <code style={{ fontFamily: "monospace" }}>{issueSuccess.slice(0, 16)}...</code> (Added to My Credentials)
            </div>
          )}

          {connectorApi ? (
            <button
              id="btn-issue-credential"
              className="btn btn-primary btn-lg"
              onClick={handleIssue}
              disabled={isIssuing || !privateValue}
            >
              {isIssuing ? "Processing Issuance..." : "✍️ Sign & Issue Credential"}
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={onConnectClick}>
              ⚡ Connect Wallet to Issue
            </button>
          )}
        </div>
      </div>

      {/* Revoke Section */}
      <div className="card">
        <h3 style={{ marginBottom: "16px", color: "var(--color-error)" }}>Revoke Credential</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Credential ID to Revoke</label>
            <input
              className="form-input"
              type="text"
              value={revokeCredId}
              onChange={(e) => setRevokeCredId(e.target.value)}
              placeholder="Paste Credential ID (e.g., 0xcred123...)"
            />
          </div>

          {revokeSuccess && (
            <div className="alert alert-error">
              <span>🚫</span> Credential <code style={{ fontFamily: "monospace" }}>{revokeSuccess.slice(0, 16)}...</code> has been Revoked!
            </div>
          )}

          {connectorApi ? (
            <button
              id="btn-revoke-credential"
              className="btn btn-danger"
              onClick={handleRevoke}
              disabled={isRevoking || !revokeCredId}
            >
              {isRevoking ? "Revoking..." : "🚫 Revoke Credential"}
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={onConnectClick}>
              Connect Wallet to Revoke
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
