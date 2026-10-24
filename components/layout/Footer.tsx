import React from "react";
import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer style={{ marginTop: "auto", paddingBottom: "40px", paddingTop: "20px" }}>
      <div className="container-max">
        {/* Pink Closing Cushion as specified in design.md */}
        <div
          className="clay-cushion-pink"
          style={{
            textAlign: "center",
            marginBottom: "32px",
            padding: "52px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(2rem, 4.2vw, 3.2rem)",
              color: "var(--dp-color-ink)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            Have something to build?
          </h2>
          <p
            style={{
              fontSize: "1.12rem",
              color: "var(--dp-color-ink-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Describe what you need and discover people who might help you move forward.
          </p>
          <div style={{ marginTop: "8px", marginBottom: "6px" }}>
            <Link href="/discover">
              <button
                className="clay-btn"
                style={{
                  backgroundColor: "var(--dp-color-surface)",
                  color: "var(--dp-color-ink)",
                  boxShadow: "var(--clay-shadow-pill)",
                  padding: "14px 32px",
                  fontSize: "1.08rem",
                  borderRadius: "var(--dp-radius-control)",
                }}
              >
                Get started with Glimi
              </button>
            </Link>
          </div>
          <p
            style={{
              fontSize: "var(--dp-typography-metadata)",
              color: "var(--dp-color-ink)",
              fontWeight: 700,
              letterSpacing: "0.01em",
            }}
          >
            Glimi — developer discovery built around what you want to accomplish.
          </p>
        </div>

        {/* Cream Tray Footer */}
        <div className="clay-tray" style={{ padding: "48px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "36px",
              marginBottom: "36px",
            }}
          >
            {/* Brand Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "var(--dp-color-accent)",
                    boxShadow: "var(--clay-shadow-pill-pink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--dp-color-ink)",
                  }}
                >
                  <Sparkles size={16} strokeWidth={2.5} />
                </div>
                <span
                  style={{
                    fontFamily: "var(--dp-typography-face)",
                    fontSize: "1.35rem",
                    fontWeight: 800,
                    color: "var(--dp-color-ink)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  Glimi
                </span>
              </div>
              <p style={{ fontSize: "var(--dp-typography-small)", color: "var(--dp-color-ink-secondary)", maxWidth: "320px", lineHeight: 1.6 }}>
                Developer discovery built around what you want to accomplish. Profile metadata and public repository signals, presented with clear limits.
              </p>
            </div>

            {/* Discovery Pillars */}
            <div>
              <h4
                style={{
                  fontSize: "1.1rem",
                  color: "var(--dp-color-ink)",
                  marginBottom: "14px",
                  fontWeight: 700,
                }}
              >
                Discovery
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "var(--dp-typography-small)" }}>
                <Link href="/discover?intent=hackathons" style={{ color: "var(--dp-color-ink-secondary)" }}>
                  Hackathon Teammates
                </Link>
                <Link href="/discover?intent=side-projects" style={{ color: "var(--dp-color-ink-secondary)" }}>
                  Side Project Co-builders
                </Link>
                <Link href="/discover?intent=open-source" style={{ color: "var(--dp-color-ink-secondary)" }}>
                  Open Source Collaborators
                </Link>
                <Link href="/rescue" style={{ color: "var(--dp-color-ink-secondary)" }}>
                  Contributor Rescue
                </Link>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4
                style={{
                  fontSize: "1.1rem",
                  color: "var(--dp-color-ink)",
                  marginBottom: "14px",
                  fontWeight: 700,
                }}
              >
                Platform
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "var(--dp-typography-small)" }}>
                <Link href="/manifesto" style={{ color: "var(--dp-color-ink-secondary)" }}>
                  Evidence Not Resumes
                </Link>
                <Link href="/connections" style={{ color: "var(--dp-color-ink-secondary)" }}>
                  Connections & Messages
                </Link>
                <Link href="/privacy" style={{ color: "var(--dp-color-ink-secondary)" }}>
                  Privacy & Data Consent
                </Link>
              </div>
            </div>

            {/* Standards */}
            <div>
              <h4
                style={{
                  fontSize: "1.1rem",
                  color: "var(--dp-color-ink)",
                  marginBottom: "14px",
                  fontWeight: 700,
                }}
              >
                Standards
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "var(--dp-typography-metadata)", color: "var(--dp-color-ink-secondary)" }}>
                <p>• Profile data synced from GitHub</p>
                <p>• Evidence labels, not endorsements</p>
                <p>• Contact shared after acceptance</p>
                <p>• Discoverability toggle</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              borderTop: "1px solid rgba(56, 49, 57, 0.08)",
              paddingTop: "24px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              fontSize: "var(--dp-typography-metadata)",
              color: "var(--dp-color-ink-secondary)",
            }}
          >
            <p>© 2026 Glimi · All rights reserved.</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>Crafted for developers with</span>
              <Heart size={14} color="var(--dp-color-accent)" fill="var(--dp-color-accent)" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
