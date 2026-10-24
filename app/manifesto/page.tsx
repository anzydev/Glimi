import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Sparkles, ShieldCheck, Code2, Users, Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ManifestoPage() {
  return (
    <AppShell>
      <div className="container-max" style={{ paddingTop: "48px", paddingBottom: "80px", maxWidth: "860px" }}>
        <div style={{ display: "inline-flex", marginBottom: "16px" }}>
          <span className="ai-badge">
            <Compass size={13} /> The Glimi Philosophy
          </span>
        </div>
        <h1 style={{ marginBottom: "18px", fontSize: "clamp(2.4rem, 4vw, 3.4rem)" }}>
          Better discovery starts with better information.
        </h1>
        <p style={{ fontSize: "1.15rem", color: "var(--dp-color-ink-secondary)", lineHeight: 1.7, marginBottom: "36px" }}>
          Finding the right collaborator is not just about finding someone who knows the same programming language. It is about finding someone with the relevant skills, interests, experience, and willingness to work on your goal. Glimi was built from first principles around what developers actually want to accomplish.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Principle 1 */}
          <div className="clay-cushion-mint" style={{ padding: "32px 30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <Code2 size={24} color="#1d5c2c" />
              <h2 style={{ fontSize: "1.45rem", color: "var(--dp-color-ink)" }}>
                1. Distinguish Project Evidence from Claims
              </h2>
            </div>
            <p style={{ color: "var(--dp-color-ink-secondary)", lineHeight: 1.65, fontSize: "1.05rem" }}>
              A public GitHub profile is not the complete picture of a developer&apos;s abilities, and self-reported skills are not verified proof. On Glimi, we present profiles, self-reported skills, and available project evidence transparently, without claiming that a match guarantees someone&apos;s expertise or that a project has been independently verified when it has not.
            </p>
          </div>

          {/* Principle 2 */}
          <div className="clay-cushion-lavender" style={{ padding: "32px 30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <Sparkles size={24} color="#5b3b82" />
              <h2 style={{ fontSize: "1.45rem", color: "var(--dp-color-ink)" }}>
                2. Goal-Based Discovery
              </h2>
            </div>
            <p style={{ color: "var(--dp-color-ink-secondary)", lineHeight: 1.65, fontSize: "1.05rem" }}>
              You should not need to know which job title or keyword permutation to search for. You describe what you want to build and explain what kind of help you need. Glimi connects your goal with developers who have relevant skills, domain interests, and availability.
            </p>
          </div>

          {/* Principle 3 */}
          <div className="clay-cushion-yellow" style={{ padding: "32px 30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <Users size={24} color="#7a5210" />
              <h2 style={{ fontSize: "1.45rem", color: "var(--dp-color-ink)" }}>
                3. Willingness & Availability First
              </h2>
            </div>
            <p style={{ color: "var(--dp-color-ink-secondary)", lineHeight: 1.65, fontSize: "1.05rem" }}>
              Someone with an impressive profile might not have the time to collaborate, while someone looking for opportunities might have specific availability. Glimi factors in explicit collaboration intents (hackathons, weekend side-projects, open-source) so you only connect with people who actually want to build.
            </p>
          </div>

          {/* Principle 4 */}
          <div className="clay-cushion-blue" style={{ padding: "32px 30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <ShieldCheck size={24} color="#1c4873" />
              <h2 style={{ fontSize: "1.45rem", color: "var(--dp-color-ink)" }}>
                4. Contextual Consent Over Cold Spam
              </h2>
            </div>
            <p style={{ color: "var(--dp-color-ink-secondary)", lineHeight: 1.65, fontSize: "1.05rem" }}>
              Blind recruiter blasts and generic &ldquo;let&apos;s connect&rdquo; messages are prohibited. Every connection request carries real project context: why you matched, what you are building, and what help is needed. Both parties must mutually agree before private contacts are shared.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: "48px", textAlign: "center" }}>
          <Link href="/discover">
            <Button variant="primary" size="lg">
              Explore Developer Discovery
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
