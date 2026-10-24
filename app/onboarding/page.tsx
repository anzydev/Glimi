"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { signInWithGitHub } from "@/lib/auth/signIn";
import type {
  ContactPreference,
  Intent,
  PrivateProfile,
  TimeCommitment,
} from "@/lib/types";
import {
  CONTACT_PREFERENCES,
  INTENTS,
  TIME_COMMITMENTS,
} from "@/lib/types";
import { safeRedirectPath } from "@/lib/utils/redirect";
import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";

const intentLabels: Record<Intent, string> = {
  hackathons: "Hackathons",
  "side-projects": "Side projects",
  "open-source": "Open source",
  pairing: "Pair programming",
};

const commitmentLabels: Record<TimeCommitment, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  weekends: "Weekends",
  flexible: "Flexible",
};

const contactLabels: Record<ContactPreference, string> = {
  "in-app": "In-app messages",
  github: "GitHub",
  email: "Email",
};

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: unknown };
    if (typeof data.error === "string") return data.error;
  } catch {
    // Ignore malformed error bodies.
  }
  return fallback;
}

type ProfileLoadResult =
  | { kind: "ok"; profile: PrivateProfile }
  | { kind: "auth" }
  | { kind: "missing" }
  | { kind: "error"; message: string };

async function fetchOwnProfile(): Promise<ProfileLoadResult> {
  try {
    const response = await fetch("/api/profile", { cache: "no-store" });

    if (response.status === 401) return { kind: "auth" };
    if (response.status === 404) return { kind: "missing" };

    if (!response.ok) {
      return {
        kind: "error",
        message: await readError(response, "Your profile could not be loaded."),
      };
    }

    const data = (await response.json()) as { profile: PrivateProfile };
    return { kind: "ok", profile: data.profile };
  } catch (err) {
    console.error("Profile load failed:", err);
    return {
      kind: "error",
      message: "Your profile could not be loaded. Check your connection.",
    };
  }
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const syncFailed = searchParams.get("sync") === "failed";
  const nextParam = searchParams.get("next");

  const [isLoading, setIsLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [missingProfile, setMissingProfile] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [intents, setIntents] = useState<Intent[]>([]);
  const [timeCommitment, setTimeCommitment] =
    useState<TimeCommitment>("flexible");
  const [timezones, setTimezones] = useState("");
  const [contactPreference, setContactPreference] =
    useState<ContactPreference>("in-app");
  const [contactHandle, setContactHandle] = useState("");
  const [isDiscoverable, setIsDiscoverable] = useState(true);

  const applyProfile = useCallback((value: PrivateProfile) => {
    setName(value.name ?? "");
    setBio(value.bio ?? "");
    setLocation(value.location ?? "");
    setCompany(value.company ?? "");
    setWebsite(value.website ?? "");
    setIntents(
      value.intents.filter((intent): intent is Intent =>
        INTENTS.includes(intent as Intent)
      )
    );
    setTimeCommitment(value.time_commitment ?? "flexible");
    setTimezones(value.timezones.join(", "));
    setContactPreference(value.contact_preference ?? "in-app");
    setContactHandle(value.contact_handle ?? "");
    setIsDiscoverable(value.is_discoverable);
  }, []);

  const applyLoadResult = useCallback(
    (result: ProfileLoadResult) => {
      setIsLoading(false);

      if (result.kind === "ok") {
        setNeedsAuth(false);
        setMissingProfile(false);
        setLoadError(null);
        applyProfile(result.profile);
        return;
      }

      if (result.kind === "auth") {
        setNeedsAuth(true);
        return;
      }

      if (result.kind === "missing") {
        setMissingProfile(true);
        return;
      }

      setLoadError(result.message);
    },
    [applyProfile]
  );

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setMissingProfile(false);
    const result = await fetchOwnProfile();
    applyLoadResult(result);
  }, [applyLoadResult]);

  useEffect(() => {
    let active = true;
    fetchOwnProfile().then((result) => {
      if (active) applyLoadResult(result);
    });
    return () => {
      active = false;
    };
  }, [applyLoadResult]);

  const syncGitHub = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/github/sync", { method: "POST" });
      if (!response.ok) {
        throw new Error(
          await readError(response, "GitHub data could not be synced.")
        );
      }
      await loadProfile();
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "GitHub data could not be synced."
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleIntent = (intent: Intent) => {
    setIntents((current) =>
      current.includes(intent)
        ? current.filter((item) => item !== intent)
        : [...current, intent]
    );
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!bio.trim()) {
      setFormError("Add a short bio so people know what you work on.");
      return;
    }
    if (intents.length === 0) {
      setFormError("Choose at least one collaboration intent.");
      return;
    }

    const parsedTimezones = timezones
      .split(",")
      .map((zone) => zone.trim())
      .filter(Boolean)
      .slice(0, 8);

    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          bio: bio.trim(),
          location: location.trim() || null,
          company: company.trim() || null,
          website: website.trim() || null,
          intents,
          timeCommitment,
          timezones: parsedTimezones,
          contactPreference,
          contactHandle: contactHandle.trim() || null,
          isDiscoverable,
        }),
      });

      if (!response.ok) {
        setFormError(await readError(response, "Profile could not be saved."));
        return;
      }

      const data = (await response.json()) as { profile: PrivateProfile };
      applyProfile(data.profile);

      const destination = nextParam
        ? safeRedirectPath(nextParam, "/discover")
        : `/profile/${data.profile.username}`;
      router.push(destination);
      router.refresh();
    } catch (err) {
      console.error("Profile save failed:", err);
      setFormError("Network error. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="container-max"
        style={{ paddingTop: "60px", textAlign: "center" }}
      >
        <p style={{ color: "var(--dp-color-ink-secondary)" }}>
          Loading your profile...
        </p>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div
        className="container-max"
        style={{
          paddingTop: "60px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <h1 style={{ fontSize: "2rem" }}>Sign in to set up your profile</h1>
        <p style={{ color: "var(--dp-color-ink-secondary)", maxWidth: "480px" }}>
          Glimi uses GitHub to import public repository data. You can edit your
          profile after signing in.
        </p>
        <Button
          variant="primary"
          onClick={() => signInWithGitHub("/onboarding")}
        >
          Sign in with GitHub
        </Button>
      </div>
    );
  }

  if (missingProfile) {
    return (
      <div
        className="container-max"
        style={{
          paddingTop: "60px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <h1 style={{ fontSize: "2rem" }}>GitHub data is missing</h1>
        <p style={{ color: "var(--dp-color-ink-secondary)", maxWidth: "520px" }}>
          Your account exists, but the GitHub profile sync did not finish. Retry
          the sync to continue.
        </p>
        {loadError && (
          <p role="alert" style={{ color: "var(--status-danger)", fontWeight: 600 }}>
            {loadError}
          </p>
        )}
        <Button
          variant="primary"
          onClick={() => void syncGitHub()}
          isLoading={isSyncing}
          leftIcon={<RefreshCw size={15} />}
        >
          Retry GitHub sync
        </Button>
      </div>
    );
  }

  return (
    <div
      className="container-max"
      style={{ paddingTop: "36px", paddingBottom: "64px" }}
    >
      <div
        className="clay-cushion-cream"
        style={{ maxWidth: "780px", margin: "0 auto", padding: "40px" }}
      >
        <div style={{ display: "inline-flex", marginBottom: "12px" }}>
          <span className="ai-badge">
            <Sparkles size={13} /> Profile setup
          </span>
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", marginBottom: "10px" }}>
          Tell people what you want to build
        </h1>
        <p
          style={{
            color: "var(--dp-color-ink-secondary)",
            lineHeight: 1.6,
            marginBottom: "24px",
          }}
        >
          Name, avatar, and repository data come from GitHub. Everything below is
          editable, and your claimed skills are presented as self-reported unless
          they are inferred from public repository metadata.
        </p>

        {syncFailed && (
          <div
            role="alert"
            className="clay-cushion-yellow"
            style={{
              marginBottom: "20px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={16} /> GitHub sync did not complete.
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void syncGitHub()}
              isLoading={isSyncing}
              leftIcon={<RefreshCw size={14} />}
            >
              Retry sync
            </Button>
          </div>
        )}

        {loadError && (
          <p
            role="alert"
            style={{
              marginBottom: "16px",
              color: "var(--status-danger)",
              fontWeight: 600,
            }}
          >
            {loadError}
          </p>
        )}

        <form
          onSubmit={saveProfile}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <Input
            label="Display name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
            placeholder="Your name"
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="onboarding-bio"
              style={{
                fontSize: "var(--dp-typography-small)",
                fontWeight: 700,
                color: "var(--dp-color-ink)",
                marginLeft: "12px",
              }}
            >
              Short bio
            </label>
            <textarea
              id="onboarding-bio"
              rows={4}
              maxLength={800}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="What do you work on? What are you looking for?"
              required
              style={{
                width: "100%",
                padding: "14px 20px",
                backgroundColor: "#edeef6",
                border: "none",
                borderRadius: "24px",
                boxShadow: "var(--clay-shadow-recessed)",
                color: "var(--dp-color-ink)",
                fontFamily: "var(--dp-typography-face)",
                fontSize: "var(--dp-typography-body)",
                lineHeight: 1.55,
                outline: "none",
                resize: "vertical",
              }}
            />
            <span
              style={{
                fontSize: "var(--dp-typography-caption)",
                color: "var(--dp-color-ink-secondary)",
                marginLeft: "12px",
              }}
            >
              {bio.length}/800 characters
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            <Input
              label="Location (optional)"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={120}
              placeholder="City or region"
            />
            <Input
              label="Company (optional)"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              maxLength={120}
              placeholder="Company or project"
            />
          </div>

          <Input
            label="Website (optional)"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            maxLength={300}
            placeholder="https://example.com"
            helperText="Must start with http:// or https://."
          />

          <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
            <legend
              style={{
                fontSize: "var(--dp-typography-small)",
                fontWeight: 700,
                color: "var(--dp-color-ink)",
                marginBottom: "8px",
                marginLeft: "8px",
              }}
            >
              Collaboration intents (choose at least one)
            </legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {INTENTS.map((intent) => (
                <Chip
                  key={intent}
                  label={intentLabels[intent]}
                  selected={intents.includes(intent)}
                  onSelect={() => toggleIntent(intent)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
            <legend
              style={{
                fontSize: "var(--dp-typography-small)",
                fontWeight: 700,
                color: "var(--dp-color-ink)",
                marginBottom: "8px",
                marginLeft: "8px",
              }}
            >
              Time commitment
            </legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {TIME_COMMITMENTS.map((commitment) => (
                <Chip
                  key={commitment}
                  label={commitmentLabels[commitment]}
                  selected={timeCommitment === commitment}
                  onSelect={() => setTimeCommitment(commitment)}
                />
              ))}
            </div>
          </fieldset>

          <Input
            label="Timezones (optional, comma separated)"
            value={timezones}
            onChange={(event) => setTimezones(event.target.value)}
            placeholder="America/New_York, Europe/London"
            maxLength={400}
          />

          <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
            <legend
              style={{
                fontSize: "var(--dp-typography-small)",
                fontWeight: 700,
                color: "var(--dp-color-ink)",
                marginBottom: "8px",
                marginLeft: "8px",
              }}
            >
              Contact preference
            </legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CONTACT_PREFERENCES.map((preference) => (
                <Chip
                  key={preference}
                  label={contactLabels[preference]}
                  selected={contactPreference === preference}
                  onSelect={() => setContactPreference(preference)}
                />
              ))}
            </div>
          </fieldset>

          {contactPreference !== "in-app" && (
            <Input
              label="Contact handle"
              value={contactHandle}
              onChange={(event) => setContactHandle(event.target.value)}
              maxLength={200}
              placeholder={
                contactPreference === "email"
                  ? "you@example.com"
                  : "your-github-username"
              }
              helperText="Only shared with people whose invitation you accept."
            />
          )}

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              fontSize: "var(--dp-typography-small)",
              color: "var(--dp-color-ink)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={isDiscoverable}
              onChange={(event) => setIsDiscoverable(event.target.checked)}
              style={{ marginTop: "3px" }}
            />
            <span>
              Make my profile discoverable in search. You can change this later.
            </span>
          </label>

          {formError && (
            <p
              role="alert"
              style={{
                fontSize: "var(--dp-typography-caption)",
                color: "var(--status-danger)",
                fontWeight: 600,
                marginLeft: "12px",
              }}
            >
              {formError}
            </p>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "8px",
            }}
          >
            <Button
              variant="ghost"
              type="button"
              onClick={() => router.push("/discover")}
              disabled={isSaving}
            >
              Skip for now
            </Button>
            <Button variant="primary" type="submit" isLoading={isSaving}>
              Save and continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div
            className="container-max"
            style={{ paddingTop: "60px", textAlign: "center" }}
          >
            <p style={{ color: "var(--dp-color-ink-secondary)" }}>
              Loading profile setup...
            </p>
          </div>
        }
      >
        <OnboardingContent />
      </Suspense>
    </AppShell>
  );
}
