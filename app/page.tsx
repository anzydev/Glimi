"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { signInWithGitHub } from "@/lib/auth/signIn";
import {
  Sparkles,
  ArrowRight,
  Code2,
  Users2,
  LifeBuoy,
  Search,
  Compass,
  Check,
  Plus,
  Minus,
} from "lucide-react";
import { GithubIcon } from "@/components/icons/BrandIcons";

export default function HomePage() {
  const [openDisclosure, setOpenDisclosure] = useState<number | null>(0);
  const [isExchangingCode, setIsExchangingCode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        setIsExchangingCode(true);
        window.location.href = `/auth/callback${window.location.search}`;
        return;
      }

      const authStatus = params.get("auth");
      if (authStatus === "failed") {
        setAuthError("GitHub authentication was canceled or failed. Please try again.");
      } else if (authStatus === "unconfigured") {
        setAuthError("Supabase authentication is not configured yet.");
      }
    }
  }, []);

  const handleGitHubSignIn = async () => {
    await signInWithGitHub("/discover");
  };

  const toggleDisclosure = (index: number) => {
    setOpenDisclosure((prev) => (prev === index ? null : index));
  };

  if (isExchangingCode) {
    return (
      <AppShell>
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
          }}
        >
          <div
            className="clay-cushion-lavender"
            style={{
              padding: "40px 48px",
              textAlign: "center",
              maxWidth: "460px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px auto",
                boxShadow: "var(--clay-shadow-pill)",
              }}
            >
              <Sparkles size={24} color="var(--dp-color-ink)" />
            </div>
            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                marginBottom: "8px",
                color: "var(--dp-color-ink)",
              }}
            >
              Completing GitHub Sign-In...
            </h2>
            <p
              style={{
                fontSize: "0.95rem",
                color: "var(--dp-color-ink-secondary)",
                margin: 0,
              }}
            >
              Exchanging your authentication token and taking you to your workspace.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {authError && (
        <div className="container-max" style={{ paddingTop: "16px" }}>
          <div
            className="clay-cushion-pink"
            style={{
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--dp-color-ink)" }}>
              {authError}
            </span>
            <button
              type="button"
              onClick={() => setAuthError(null)}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "var(--dp-color-ink)",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {/* ── 1. Hero: Clear Headline Explaining What Glimi Does + Problem Context ── */}
      <section style={{ paddingTop: "24px", paddingBottom: "36px" }}>
        <div className="container-max">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              alignItems: "stretch",
              gap: "28px",
            }}
          >
            {/* Left: Large Pink Cushion Carrying Headline & Actions */}
            <div
              className="clay-cushion-pink"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "48px 40px",
              }}
            >
              <div style={{ display: "inline-flex", marginBottom: "20px" }}>
                <span
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    padding: "6px 16px",
                    borderRadius: "var(--dp-radius-control)",
                    boxShadow: "var(--clay-shadow-pill)",
                    fontSize: "var(--dp-typography-metadata)",
                    fontWeight: 700,
                    color: "var(--dp-color-ink)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Sparkles size={14} /> Developer Discovery
                </span>
              </div>

              <h1
                style={{
                  fontSize: "clamp(2.4rem, 4.8vw, 4.2rem)",
                  lineHeight: 1.08,
                  marginBottom: "22px",
                  color: "var(--dp-color-ink)",
                  letterSpacing: "-0.035em",
                  fontWeight: 800,
                }}
              >
                Find people who can help you build what you have in mind.
              </h1>

              <p
                style={{
                  fontSize: "1.08rem",
                  color: "var(--dp-color-ink-secondary)",
                  lineHeight: 1.62,
                  marginBottom: "20px",
                  maxWidth: "540px",
                }}
              >
                Finding the right collaborator is not just about finding someone who knows the same programming language. It is about finding someone with the relevant skills, interests, experience, and willingness to work on your goal.
              </p>

              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.45)",
                  borderRadius: "20px",
                  padding: "14px 18px",
                  marginBottom: "28px",
                  borderLeft: "4px solid var(--dp-color-ink)",
                  boxShadow: "inset 1px 1px 3px rgba(255, 255, 255, 0.7)",
                }}
              >
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--dp-color-ink)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Describe what you want to build. Explain what kind of help you need. Discover people who may be a good fit.
                </p>
              </div>

              {/* Clear Actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  flexWrap: "wrap",
                }}
              >
                <Link href="/discover">
                  <Button
                    variant="secondary"
                    size="lg"
                    rightIcon={<ArrowRight size={18} />}
                  >
                    Explore Glimi
                  </Button>
                </Link>

                <a href="#how-it-works">
                  <Button variant="ghost" size="lg">
                    How it works
                  </Button>
                </a>

                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<GithubIcon size={18} />}
                  onClick={handleGitHubSignIn}
                >
                  Connect GitHub
                </Button>
              </div>
            </div>

            {/* Right: Cluster of Rounded Clay Objects / Visual Sculpture */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                justifyContent: "center",
              }}
            >
              {/* Molded Object 1: Lavender Cushion Illustrating Goal Inquiry */}
              <div
                className="clay-cushion-lavender"
                style={{
                  padding: "30px 28px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "#ffffff",
                        boxShadow: "var(--clay-shadow-pill)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Search size={16} color="var(--dp-color-ink)" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--dp-color-ink)" }}>
                      Goal-Driven Discovery
                    </span>
                  </div>
                  <span
                    style={{
                      backgroundColor: "var(--dp-color-surface-support)",
                      padding: "4px 12px",
                      borderRadius: "var(--dp-radius-control)",
                      boxShadow: "var(--clay-shadow-mint)",
                      fontSize: "var(--dp-typography-caption)",
                      fontWeight: 700,
                      color: "var(--dp-color-ink)",
                    }}
                  >
                    HOW IT CONNECTS
                  </span>
                </div>

                <div className="clay-inset-well" style={{ padding: "16px 18px", marginBottom: "14px" }}>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--dp-color-ink)",
                      lineHeight: 1.55,
                    }}
                  >
                    &ldquo;Building a distributed storage engine with async Rust. Looking for a collaborator interested in systems architecture and available for a weekend project.&rdquo;
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    fontSize: "0.82rem",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "14px",
                      padding: "8px 12px",
                      boxShadow: "var(--clay-shadow-pill)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "var(--dp-color-ink)",
                      fontWeight: 600,
                    }}
                  >
                    <span>✓ Skills & Domain</span>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "14px",
                      padding: "8px 12px",
                      boxShadow: "var(--clay-shadow-pill)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "var(--dp-color-ink)",
                      fontWeight: 600,
                    }}
                  >
                    <span>✓ Availability Match</span>
                  </div>
                </div>
              </div>

              {/* Overlapping Sub-Cluster: Mint & Yellow Rounded Cushions */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "18px",
                }}
              >
                <div className="clay-cushion-mint" style={{ padding: "22px 20px" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.4rem", color: "var(--dp-color-ink)", lineHeight: 1.15 }}>
                    Skills & Evidence
                  </div>
                  <p style={{ fontSize: "var(--dp-typography-caption)", color: "var(--dp-color-ink-secondary)", marginTop: "6px", lineHeight: 1.45 }}>
                    Relevant background and independently available project evidence.
                  </p>
                </div>

                <div className="clay-cushion-yellow" style={{ padding: "22px 20px" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.4rem", color: "var(--dp-color-ink)", lineHeight: 1.15 }}>
                    Interests & Goals
                  </div>
                  <p style={{ fontSize: "var(--dp-typography-caption)", color: "var(--dp-color-ink-secondary)", marginTop: "6px", lineHeight: 1.45 }}>
                    Aligned working style, stated focus, and willingness to collaborate.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Small Supporting Fact Cushions Beneath Hero */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "18px",
              marginTop: "24px",
            }}
          >
            {[
              {
                color: "mint",
                icon: <Code2 size={18} color="#1d5c2c" />,
                title: "Relevant Skills",
                desc: "Project evidence and technical background",
              },
              {
                color: "lavender",
                icon: <Sparkles size={18} color="#5b3b82" />,
                title: "Shared Interests",
                desc: "Genuine enthusiasm for what you want to build",
              },
              {
                color: "yellow",
                icon: <Compass size={18} color="#7a5210" />,
                title: "Demonstrated Experience",
                desc: "History of working on similar technical challenges",
              },
              {
                color: "blue",
                icon: <Users2 size={18} color="#1c4873" />,
                title: "Willingness to Work",
                desc: "Stated availability and collaboration preferences",
              },
            ].map((fact, i) => (
              <div
                key={i}
                className={`clay-cushion-${fact.color}`}
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    boxShadow: "var(--clay-shadow-pill)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {fact.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "var(--dp-typography-small)", color: "var(--dp-color-ink)" }}>
                    {fact.title}
                  </div>
                  <div style={{ fontSize: "var(--dp-typography-caption)", color: "var(--dp-color-ink-secondary)", marginTop: "2px" }}>
                    {fact.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Why Glimi? Short, Natural Explanation of the Problem + Use Cases ── */}
      <section style={{ padding: "36px 0" }}>
        <div className="container-max">
          <div className="clay-tray">
            {/* Header */}
            <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 48px auto" }}>
              <span className="ai-badge" style={{ marginBottom: "14px" }}>
                <Compass size={13} /> Why Glimi?
              </span>
              <h2 style={{ marginBottom: "16px", fontSize: "clamp(2rem, 3.6vw, 2.8rem)" }}>
                Finding the right person takes more than searching a profile.
              </h2>
              <p style={{ fontSize: "1.1rem", color: "var(--dp-color-ink-secondary)", lineHeight: 1.65 }}>
                A developer might have the skills you need but no public portfolio. Someone with an impressive GitHub profile might not be available to collaborate. And a person who is technically capable may be looking for a completely different kind of opportunity.
              </p>
              <p style={{ fontSize: "1.05rem", color: "var(--dp-color-ink)", fontWeight: 600, marginTop: "12px" }}>
                Glimi aims to bring these details together so you can make more informed decisions about whom to approach.
              </p>
            </div>

            {/* Unequal Feature Arrangement: Larger Context Item Beside Use Cases */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "28px",
                alignItems: "stretch",
              }}
            >
              {/* Larger Context Item */}
              <div
                className="clay-cushion-mint"
                style={{
                  padding: "40px 36px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      boxShadow: "var(--clay-shadow-pill)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#1d5c2c",
                      marginBottom: "20px",
                    }}
                  >
                    <Code2 size={26} />
                  </div>
                  <h3 style={{ fontSize: "1.8rem", marginBottom: "14px", color: "var(--dp-color-ink)", letterSpacing: "-0.02em" }}>
                    A More Complete Picture
                  </h3>
                  <p style={{ fontSize: "1.05rem", color: "var(--dp-color-ink-secondary)", lineHeight: 1.65 }}>
                    Keyword searches treat listed tools as uniform facts. Glimi looks at what you want to build and helps connect you with collaborators based on four critical factors: skills, interests, experience, and willingness to work.
                  </p>
                </div>

                <div className="clay-inset-well" style={{ marginTop: "28px", padding: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.92rem", color: "var(--dp-color-ink)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Check size={16} color="#1d5c2c" />
                      <span><strong>Skills:</strong> Relevant technical capabilities and background</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Check size={16} color="#1d5c2c" />
                      <span><strong>Interests:</strong> Genuine alignment with the problem domain</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Check size={16} color="#1d5c2c" />
                      <span><strong>Experience:</strong> Track record with similar challenges</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Check size={16} color="#1d5c2c" />
                      <span><strong>Willingness:</strong> Stated availability and collaboration intent</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* A Few Relevant Use Cases */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ marginBottom: "6px" }}>
                  <h3 style={{ fontSize: "1.3rem", color: "var(--dp-color-ink)", fontWeight: 700 }}>
                    What can you use Glimi for?
                  </h3>
                </div>

                {/* Use Case 1: Find project collaborators */}
                <div className="clay-cushion-yellow" style={{ padding: "22px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                    <Users2 size={22} color="#7a5210" />
                    <h4 style={{ fontSize: "1.15rem", color: "var(--dp-color-ink)" }}>
                      Find project collaborators
                    </h4>
                  </div>
                  <p style={{ fontSize: "0.95rem", color: "var(--dp-color-ink-secondary)", lineHeight: 1.55 }}>
                    Find people with complementary skills for a side project, product idea, or hackathon.
                  </p>
                </div>

                {/* Use Case 2: Explore open-source contributions */}
                <div className="clay-cushion-mint" style={{ padding: "22px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                    <Code2 size={22} color="#1d5c2c" />
                    <h4 style={{ fontSize: "1.15rem", color: "var(--dp-color-ink)" }}>
                      Explore open-source contributions
                    </h4>
                  </div>
                  <p style={{ fontSize: "0.95rem", color: "var(--dp-color-ink-secondary)", lineHeight: 1.55 }}>
                    Discover projects and contributors relevant to the technologies you want to work with.
                  </p>
                </div>

                {/* Use Case 3: Get help with technical challenges */}
                <div className="clay-cushion-blue" style={{ padding: "22px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                    <LifeBuoy size={22} color="#1c4873" />
                    <h4 style={{ fontSize: "1.15rem", color: "var(--dp-color-ink)" }}>
                      Get help with technical challenges
                    </h4>
                  </div>
                  <p style={{ fontSize: "0.95rem", color: "var(--dp-color-ink-secondary)", lineHeight: 1.55 }}>
                    Find people who may have relevant experience when you&apos;re stuck on a technical problem.
                  </p>
                </div>

                {/* Use Case 4: Find people to learn and build with */}
                <div className="clay-cushion-lavender" style={{ padding: "22px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                    <Sparkles size={22} color="#5b3b82" />
                    <h4 style={{ fontSize: "1.15rem", color: "var(--dp-color-ink)" }}>
                      Find people to learn and build with
                    </h4>
                  </div>
                  <p style={{ fontSize: "0.95rem", color: "var(--dp-color-ink-secondary)", lineHeight: 1.55 }}>
                    Connect with developers who share your interests or have experience you want to learn from.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Concise "How It Works" Section ── */}
      <section id="how-it-works" style={{ padding: "36px 0" }}>
        <div className="container-max">
          <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto 40px auto" }}>
            <span className="ai-badge" style={{ marginBottom: "12px" }}>
              <Sparkles size={12} /> The Process
            </span>
            <h2 style={{ marginBottom: "12px", fontSize: "clamp(2rem, 3.5vw, 2.7rem)" }}>
              How it works
            </h2>
            <p style={{ fontSize: "1.08rem", color: "var(--dp-color-ink-secondary)" }}>
              A straightforward process from your initial idea to starting a conversation.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
            {/* Step 01 */}
            <div className="clay-cushion-cream" style={{ padding: "32px 28px" }}>
              <div
                style={{
                  fontFamily: "var(--dp-typography-mono-face)",
                  fontWeight: 800,
                  fontSize: "1.8rem",
                  color: "var(--dp-color-accent)",
                  marginBottom: "12px",
                }}
              >
                01
              </div>
              <h3 style={{ fontSize: "1.3rem", marginBottom: "12px", color: "var(--dp-color-ink)" }}>
                Describe your goal
              </h3>
              <p style={{ fontSize: "0.98rem", color: "var(--dp-color-ink-secondary)", lineHeight: 1.6 }}>
                Explain your project, the technical problem you&apos;re facing, or the kind of collaborator you&apos;re looking for. You should not need to know exactly which job title or skill keywords to search for.
              </p>
            </div>

            {/* Step 02 */}
            <div className="clay-cushion-cream" style={{ padding: "32px 28px" }}>
              <div
                style={{
                  fontFamily: "var(--dp-typography-mono-face)",
                  fontWeight: 800,
                  fontSize: "1.8rem",
                  color: "#2d7a46",
                  marginBottom: "12px",
                }}
              >
                02
              </div>
              <h3 style={{ fontSize: "1.3rem", marginBottom: "12px", color: "var(--dp-color-ink)" }}>
                Discover relevant people
              </h3>
              <p style={{ fontSize: "0.98rem", color: "var(--dp-color-ink-secondary)", lineHeight: 1.6 }}>
                Glimi is designed to use your requirements and available profile information to identify potentially relevant developers. Depending on the information available, this may include skills, interests, collaboration preferences, and public project evidence.
              </p>
            </div>

            {/* Step 03 */}
            <div className="clay-cushion-cream" style={{ padding: "32px 28px" }}>
              <div
                style={{
                  fontFamily: "var(--dp-typography-mono-face)",
                  fontWeight: 800,
                  fontSize: "1.8rem",
                  color: "#7a5210",
                  marginBottom: "12px",
                }}
              >
                03
              </div>
              <h3 style={{ fontSize: "1.3rem", marginBottom: "12px", color: "var(--dp-color-ink)" }}>
                Understand the match
              </h3>
              <p style={{ fontSize: "0.98rem", color: "var(--dp-color-ink-secondary)", lineHeight: 1.6 }}>
                See why a person may be relevant to your goal and what information supports that assessment. A profile claim and independently available project evidence are not the same thing, and Glimi should make that distinction clear.
              </p>
            </div>

            {/* Step 04 */}
            <div className="clay-cushion-cream" style={{ padding: "32px 28px" }}>
              <div
                style={{
                  fontFamily: "var(--dp-typography-mono-face)",
                  fontWeight: 800,
                  fontSize: "1.8rem",
                  color: "#1c4873",
                  marginBottom: "12px",
                }}
              >
                04
              </div>
              <h3 style={{ fontSize: "1.3rem", marginBottom: "12px", color: "var(--dp-color-ink)" }}>
                Start a conversation
              </h3>
              <p style={{ fontSize: "0.98rem", color: "var(--dp-color-ink-secondary)", lineHeight: 1.6 }}>
                Reach out with the context behind your request. The other person can decide whether they want to connect and collaborate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Better Discovery Starts with Better Information: Clarifying Nuance ── */}
      <section style={{ padding: "36px 0 48px 0" }}>
        <div className="container-max">
          <div className="clay-cushion-lavender" style={{ padding: "52px 40px" }}>
            <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 36px auto" }}>
              <span
                style={{
                  backgroundColor: "#ffffff",
                  padding: "4px 14px",
                  borderRadius: "var(--dp-radius-control)",
                  boxShadow: "var(--clay-shadow-pill)",
                  fontSize: "var(--dp-typography-caption)",
                  fontWeight: 700,
                  color: "var(--dp-color-ink)",
                  display: "inline-block",
                  marginBottom: "14px",
                }}
              >
                TRANSPARENCY & CONTEXT
              </span>
              <h2 style={{ marginBottom: "14px", fontSize: "clamp(2rem, 3.8vw, 2.9rem)" }}>
                Better discovery starts with better information.
              </h2>
              <p style={{ fontSize: "1.06rem", color: "var(--dp-color-ink-secondary)", lineHeight: 1.65 }}>
                Glimi aims to help people discover potential collaborators without treating a public GitHub profile as the complete picture of a developer&apos;s abilities.
              </p>
              <p style={{ fontSize: "0.98rem", color: "var(--dp-color-ink-secondary)", lineHeight: 1.65, marginTop: "10px" }}>
                Profiles, self-reported skills, and available project evidence can each provide useful context. They should be presented transparently, without claiming that a match guarantees someone&apos;s expertise or that a project has been independently verified when it has not.
              </p>
            </div>

            {/* Horizontal Comparison Shelves */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px" }}>
              {[
                {
                  dim: "Project Evidence vs Claims",
                  oldWay: "Treats self-reported keyword lists as equivalent to verified ability",
                  glimiWay: "Maintains a transparent distinction between project evidence and claims",
                  highlighted: true,
                },
                {
                  dim: "Goal-Driven vs Keyword Search",
                  oldWay: "Requires guessing job titles, taxonomy tags, and Boolean queries",
                  glimiWay: "Start by describing what you want to build in plain English",
                  highlighted: false,
                },
                {
                  dim: "Availability & Collaboration Intent",
                  oldWay: "Messaging profiles with no idea if the person has time or interest",
                  glimiWay: "Considers declared collaboration preferences and time commitments",
                  highlighted: false,
                },
                {
                  dim: "Contextual Outreach vs Cold Spam",
                  oldWay: "Generic cold messages sent without project context",
                  glimiWay: "Mutual consent model where you share project context before connecting",
                  highlighted: false,
                },
              ].map((shelf, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: shelf.highlighted ? "var(--dp-color-accent)" : "#ffffff",
                    borderRadius: "24px",
                    boxShadow: shelf.highlighted ? "var(--clay-shadow-pink)" : "var(--clay-shadow-pill)",
                    padding: "22px 30px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    alignItems: "center",
                    gap: "18px",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--dp-color-ink)" }}>
                    {shelf.dim}
                  </div>
                  <div style={{ fontSize: "var(--dp-typography-small)", color: "var(--dp-color-ink-secondary)", lineHeight: 1.5 }}>
                    <span style={{ opacity: 0.7, fontWeight: 600 }}>Traditional:</span> {shelf.oldWay}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "var(--dp-typography-small)", color: "var(--dp-color-ink)", lineHeight: 1.5 }}>
                    <span style={{ color: shelf.highlighted ? "var(--dp-color-ink)" : "#1d5c2c" }}>★ Glimi:</span> {shelf.glimiWay}
                  </div>
                </div>
              ))}
            </div>

            {/* Disclosures: Answering Common Questions Honestly */}
            <div style={{ maxWidth: "860px", margin: "0 auto" }}>
              <h3 style={{ fontSize: "1.35rem", marginBottom: "16px", color: "var(--dp-color-ink)", textAlign: "center" }}>
                Common Questions
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  {
                    q: "How does Glimi distinguish project evidence from claims?",
                    a: "When a developer connects public code, Glimi notes publicly verifiable repositories and languages alongside self-reported skills. We distinguish between claims made on a profile and independently available evidence, rather than assuming self-reported tags guarantee expertise.",
                  },
                  {
                    q: "What if a developer doesn't have a public portfolio?",
                    a: "Many talented developers work on proprietary or closed systems. Glimi does not dismiss profiles without public code. Stated skills and interests provide useful context, and we present them as self-reported rather than claiming external verification.",
                  },
                  {
                    q: "How does starting a conversation work?",
                    a: "Rather than unsolicited direct messages, Glimi encourages sharing the context behind your request: what you're working on and why you reached out. The recipient can review that context before deciding whether to connect.",
                  },
                ].map((item, i) => {
                  const isOpen = openDisclosure === i;
                  return (
                    <div
                      key={i}
                      className="clay-cushion-cream"
                      style={{
                        borderRadius: "var(--dp-radius-disclosure)",
                        overflow: "hidden",
                      }}
                    >
                      <button
                        type="button"
                        id={`disclosure-trigger-${i}`}
                        aria-expanded={isOpen}
                        aria-controls={`disclosure-panel-${i}`}
                        onClick={() => toggleDisclosure(i)}
                        style={{
                          width: "100%",
                          padding: "18px 24px",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          color: "inherit",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "14px",
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: "1.02rem", color: "var(--dp-color-ink)" }}>
                          {item.q}
                        </span>
                        <span
                          aria-hidden="true"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "#edeef6",
                            boxShadow: "var(--clay-shadow-recessed)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            color: "var(--dp-color-ink)",
                          }}
                        >
                          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                        </span>
                      </button>

                      {isOpen && (
                        <div
                          id={`disclosure-panel-${i}`}
                          role="region"
                          aria-labelledby={`disclosure-trigger-${i}`}
                          style={{ padding: "0 24px 18px" }}
                        >
                          <p style={{ fontSize: "0.96rem", color: "var(--dp-color-ink-secondary)", lineHeight: 1.65, borderTop: "1px solid rgba(56, 49, 57, 0.08)", paddingTop: "14px", margin: 0 }}>
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
