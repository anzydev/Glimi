"use client";

import React, { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ContextualInviteModal } from "@/components/discovery/ContextualInviteModal";
import { GithubIcon } from "@/components/icons/BrandIcons";
import { createClient } from "@/lib/supabase/client";
import type {
  EvidenceType,
  PrivateProfile,
  PublicProfile,
} from "@/lib/types";
import {
  MapPin,
  Building,
  Send,
  Sparkles,
  GitBranch,
  Star,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Globe,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

type ProfileData = PublicProfile | PrivateProfile;

const evidenceLabels: Record<EvidenceType, string> = {
  observed: "Observed in public repos",
  verified: "Source-marked as verified",
  reported: "Self-reported",
  learning: "Learning",
};

function isPrivateProfile(
  profile: ProfileData | null,
  isOwn: boolean
): profile is PrivateProfile {
  return Boolean(
    isOwn && profile && "is_discoverable" in profile && "contact_preference" in profile
  );
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: unknown };
    if (typeof data.error === "string") return data.error;
  } catch {
    // Ignore malformed error responses.
  }
  return fallback;
}

type ProfileLoadResult =
  | { kind: "ok"; profile: ProfileData; isOwn: boolean }
  | { kind: "notfound" }
  | { kind: "error"; message: string };

async function fetchProfileByUsername(
  username: string
): Promise<ProfileLoadResult> {
  try {
    const response = await fetch(
      `/api/profile/${encodeURIComponent(username)}`,
      { cache: "no-store" }
    );

    if (response.status === 404) return { kind: "notfound" };

    if (!response.ok) {
      return {
        kind: "error",
        message: "This profile could not be loaded right now.",
      };
    }

    const data = (await response.json()) as {
      profile: ProfileData;
      isOwn: boolean;
    };
    return { kind: "ok", profile: data.profile, isOwn: data.isOwn };
  } catch (err) {
    console.error("Profile load failed:", err);
    return {
      kind: "error",
      message: "This profile could not be loaded right now.",
    };
  }
}

function ProfileContent() {
  const params = useParams();
  const router = useRouter();
  const username = typeof params.username === "string" ? params.username : "";
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isOwn, setIsOwn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSavingDiscoverability, setIsSavingDiscoverability] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const applyLoadResult = useCallback((result: ProfileLoadResult) => {
    setLoading(false);

    if (result.kind === "ok") {
      setProfile(result.profile);
      setIsOwn(result.isOwn);
      setNotFound(false);
      setLoadError(null);
      return;
    }

    if (result.kind === "notfound") {
      setProfile(null);
      setIsOwn(false);
      setNotFound(true);
      return;
    }

    setLoadError(result.message);
  }, []);

  const loadProfile = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setLoadError(null);
    setNotFound(false);
    setActionError(null);
    applyLoadResult(await fetchProfileByUsername(username));
  }, [applyLoadResult, username]);

  useEffect(() => {
    if (!username) return;
    let active = true;
    fetchProfileByUsername(username).then((result) => {
      if (active) applyLoadResult(result);
    });
    return () => {
      active = false;
    };
  }, [applyLoadResult, username]);

  const privateProfile = isPrivateProfile(profile, isOwn) ? profile : null;

  const toggleDiscoverability = async () => {
    if (!privateProfile || isSavingDiscoverability) return;
    const previous = privateProfile.is_discoverable;
    const nextValue = !previous;

    setProfile({ ...privateProfile, is_discoverable: nextValue });
    setIsSavingDiscoverability(true);
    setActionError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDiscoverable: nextValue }),
      });

      if (!response.ok) {
        throw new Error(
          await readError(response, "Discoverability could not be updated.")
        );
      }

      const data = (await response.json()) as { profile: PrivateProfile };
      setProfile(data.profile);
    } catch (err) {
      setProfile({ ...privateProfile, is_discoverable: previous });
      setActionError(
        err instanceof Error
          ? err.message
          : "Discoverability could not be updated."
      );
    } finally {
      setIsSavingDiscoverability(false);
    }
  };

  const syncGitHub = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setActionError(null);

    try {
      const response = await fetch("/api/github/sync", { method: "POST" });
      if (!response.ok) {
        throw new Error(
          await readError(response, "GitHub data could not be refreshed.")
        );
      }
      await loadProfile();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "GitHub data could not be refreshed."
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmation !== "DELETE" || isDeleting) return;
    setIsDeleting(true);
    setActionError(null);

    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      if (!response.ok) {
        throw new Error(
          await readError(response, "The account could not be deleted.")
        );
      }

      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "The account could not be deleted."
      );
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div
          className="container-max"
          style={{ paddingTop: "60px", textAlign: "center" }}
        >
          <p style={{ color: "var(--dp-color-ink-secondary)" }}>
            Loading profile...
          </p>
        </div>
      </AppShell>
    );
  }

  if (notFound) {
    return (
      <AppShell>
        <div
          className="container-max"
          style={{
            paddingTop: "60px",
            paddingBottom: "80px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <h2>Profile not found</h2>
          <p
            style={{
              color: "var(--dp-color-ink-secondary)",
              maxWidth: "520px",
            }}
          >
            No discoverable profile matches @{username}. The person may have
            hidden their profile or changed their username.
          </p>
          <Link href="/discover">
            <Button variant="secondary" leftIcon={<ArrowLeft size={15} />}>
              Back to discovery
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  if (loadError || !profile) {
    return (
      <AppShell>
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
          <p role="alert" style={{ color: "var(--status-danger)", fontWeight: 600 }}>
            {loadError ?? "This profile could not be loaded."}
          </p>
          <Button variant="secondary" onClick={() => void loadProfile()}>
            Try again
          </Button>
        </div>
      </AppShell>
    );
  }

  const displayName = profile.name || profile.username;

  return (
    <AppShell>
      <div
        className="container-max"
        style={{ paddingTop: "40px", paddingBottom: "64px" }}
      >
        <div
          className="clay-cushion-cream"
          style={{ padding: "36px", marginBottom: "28px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <Avatar src={profile.avatar_url} name={displayName} size="xl" />
              <div>
                <h1 style={{ fontSize: "2.4rem", lineHeight: 1.1 }}>
                  {displayName}
                </h1>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "4px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      color: "var(--dp-color-ink)",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                    }}
                  >
                    @{profile.username}
                  </span>
                  <a
                    href={`https://github.com/${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--dp-color-ink-secondary)",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Open GitHub profile"
                    aria-label={`GitHub profile for ${displayName}`}
                  >
                    <GithubIcon size={18} />
                  </a>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginTop: "12px",
                    fontSize: "var(--dp-typography-small)",
                    color: "var(--dp-color-ink-secondary)",
                  }}
                >
                  {profile.location && (
                    <span
                      style={{ display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <MapPin size={15} color="var(--dp-color-accent)" />{" "}
                      {profile.location}
                    </span>
                  )}
                  {profile.company && (
                    <span
                      style={{ display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <Building size={15} color="var(--dp-color-ink)" />{" "}
                      {profile.company}
                    </span>
                  )}
                  {profile.time_commitment && (
                    <span
                      style={{ display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <Clock size={15} /> {profile.time_commitment}
                    </span>
                  )}
                  {typeof profile.public_repos_count === "number" && (
                    <span
                      style={{ display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <GitBranch size={15} /> {profile.public_repos_count} public
                      repos
                    </span>
                  )}
                </div>

                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      marginTop: "10px",
                      color: "var(--dp-color-ink)",
                      fontWeight: 700,
                      fontSize: "var(--dp-typography-small)",
                    }}
                  >
                    <Globe size={15} /> {profile.website}
                  </a>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {isOwn ? (
                <>
                  <Link href="/onboarding?edit=1">
                    <Button variant="primary" size="sm" style={{ width: "100%" }}>
                      Edit profile
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void syncGitHub()}
                    isLoading={isSyncing}
                    leftIcon={<RefreshCw size={14} />}
                  >
                    Refresh GitHub data
                  </Button>
                  {privateProfile && (
                    <Button
                      variant={
                        privateProfile.is_discoverable ? "secondary" : "outline"
                      }
                      size="sm"
                      onClick={() => void toggleDiscoverability()}
                      isLoading={isSavingDiscoverability}
                      leftIcon={
                        privateProfile.is_discoverable ? (
                          <Eye size={14} />
                        ) : (
                          <EyeOff size={14} />
                        )
                      }
                    >
                      {privateProfile.is_discoverable
                        ? "Discoverable"
                        : "Hidden from search"}
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Send size={16} />}
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  Invite to collaborate
                </Button>
              )}
            </div>
          </div>

          {profile.bio && (
            <p
              style={{
                marginTop: "20px",
                fontSize: "1.08rem",
                color: "var(--dp-color-ink)",
                maxWidth: "800px",
                lineHeight: 1.6,
              }}
            >
              {profile.bio}
            </p>
          )}

          {profile.intents.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginTop: "18px",
              }}
            >
              {profile.intents.map((intent) => (
                <Badge key={intent} variant="intent" size="md">
                  Open to: {intent.replace("-", " ")}
                </Badge>
              ))}
            </div>
          )}

          {profile.timezones.length > 0 && (
            <p
              style={{
                marginTop: "12px",
                fontSize: "var(--dp-typography-caption)",
                color: "var(--dp-color-ink-secondary)",
              }}
            >
              Timezones: {profile.timezones.join(", ")}
            </p>
          )}
        </div>

        {actionError && (
          <div
            role="alert"
            className="clay-cushion-yellow"
            style={{
              marginBottom: "20px",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 600,
            }}
          >
            <AlertCircle size={16} /> {actionError}
          </div>
        )}

        {profile.summary_ai && (
          <div
            className="clay-cushion-lavender"
            style={{ marginBottom: "28px", padding: "24px 28px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
                flexWrap: "wrap",
              }}
            >
              <span className="ai-badge">
                <Sparkles size={12} /> AI-generated summary
              </span>
              <span
                style={{
                  fontSize: "var(--dp-typography-metadata)",
                  color: "var(--dp-color-ink-secondary)",
                }}
              >
                Based on public repository metadata; may be incomplete or
                inaccurate.
              </span>
            </div>
            <p
              style={{
                fontSize: "1.05rem",
                color: "var(--dp-color-ink)",
                lineHeight: 1.65,
              }}
            >
              {profile.summary_ai}
            </p>
          </div>
        )}

        {privateProfile && (
          <div
            className="clay-cushion-mint"
            style={{ marginBottom: "28px", padding: "22px 26px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "6px",
              }}
            >
              <ShieldCheck size={16} />
              <strong>Contact sharing</strong>
            </div>
            <p
              style={{
                fontSize: "var(--dp-typography-small)",
                color: "var(--dp-color-ink-secondary)",
              }}
            >
              Preferred channel: {privateProfile.contact_preference ?? "not set"}
              {privateProfile.contact_handle
                ? ` (${privateProfile.contact_handle})`
                : ""}
              . This is shown to people only after you accept their invitation.
            </p>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "28px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
              Skills and evidence
            </h2>
            <p
              style={{
                fontSize: "var(--dp-typography-caption)",
                color: "var(--dp-color-ink-secondary)",
                marginBottom: "16px",
                lineHeight: 1.5,
              }}
            >
              &ldquo;Observed&rdquo; means inferred from public repository
              metadata. &ldquo;Reported&rdquo; means self-declared. Neither is an
              endorsement.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {profile.skills.length === 0 ? (
                <div
                  className="clay-cushion-cream"
                  style={{ padding: "24px", textAlign: "center" }}
                >
                  <p style={{ color: "var(--dp-color-ink-secondary)" }}>
                    No skills listed yet.
                  </p>
                </div>
              ) : (
                profile.skills.map((skill, index) => (
                  <div
                    key={`${skill.name}-${index}`}
                    className="clay-cushion-cream"
                    style={{
                      padding: "18px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "1.15rem",
                          color: "var(--dp-color-ink)",
                        }}
                      >
                        {skill.name}
                      </span>
                      <Badge
                        variant={skill.evidence_type}
                        size="sm"
                        title={evidenceLabels[skill.evidence_type]}
                      >
                        {evidenceLabels[skill.evidence_type]}
                      </Badge>
                    </div>
                    {skill.repo_count !== null && (
                      <span
                        style={{
                          fontSize: "var(--dp-typography-caption)",
                          color: "var(--dp-color-ink-secondary)",
                        }}
                      >
                        Appears in {skill.repo_count} public repositor
                        {skill.repo_count === 1 ? "y" : "ies"}
                      </span>
                    )}
                    {skill.evidence_summary && (
                      <span
                        style={{
                          fontSize: "var(--dp-typography-caption)",
                          color: "var(--dp-color-ink-secondary)",
                        }}
                      >
                        {skill.evidence_summary}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
              Public repositories
            </h2>
            <p
              style={{
                fontSize: "var(--dp-typography-caption)",
                color: "var(--dp-color-ink-secondary)",
                marginBottom: "16px",
              }}
            >
              GitHub metadata, not an assessment of code quality.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {profile.repositories.length === 0 ? (
                <div
                  className="clay-cushion-cream"
                  style={{ padding: "24px", textAlign: "center" }}
                >
                  <p style={{ color: "var(--dp-color-ink-secondary)" }}>
                    No public repositories listed.
                  </p>
                </div>
              ) : (
                profile.repositories.map((repo) => (
                  <div
                    key={repo.repo_url}
                    className="clay-cushion-cream"
                    style={{
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <a
                        href={repo.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontWeight: 700,
                          color: "var(--dp-color-ink)",
                          fontFamily: "var(--dp-typography-mono-face)",
                          fontSize: "0.95rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <GitBranch size={16} color="#1d5c2c" />
                        <span>{repo.name}</span>
                      </a>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          color: "var(--dp-color-ink)",
                          flexShrink: 0,
                        }}
                      >
                        <Star size={13} color="#7a5210" fill="#f9e7a8" />
                        <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                          {repo.stars_count ?? 0}
                        </span>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: "0.95rem",
                        color: "var(--dp-color-ink-secondary)",
                        lineHeight: 1.5,
                      }}
                    >
                      {repo.description || "No description provided."}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                        fontSize: "var(--dp-typography-caption)",
                        color: "var(--dp-color-ink-secondary)",
                      }}
                    >
                      {repo.language && <span>{repo.language}</span>}
                      {repo.is_fork && <span>Fork</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {isOwn && (
          <div
            style={{
              marginTop: "48px",
              paddingTop: "32px",
              borderTop: "1.5px solid rgba(56, 49, 57, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <h4 style={{ color: "#921f3a", fontSize: "1.2rem", fontWeight: 700 }}>
                Delete account
              </h4>
              <p
                style={{
                  fontSize: "var(--dp-typography-small)",
                  color: "var(--dp-color-ink-secondary)",
                }}
              >
                Permanently removes your profile, repositories, skills, and
                connection data.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={() => {
                setDeleteConfirmation("");
                setIsDeleteOpen(true);
              }}
            >
              Delete account
            </Button>
          </div>
        )}
      </div>

      <ContextualInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        developer={profile}
      />

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete account"
        description="This cannot be undone."
        maxWidth="460px"
      >
        <p
          style={{
            fontSize: "var(--dp-typography-small)",
            color: "var(--dp-color-ink-secondary)",
            lineHeight: 1.55,
          }}
        >
          Type <strong>DELETE</strong> to confirm. Your profile and connection
          history will be permanently removed.
        </p>
        <Input
          label="Confirmation"
          value={deleteConfirmation}
          onChange={(event) => setDeleteConfirmation(event.target.value)}
          placeholder="DELETE"
          autoComplete="off"
        />
        {actionError && (
          <p
            role="alert"
            style={{
              fontSize: "var(--dp-typography-caption)",
              color: "var(--status-danger)",
              fontWeight: 600,
            }}
          >
            {actionError}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <Button
            variant="ghost"
            type="button"
            onClick={() => setIsDeleteOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            type="button"
            onClick={() => void deleteAccount()}
            isLoading={isDeleting}
            disabled={deleteConfirmation !== "DELETE"}
            leftIcon={<Trash2 size={14} />}
          >
            Delete permanently
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div
          className="container-max"
          style={{ paddingTop: "60px", textAlign: "center" }}
        >
          <p style={{ color: "var(--dp-color-ink-secondary)" }}>
            Loading profile...
          </p>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
