// =============================================================================
// App.tsx – PrivPass Main Application (100% Interactive & High Aesthetic)
// =============================================================================

import { useState } from "react";
import { useMidnight } from "./hooks/useMidnight";
import { WalletConnect } from "./components/WalletConnect";
import { EligibilityProver } from "./components/EligibilityProver";
import { CredentialDashboard } from "./components/CredentialDashboard";
import { IssuerPanel } from "./components/IssuerPanel";
import type { Credential, EligibilityResult } from "./types/midnight";
import "./App.css";

const INITIAL_CREDENTIALS: Credential[] = [
  {
    id: "0xcred1234567890abcdef1234567890abcdef1234",
    type: "income",
    credType: 0,
    issuer: "0xissuer8888888888abcdef8888888888abcdef88",
    holder: "0xholder1234567890abcdef1234567890abcdef12",
    expiryBlock: 999999,
    isRevoked: false,
    valueHash: "0xcommitedhashincome600k0000000000000000000000000000000000000",
  },
  {
    id: "0xcred2222222222abcdef2222222222abcdef2222",
    type: "age",
    credType: 1,
    issuer: "0xissuer8888888888abcdef8888888888abcdef88",
    holder: "0xholder1234567890abcdef1234567890abcdef12",
    expiryBlock: 999999,
    isRevoked: false,
    valueHash: "0xcommitedhashage24yrs000000000000000000000000000000000000000",
  },
];

const INITIAL_HISTORY: EligibilityResult[] = [
  {
    holder: "0xholder1234567890abcdef1234567890abcdef12",
    purpose: "Income Eligibility (≥ ₹5 Lakhs)",
    passed: true,
    checkedAt: 148293,
    txHash: "0xtxproof9999999999abcdef9999999999abcdef99",
  },
];

type Tab = "prove" | "credentials" | "issuer" | "about";

function App() {
  const midnight = useMidnight();
  const [activeTab, setActiveTab] = useState<Tab>("prove");

  const [credentials, setCredentials] = useState<Credential[]>(INITIAL_CREDENTIALS);
  const [proofHistory, setProofHistory] = useState<EligibilityResult[]>(INITIAL_HISTORY);

  const { connectionState } = midnight;
  const isConnected = connectionState.status === "connected";


  // Dynamic handlers so buttons update state in real time
  const handleAddProofSuccess = (res: {
    purpose: string;
    passed: boolean;
    txHash: string;
    checkedAt: number;
  }) => {
    const newEntry: EligibilityResult = {
      holder: isConnected ? connectionState.address : "0xholder123456...",
      purpose: res.purpose,
      passed: res.passed,
      checkedAt: res.checkedAt,
      txHash: res.txHash,
    };
    setProofHistory((prev) => [newEntry, ...prev]);
  };

  const handleIssueCredential = (newCred: Credential) => {
    setCredentials((prev) => [newCred, ...prev]);
  };

  const handleRevokeCredential = (credId: string) => {
    setCredentials((prev) =>
      prev.map((c) => (c.id === credId ? { ...c, isRevoked: true } : c))
    );
  };

  const triggerConnect = () => {
    midnight.connect();
  };

  return (
    <div className="app">
      {/* ── Top Announcement Bar ────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(90deg, #7c3aed, #2563eb, #06b6d4)",
          padding: "6px 12px",
          textAlign: "center",
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "#fff",
        }}
      >
        ⬡ INTO the Midnight — SPPU Bootcamp Project | Native Compact Zero-Knowledge DApp
      </div>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="logo-icon">
                <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                  <polygon points="16,2 30,26 2,26" stroke="url(#grad)" strokeWidth="2.5" fill="none" />
                  <polygon points="16,8 24,22 8,22" fill="url(#grad)" opacity="0.75" />
                  <circle cx="16" cy="16" r="3.5" fill="#ffffff" />
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="50%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <h1 className="app-title gradient-text">PrivPass</h1>
                <div className="app-subtitle">Zero-Knowledge Credential Verification</div>
              </div>
            </div>

            {/* Wallet Connector Header component */}
            <div>
              <WalletConnect midnight={midnight} />
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero Banner ────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="badge badge-purple" style={{ marginBottom: 16 }}>
              ⬡ Midnight Blockchain · Compact ZK Language
            </div>

            <h2 style={{ marginBottom: 16, fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}>
              Prove It. <span className="gradient-text">Without Revealing It.</span>
            </h2>

            <p style={{ maxWidth: 620, margin: "0 auto 24px", fontSize: "1.0625rem", color: "var(--color-text-secondary)" }}>
              PrivPass allows you to prove your income, age, or credit score eligibility to lenders or service providers — <strong>without sharing your actual personal data</strong>.
            </p>

            {/* On-chain Statistics */}
            <div
              style={{
                display: "flex",
                gap: 24,
                justifyContent: "center",
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              {[
                { label: "Credentials Issued", value: credentials.length },
                { label: "ZK Proofs Verified", value: proofHistory.length },
                { label: "Network State", value: "Preview Testnet" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "rgba(17, 24, 39, 0.7)",
                    border: "1px solid var(--color-border)",
                    padding: "10px 20px",
                    borderRadius: "var(--radius-md)",
                    textAlign: "center",
                  }}
                >
                  <div className="gradient-text" style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700 }}>
                    {value}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Feature Pills */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <span className="badge badge-cyan">🔒 Private Witness Inputs</span>
              <span className="badge badge-purple">⚡ Groth16 ZK Circuits</span>
              <span className="badge badge-success">🛡️ Zero Data Leakage</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <main className="app-main">
        <div className="container">
          {/* Navigation Bar */}
          <nav className="tabs-nav">
            {[
              { key: "prove" as Tab, label: "⚡ Prove Eligibility", icon: "⚡" },
              { key: "credentials" as Tab, label: `🗂️ My Credentials (${credentials.length})`, icon: "🗂️" },
              { key: "issuer" as Tab, label: "🔏 Issuer Panel", icon: "🔏" },
              { key: "about" as Tab, label: "ℹ️ How It Works", icon: "ℹ️" },
            ].map(({ key, label }) => (
              <button
                key={key}
                id={`nav-${key}`}
                className={`tab-btn ${activeTab === key ? "tab-btn-active" : ""}`}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Tab Views */}
          <div className="tab-content">
            {/* ── TAB 1: Prove Eligibility ── */}
            {activeTab === "prove" && (
              <div className="two-col-layout">
                <div className="content-panel">
                  <EligibilityProver
                    connectorApi={midnight.connectorApi}
                    holderAddress={isConnected ? connectionState.address : "0xholder..."}
                    onProofSuccess={handleAddProofSuccess}
                    onConnectClick={triggerConnect}
                  />
                </div>

                <div className="sidebar-panel">
                  <div className="card">
                    <h3 style={{ marginBottom: 16 }}>🔒 ZK Privacy Rules</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.875rem" }}>
                      <div>
                        <strong>1. Private State</strong>
                        <p style={{ margin: 0, fontSize: "0.8125rem" }}>Your raw income/age is held only in private witness memory.</p>
                      </div>
                      <div>
                        <strong>2. Compact Circuit</strong>
                        <p style={{ margin: 0, fontSize: "0.8125rem" }}>Evaluates `actual &gt;= threshold` without disclosing `actual`.</p>
                      </div>
                      <div>
                        <strong>3. On-Chain Ledger</strong>
                        <p style={{ margin: 0, fontSize: "0.8125rem" }}>Records only `true` or `false` on the Midnight blockchain.</p>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ marginTop: 16 }}>
                    <h3 style={{ marginBottom: 12 }}>📡 Contract Details</h3>
                    <div style={{ fontSize: "0.8125rem" }}>
                      <div style={{ marginBottom: 6 }}>
                        <span style={{ color: "var(--color-text-muted)" }}>Network: </span>
                        <span className="badge badge-success">Preview</span>
                      </div>
                      <div style={{ marginBottom: 6 }}>
                        <span style={{ color: "var(--color-text-muted)" }}>Contract ID: </span>
                        <code style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>0xprivpass7f8e9d...</code>
                      </div>
                      <div>
                        <span style={{ color: "var(--color-text-muted)" }}>Language: </span>
                        <span style={{ color: "var(--color-zk-violet)", fontWeight: 600 }}>Compact 0.14+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: My Credentials ── */}
            {activeTab === "credentials" && (
              <CredentialDashboard
                credentials={credentials}
                eligibilityHistory={proofHistory}
              />
            )}

            {/* ── TAB 3: Issuer Panel ── */}
            {activeTab === "issuer" && (
              <IssuerPanel
                connectorApi={midnight.connectorApi}
                onIssueCredential={handleIssueCredential}
                onRevokeCredential={handleRevokeCredential}
                onConnectClick={triggerConnect}
              />
            )}

            {/* ── TAB 4: How It Works ── */}
            {activeTab === "about" && (
              <div className="card" style={{ maxWidth: 800, margin: "0 auto" }}>
                <h2>How PrivPass Works on Midnight Network</h2>
                <p style={{ marginTop: 12, lineHeight: 1.7 }}>
                  Traditional credential verification forces users to hand over raw bank statements, IDs, and tax documents. 
                  PrivPass replaces this with <strong>Zero-Knowledge Proofs (ZKPs)</strong> built on Midnight Network using the Compact language.
                </p>

                <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
                  <div style={{ background: "var(--color-bg-input)", padding: 16, borderRadius: "var(--radius-md)" }}>
                    <h4 style={{ color: "var(--color-zk-cyan)" }}>1. Authorized Issuer Signs Commitment</h4>
                    <p style={{ margin: 0, fontSize: "0.875rem" }}>An authorized bank or entity issues a credential. The value is hashed with a blinding salt (`valueHash = hash(value ++ salt ++ holder)`). Only the commitment is stored on-chain.</p>
                  </div>

                  <div style={{ background: "var(--color-bg-input)", padding: 16, borderRadius: "var(--radius-md)" }}>
                    <h4 style={{ color: "var(--color-zk-violet)" }}>2. User Generates ZK Proof Locally</h4>
                    <p style={{ margin: 0, fontSize: "0.875rem" }}>When applying for a loan, the user inputs their private value locally. The Midnight ZK circuit proves `value &gt;= threshold` without disclosing the value.</p>
                  </div>

                  <div style={{ background: "var(--color-bg-input)", padding: 16, borderRadius: "var(--radius-md)" }}>
                    <h4 style={{ color: "var(--color-success)" }}>3. Smart Contract Discloses Boolean Result</h4>
                    <p style={{ margin: 0, fontSize: "0.875rem" }}>The Midnight contract verifies the proof using `disclose(eligible)` and records `passed: true/false` on the ledger.</p>
                  </div>
                </div>

                <div className="privacy-tag" style={{ marginTop: 24, display: "inline-flex" }}>
                  <span>🔒</span> Proved without revealing your input
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="app-footer">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <strong className="gradient-text">PrivPass</strong> · Midnight Network ZK DApp
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
              INTO the Midnight — SPPU Bootcamp Project (Rise In)
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
