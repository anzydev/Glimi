import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ShieldCheck, Eye, Lock, Database, Sparkles } from "lucide-react";

export default function PrivacyPage() {
  return (
    <AppShell>
      <div className="container-max" style={{ paddingTop: "48px", paddingBottom: "80px", maxWidth: "860px" }}>
        <div style={{ display: "inline-flex", marginBottom: "16px" }}>
          <span className="ai-badge">
            <ShieldCheck size={13} /> Privacy & Developer Consent
          </span>
        </div>
        <h1 style={{ marginBottom: "18px", fontSize: "clamp(2.4rem, 4vw, 3.2rem)" }}>
          Your Data, Transparent & Under Your Control.
        </h1>
        <p style={{ fontSize: "1.15rem", color: "var(--dp-color-ink-secondary)", lineHeight: 1.7, marginBottom: "36px" }}>
          Glimi is built for developers by developers. We believe you should have absolute clarity on what information is gathered, how project evidence is distinguished from claims, and how to manage or delete your profile at any time.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          {/* Card 1 */}
          <div className="clay-cushion-cream" style={{ padding: "30px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "var(--dp-color-surface-support)",
                  boxShadow: "var(--clay-shadow-mint)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1d5c2c",
                }}
              >
                <Eye size={20} />
              </div>
              <h2 style={{ fontSize: "1.35rem", color: "var(--dp-color-ink)" }}>
                Public Repositories & Artifacts Only
              </h2>
            </div>
            <p style={{ color: "var(--dp-color-ink-secondary)", lineHeight: 1.65, fontSize: "1rem" }}>
              Glimi only indexes public repositories and publicly accessible GitHub metadata. We never request permission to view private repositories, enterprise codebases, or proprietary team commits.
            </p>
          </div>

          {/* Card 2 */}
          <div className="clay-cushion-cream" style={{ padding: "30px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "var(--dp-color-accent)",
                  boxShadow: "var(--clay-shadow-pink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--dp-color-ink)",
                }}
              >
                <Lock size={20} />
              </div>
              <h2 style={{ fontSize: "1.35rem", color: "var(--dp-color-ink)" }}>
                Instant Discoverability Toggle
              </h2>
            </div>
            <p style={{ color: "var(--dp-color-ink-secondary)", lineHeight: 1.65, fontSize: "1rem" }}>
              You can toggle your profile off from search at any moment directly from your profile settings. When hidden, your profile is immediately excluded from all discovery queries and match algorithms.
            </p>
          </div>

          {/* Card 3 */}
          <div className="clay-cushion-cream" style={{ padding: "30px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "var(--dp-color-surface-support)",
                  boxShadow: "var(--clay-shadow-mint)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1d5c2c",
                }}
              >
                <Sparkles size={20} />
              </div>
              <h2 style={{ fontSize: "1.35rem", color: "var(--dp-color-ink)" }}>
                AI-Assisted Search & External Processing
              </h2>
            </div>
            <p style={{ color: "var(--dp-color-ink-secondary)", lineHeight: 1.65, fontSize: "1rem" }}>
              When you use AI-assisted discovery, the project description you type is sent to our configured NVIDIA NIM endpoint to extract skills and preferences. GitHub sync may also send public repository names, languages, topics, and descriptions to that endpoint for summaries and embeddings. Do not include secrets, private code, or confidential project details in search prompts.
            </p>
            <p style={{ color: "var(--dp-color-ink-secondary)", lineHeight: 1.65, fontSize: "1rem", marginTop: "10px" }}>
              AI processing is optional: if the provider is unavailable, discovery falls back to local keyword scoring and public metadata. Provider-side logging and retention are governed by the NVIDIA endpoint configuration used by the operator.
            </p>
          </div>

          {/* Card 4 */}
          <div className="clay-cushion-cream" style={{ padding: "30px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "var(--dp-color-surface-compare)",
                  boxShadow: "var(--clay-shadow-lavender)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#5b3b82",
                }}
              >
                <Database size={20} />
              </div>
              <h2 style={{ fontSize: "1.35rem", color: "var(--dp-color-ink)" }}>
                Right to Complete Erasure
              </h2>
            </div>
            <p style={{ color: "var(--dp-color-ink-secondary)", lineHeight: 1.65, fontSize: "1rem" }}>
              Deleting your account permanently purges your profile, stored repositories, vectorized embeddings, and connection requests from our database.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
