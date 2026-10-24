"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DeveloperCard } from "@/components/discovery/DeveloperCard";
import { ContextualInviteModal } from "@/components/discovery/ContextualInviteModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { signInWithGitHub } from "@/lib/auth/signIn";
import { createClient } from "@/lib/supabase/client";
import {
  INTENTS,
  type DiscoverExtraction,
  type DiscoverResponse,
  type Intent,
  type PublicProfile,
} from "@/lib/types";
import { Sparkles, Search, Zap, AlertCircle } from "lucide-react";

type IntentFilter = "all" | Intent;

const intentLabels: Record<Intent, string> = {
  hackathons: "Hackathon teammates",
  "side-projects": "Side projects",
  "open-source": "Open source",
  pairing: "Pair programming",
};

function parseIntentFilter(value: string | null): IntentFilter {
  return INTENTS.includes(value as Intent) ? (value as Intent) : "all";
}

const sampleSearches = [
  "Rust systems engineer for a low-latency consensus engine",
  "Next.js and AI engineer for a 48-hour hackathon team",
  "React Native developer with native bridge experience",
  "PostgreSQL performance help for a data-heavy side project",
];

async function fetchPublicProfiles(
  intent: IntentFilter
): Promise<PublicProfile[]> {
  const query = intent === "all" ? "" : `?intent=${encodeURIComponent(intent)}`;
  const response = await fetch(`/api/profiles${query}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Profiles request failed.");
  const data = (await response.json()) as { profiles?: PublicProfile[] };
  return data.profiles ?? [];
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: unknown };
    if (typeof data.error === "string") return data.error;
  } catch {
    // Ignore malformed error bodies.
  }
  return "Search failed. Please try again.";
}

function DiscoverPageContent() {
  const searchParams = useSearchParams();
  const initialIntent = parseIntentFilter(searchParams.get("intent"));
  const [query, setQuery] = useState("");
  const [selectedIntent, setSelectedIntent] =
    useState<IntentFilter>(initialIntent);
  const [developers, setDevelopers] = useState<PublicProfile[]>([]);
  const [extractedCriteria, setExtractedCriteria] =
    useState<DiscoverExtraction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [inviteModalDev, setInviteModalDev] = useState<PublicProfile | null>(
    null
  );
  const requestId = useRef(0);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (active) setSignedIn(Boolean(data.user));
      })
      .catch(() => {
        if (active) setSignedIn(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const loadProfiles = useCallback(async (intent: IntentFilter) => {
    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setError(null);
    setNotice(null);
    setExtractedCriteria(null);

    try {
      const profiles = await fetchPublicProfiles(intent);
      if (currentRequest !== requestId.current) return;
      setDevelopers(profiles);
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      console.error("Profile list failed:", err);
      setDevelopers([]);
      setError("Public profiles could not be loaded right now.");
    } finally {
      if (currentRequest === requestId.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const currentRequest = ++requestId.current;

    fetchPublicProfiles(initialIntent)
      .then((profiles) => {
        if (active && currentRequest === requestId.current) {
          setDevelopers(profiles);
        }
      })
      .catch((err) => {
        if (!active || currentRequest !== requestId.current) return;
        console.error("Profile list failed:", err);
        setDevelopers([]);
        setError("Public profiles could not be loaded right now.");
      })
      .finally(() => {
        if (active && currentRequest === requestId.current) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [initialIntent]);

  const handleSearch = useCallback(
    async (searchQuery: string, intent: IntentFilter) => {
      const trimmed = searchQuery.trim();

      if (trimmed.length < 3) {
        setError("Describe what you need in at least 3 characters.");
        return;
      }

      const currentRequest = ++requestId.current;
      setIsSearching(true);
      setError(null);
      setNotice(null);

      try {
        const response = await fetch("/api/discover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: trimmed,
            intentFilter: intent === "all" ? undefined : intent,
          }),
        });

        if (response.status === 401) {
          if (currentRequest !== requestId.current) return;
          setSignedIn(false);
          setError(
            "Sign in with GitHub to use AI-assisted search. You can still browse public profiles below."
          );
          return;
        }

        if (!response.ok) {
          if (currentRequest !== requestId.current) return;
          setError(await readErrorMessage(response));
          return;
        }

        const data = (await response.json()) as DiscoverResponse;
        if (currentRequest !== requestId.current) return;
        setDevelopers(data.results);
        setExtractedCriteria(data.extraction);
        if (data.degraded) {
          setNotice(
            data.message ??
              "AI ranking was unavailable, so these results are ordered by a simple profile match."
          );
        }
      } catch (err) {
        if (currentRequest !== requestId.current) return;
        console.error("Discovery search failed:", err);
        setError("Search failed. Check your connection and try again.");
      } finally {
        if (currentRequest === requestId.current) setIsSearching(false);
      }
    },
    []
  );

  const handleIntentChange = (nextIntent: IntentFilter) => {
    setSelectedIntent(nextIntent);
    if (query.trim()) {
      void handleSearch(query, nextIntent);
    } else {
      void loadProfiles(nextIntent);
    }
  };

  const handleReset = () => {
    setQuery("");
    setSelectedIntent("all");
    void loadProfiles("all");
  };

  const handleSampleClick = (sample: string) => {
    setQuery(sample);
    void handleSearch(sample, selectedIntent);
  };

  const isBusy = isLoading || isSearching;

  return (
    <AppShell>
      <div
        className="container-max"
        style={{ paddingTop: "32px", paddingBottom: "64px" }}
      >
        <div
          className="clay-cushion-cream"
          style={{
            maxWidth: "900px",
            margin: "0 auto 36px auto",
            textAlign: "center",
            padding: "44px 36px",
          }}
        >
          <div style={{ display: "inline-flex", marginBottom: "14px" }}>
            <span className="ai-badge">
              <Sparkles size={13} /> Goal-driven discovery
            </span>
          </div>
          <h1
            style={{
              marginBottom: "14px",
              fontSize: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            Describe what you need. See who may be able to help.
          </h1>
          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--dp-color-ink-secondary)",
              marginBottom: "24px",
              maxWidth: "680px",
              margin: "0 auto 24px auto",
              lineHeight: 1.6,
            }}
          >
            Search uses the words in your request plus profile metadata and
            public repository signals. Matches are starting points, not proof of
            expertise or availability.
          </p>

          <div
            style={{
              backgroundColor: "#edeef6",
              borderRadius: "var(--dp-radius-control)",
              boxShadow: "var(--clay-shadow-recessed)",
              padding: "6px 8px 6px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Search
              size={20}
              color="var(--dp-color-ink)"
              style={{ flexShrink: 0 }}
              aria-hidden="true"
            />
            <label htmlFor="discover-query" className="sr-only">
              Describe the collaborator or help you need
            </label>
            <input
              id="discover-query"
              type="text"
              value={query}
              maxLength={600}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSearch(query, selectedIntent);
                }
              }}
              placeholder="Describe your project, technical problem, or the kind of collaborator you need..."
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--dp-color-ink)",
                fontSize: "var(--dp-typography-body)",
                fontFamily: "var(--dp-typography-face)",
              }}
            />
            <Button
              variant="primary"
              size="md"
              onClick={() => void handleSearch(query, selectedIntent)}
              isLoading={isSearching}
              style={{ flexShrink: 0 }}
            >
              Search
            </Button>
          </div>

          <p
            style={{
              marginTop: "10px",
              fontSize: "var(--dp-typography-caption)",
              color: "var(--dp-color-ink-secondary)",
            }}
          >
            {signedIn
              ? "AI-assisted search is enabled for your account."
              : "AI-assisted search requires sign-in. Public profiles can still be browsed."}
            {!signedIn && (
              <button
                type="button"
                onClick={() => signInWithGitHub("/discover")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--dp-color-ink)",
                  fontWeight: 700,
                  textDecoration: "underline",
                  cursor: "pointer",
                  marginLeft: "6px",
                  fontFamily: "var(--dp-typography-face)",
                }}
              >
                Sign in
              </button>
            )}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "20px",
            }}
          >
            <span
              style={{
                fontSize: "var(--dp-typography-metadata)",
                color: "var(--dp-color-ink-secondary)",
                fontWeight: 700,
              }}
            >
              Try:
            </span>
            {sampleSearches.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => handleSampleClick(sample)}
                style={{
                  background: "var(--dp-color-surface)",
                  border: "none",
                  borderRadius: "var(--dp-radius-control)",
                  padding: "5px 12px",
                  fontSize: "var(--dp-typography-metadata)",
                  fontFamily: "var(--dp-typography-face)",
                  color: "var(--dp-color-ink)",
                  cursor: "pointer",
                  boxShadow: "var(--clay-shadow-pill)",
                  transition: "transform var(--dp-motion-interaction) ease",
                }}
              >
                {sample}
              </button>
            ))}
          </div>

          <div
            role="group"
            aria-label="Filter profiles by collaboration intent"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "24px",
            }}
          >
            <Chip
              label="All intents"
              selected={selectedIntent === "all"}
              onSelect={() => handleIntentChange("all")}
            />
            {INTENTS.map((intent) => (
              <Chip
                key={intent}
                label={intentLabels[intent]}
                selected={selectedIntent === intent}
                onSelect={() => handleIntentChange(intent)}
              />
            ))}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="clay-cushion-yellow"
            style={{
              marginBottom: "24px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--dp-color-ink)",
              fontWeight: 600,
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div
            className="clay-cushion-lavender"
            style={{
              marginBottom: "24px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Zap size={18} color="var(--dp-color-ink)" />
            <span
              style={{
                fontSize: "var(--dp-typography-small)",
                color: "var(--dp-color-ink)",
                fontWeight: 600,
              }}
            >
              {notice}
            </span>
          </div>
        )}

        {extractedCriteria && (
          <div
            className="clay-cushion-lavender"
            style={{
              marginBottom: "28px",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <Sparkles size={18} color="var(--dp-color-ink)" />
              <span
                style={{
                  fontSize: "var(--dp-typography-small)",
                  color: "var(--dp-color-ink)",
                  fontWeight: 700,
                }}
              >
                Query interpreted as:
              </span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {extractedCriteria.skills.map((skill) => (
                  <Badge key={skill} variant="lavender" size="sm">
                    {skill}
                  </Badge>
                ))}
                {extractedCriteria.intent && (
                  <Badge variant="intent" size="sm">
                    {intentLabels[extractedCriteria.intent]}
                  </Badge>
                )}
                {extractedCriteria.timeCommitment && (
                  <Badge variant="blue" size="sm">
                    {extractedCriteria.timeCommitment}
                  </Badge>
                )}
                {extractedCriteria.timezoneHint && (
                  <Badge variant="neutral" size="sm">
                    {extractedCriteria.timezoneHint}
                  </Badge>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--dp-color-ink)",
                fontSize: "var(--dp-typography-metadata)",
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "underline",
                fontFamily: "var(--dp-typography-face)",
              }}
            >
              Reset search
            </button>
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            padding: "0 8px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "var(--dp-typography-small)",
              color: "var(--dp-color-ink-secondary)",
              fontWeight: 600,
            }}
          >
            Showing{" "}
            <strong style={{ color: "var(--dp-color-ink)" }}>
              {developers.length}
            </strong>{" "}
            public profile{developers.length === 1 ? "" : "s"}
            {selectedIntent === "all"
              ? ""
              : ` interested in ${intentLabels[selectedIntent].toLowerCase()}`}
          </div>
          <Badge variant="neutral" size="sm">
            Profile metadata, not an endorsement
          </Badge>
        </div>

        {isBusy ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "28px",
            }}
            aria-busy="true"
            aria-live="polite"
          >
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="clay-cushion-cream"
                style={{
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{ display: "flex", gap: "12px", alignItems: "center" }}
                >
                  <Skeleton circle height="48px" />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      width: "160px",
                    }}
                  >
                    <Skeleton height="18px" />
                    <Skeleton height="14px" width="100px" />
                  </div>
                </div>
                <Skeleton height="40px" />
                <Skeleton height="24px" width="70%" />
                <Skeleton height="36px" />
              </div>
            ))}
          </div>
        ) : developers.length === 0 ? (
          <div
            className="clay-cushion-cream"
            style={{
              padding: "56px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <p
              style={{
                fontSize: "1.2rem",
                color: "var(--dp-color-ink)",
                fontWeight: 700,
              }}
            >
              No public profiles match yet.
            </p>
            <p
              style={{
                fontSize: "var(--dp-typography-small)",
                color: "var(--dp-color-ink-secondary)",
                maxWidth: "520px",
                lineHeight: 1.55,
              }}
            >
              Try a broader description or another intent filter. If you are
              building a profile, connect GitHub and finish onboarding so it can
              appear here.
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button variant="secondary" size="sm" onClick={handleReset}>
                Reset filters
              </Button>
              {!signedIn && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => signInWithGitHub("/onboarding")}
                >
                  Connect GitHub
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "28px",
            }}
          >
            {developers.map((developer) => (
              <DeveloperCard
                key={developer.id}
                developer={developer}
                onInvite={(selected) => setInviteModalDev(selected)}
              />
            ))}
          </div>
        )}
      </div>

      <ContextualInviteModal
        isOpen={Boolean(inviteModalDev)}
        onClose={() => setInviteModalDev(null)}
        developer={inviteModalDev}
      />
    </AppShell>
  );
}

function DiscoverFallback() {
  return (
    <AppShell>
      <div
        className="container-max"
        style={{ paddingTop: "48px", paddingBottom: "64px" }}
      >
        <p style={{ color: "var(--dp-color-ink-secondary)" }}>
          Loading public profiles...
        </p>
      </div>
    </AppShell>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<DiscoverFallback />}>
      <DiscoverPageContent />
    </Suspense>
  );
}
