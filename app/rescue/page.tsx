"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { signInWithGitHub } from "@/lib/auth/signIn";
import { createClient } from "@/lib/supabase/client";
import {
  TASK_TYPES,
  type RescueStatus,
  type RescueView,
  type TaskType,
} from "@/lib/types";
import {
  LifeBuoy,
  Plus,
  GitPullRequest,
  Bug,
  Layers,
  HelpCircle,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Wrench,
  GitMerge,
} from "lucide-react";

type TypeFilter = "all" | TaskType;

const taskLabels: Record<TaskType, string> = {
  bugfix: "Bug fix",
  refactor: "Refactor",
  feature: "Feature",
  review: "Code review",
  setup: "Setup / tooling",
  architecture: "Architecture",
};

const statusLabels: Record<RescueStatus, string> = {
  open: "Open",
  claimed: "Claimed",
  in_progress: "In progress",
  completed: "Completed",
  abandoned: "Abandoned",
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

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function TaskTypeBadge({ type }: { type: TaskType }) {
  switch (type) {
    case "bugfix":
      return (
        <Badge variant="pink" size="sm">
          <Bug size={11} /> Bug fix
        </Badge>
      );
    case "architecture":
      return (
        <Badge variant="lavender" size="sm">
          <Layers size={11} /> Architecture
        </Badge>
      );
    case "review":
      return (
        <Badge variant="mint" size="sm">
          <GitPullRequest size={11} /> Code review
        </Badge>
      );
    case "refactor":
      return (
        <Badge variant="blue" size="sm">
          <GitMerge size={11} /> Refactor
        </Badge>
      );
    case "feature":
      return (
        <Badge variant="yellow" size="sm">
          <Wrench size={11} /> Feature
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" size="sm">
          <HelpCircle size={11} /> Setup
        </Badge>
      );
  }
}

function StatusBadge({ status }: { status: RescueStatus }) {
  if (status === "completed") {
    return (
      <Badge variant="verified" size="sm">
        <CheckCircle size={11} /> {statusLabels[status]}
      </Badge>
    );
  }
  if (status === "open") {
    return (
      <Badge variant="reported" size="sm">
        <Clock size={11} /> {statusLabels[status]}
      </Badge>
    );
  }
  if (status === "claimed" || status === "in_progress") {
    return (
      <Badge variant="mint" size="sm">
        <Wrench size={11} /> {statusLabels[status]}
      </Badge>
    );
  }
  return (
    <Badge variant="neutral" size="sm">
      {statusLabels[status]}
    </Badge>
  );
}

export default function RescuePage() {
  const [rescues, setRescues] = useState<RescueView[]>([]);
  const [selectedType, setSelectedType] = useState<TypeFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claimSession, setClaimSession] = useState<RescueView | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [repoUrl, setRepoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("bugfix");
  const [techStackInput, setTechStackInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRescues = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rescue", { cache: "no-store" });
      if (!response.ok) {
        setError(await readError(response, "Rescue requests could not be loaded."));
        return;
      }
      const data = (await response.json()) as {
        rescues?: RescueView[];
        signedIn?: boolean;
      };
      setRescues(data.rescues ?? []);
      setSignedIn(Boolean(data.signedIn));
    } catch (err) {
      console.error("Rescue load failed:", err);
      setError("Rescue requests could not be loaded. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/rescue", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return {
            ok: false as const,
            error: await readError(
              response,
              "Rescue requests could not be loaded."
            ),
          };
        }
        const payload = (await response.json()) as {
          rescues?: RescueView[];
          signedIn?: boolean;
        };
        return {
          ok: true as const,
          rescues: payload.rescues ?? [],
          signedIn: Boolean(payload.signedIn),
        };
      })
      .then((data) => {
        if (!active) return;
        if (!data.ok) {
          setError(data.error);
          return;
        }
        setRescues(data.rescues);
        setSignedIn(data.signedIn);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Rescue load failed:", err);
        setError("Rescue requests could not be loaded. Check your connection.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

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

  const resetForm = () => {
    setRepoUrl("");
    setTitle("");
    setDescription("");
    setTaskType("bugfix");
    setTechStackInput("");
    setFormError(null);
  };

  const createRescue = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!repoUrl.trim() || !title.trim() || description.trim().length < 20) {
      setFormError(
        "Add a repository URL, a short summary, and at least 20 characters of context."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/rescue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          issueOrTask: title.trim(),
          description: description.trim(),
          taskType,
          techStack: techStackInput
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 12),
        }),
      });

      if (response.status === 401) {
        setFormError("Sign in with GitHub to post a rescue request.");
        return;
      }

      if (!response.ok) {
        setFormError(await readError(response, "The request could not be posted."));
        return;
      }

      setIsModalOpen(false);
      resetForm();
      await loadRescues();
    } catch (err) {
      console.error("Rescue create failed:", err);
      setFormError("Network error. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const actOnRescue = async (
    rescue: RescueView,
    action: "claim" | "complete" | "abandon"
  ) => {
    if (busyId) return;
    setBusyId(rescue.id);
    setActionError(null);

    try {
      const response = await fetch(`/api/rescue/${rescue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error(
          await readError(response, "The rescue request could not be updated.")
        );
      }

      setClaimSession(null);
      await loadRescues();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "The rescue request could not be updated."
      );
    } finally {
      setBusyId(null);
    }
  };

  const filteredRescues =
    selectedType === "all"
      ? rescues
      : rescues.filter((rescue) => rescue.taskType === selectedType);

  return (
    <AppShell>
      <div
        className="container-max"
        style={{ paddingTop: "32px", paddingBottom: "64px" }}
      >
        <div
          className="clay-cushion-blue"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
            marginBottom: "36px",
            padding: "40px",
          }}
        >
          <div>
            <div style={{ display: "inline-flex", marginBottom: "12px" }}>
              <span className="ai-badge">
                <LifeBuoy size={13} /> Peer assistance
              </span>
            </div>
            <h1
              style={{ marginBottom: "10px", fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Contributor Rescue
            </h1>
            <p
              style={{
                maxWidth: "620px",
                color: "var(--dp-color-ink-secondary)",
                fontSize: "1.1rem",
                lineHeight: 1.6,
              }}
            >
              Post a specific blocker or offer to help with one. Requests link to
              public repositories; claiming marks who is handling it.
            </p>
          </div>

          {signedIn ? (
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus size={16} />}
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
            >
              Post a rescue request
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              leftIcon={<LifeBuoy size={16} />}
              onClick={() => signInWithGitHub("/rescue")}
            >
              Sign in to post
            </Button>
          )}
        </div>

        {error && (
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
            <AlertCircle size={16} /> {error}
          </div>
        )}

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

        <div
          role="group"
          aria-label="Filter rescue requests by task type"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "28px",
            flexWrap: "wrap",
            padding: "0 8px",
          }}
        >
          <Chip
            label="All requests"
            selected={selectedType === "all"}
            onSelect={() => setSelectedType("all")}
          />
          {TASK_TYPES.map((type) => (
            <Chip
              key={type}
              label={taskLabels[type]}
              selected={selectedType === type}
              onSelect={() => setSelectedType(type)}
            />
          ))}
        </div>

        {isLoading ? (
          <div
            className="clay-cushion-cream"
            style={{ padding: "48px 24px", textAlign: "center" }}
          >
            <p style={{ color: "var(--dp-color-ink-secondary)" }}>
              Loading rescue requests...
            </p>
          </div>
        ) : filteredRescues.length === 0 ? (
          <div
            className="clay-cushion-cream"
            style={{ padding: "56px 24px", textAlign: "center" }}
          >
            <p style={{ color: "var(--dp-color-ink-secondary)", fontSize: "1.1rem" }}>
              No rescue requests match this filter yet.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
            {filteredRescues.map((rescue) => (
              <Card
                key={rescue.id}
                variant="cream"
                style={{
                  padding: "32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <Avatar
                      src={rescue.creator.avatar_url}
                      name={rescue.creator.name || rescue.creator.username}
                      size="md"
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "1.15rem",
                          color: "var(--dp-color-ink)",
                        }}
                      >
                        {rescue.creator.name || rescue.creator.username}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--dp-typography-caption)",
                          color: "var(--dp-color-ink-secondary)",
                        }}
                      >
                        @{rescue.creator.username}
                        {rescue.createdAt ? ` · ${formatDate(rescue.createdAt)}` : ""}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <TaskTypeBadge type={rescue.taskType} />
                    <StatusBadge status={rescue.status} />
                    {rescue.claimedBy && (
                      <Badge variant="neutral" size="sm">
                        Helper: {rescue.claimedBy.name || rescue.claimedBy.username}
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: "1.3rem",
                      marginBottom: "8px",
                      color: "var(--dp-color-ink)",
                    }}
                  >
                    {rescue.issueOrTask}
                  </h3>
                  <p
                    style={{
                      fontSize: "var(--dp-typography-body)",
                      color: "var(--dp-color-ink-secondary)",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {rescue.description}
                  </p>
                </div>

                {rescue.techStack.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {rescue.techStack.map((tech) => (
                      <span
                        key={tech}
                        style={{
                          fontFamily: "var(--dp-typography-mono-face)",
                          fontSize: "0.825rem",
                          backgroundColor: "#edeef6",
                          color: "var(--dp-color-ink)",
                          padding: "4px 12px",
                          borderRadius: "var(--dp-radius-control)",
                          boxShadow: "var(--clay-shadow-recessed)",
                          fontWeight: 600,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    borderTop: "1px solid rgba(56, 49, 57, 0.08)",
                    paddingTop: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <a
                    href={rescue.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "var(--dp-typography-small)",
                      color: "var(--dp-color-ink)",
                      fontFamily: "var(--dp-typography-mono-face)",
                      fontWeight: 700,
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>{rescue.repoName}</span>
                  </a>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {rescue.status === "open" && !rescue.isOwner && (
                      signedIn ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setClaimSession(rescue)}
                        >
                          Offer assistance
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => signInWithGitHub("/rescue")}
                        >
                          Sign in to help
                        </Button>
                      )
                    )}

                    {(rescue.isOwner || rescue.isClaimer) &&
                      (rescue.status === "claimed" ||
                        rescue.status === "in_progress") && (
                        <Button
                          variant="mint"
                          size="sm"
                          onClick={() => void actOnRescue(rescue, "complete")}
                          isLoading={busyId === rescue.id}
                          leftIcon={<CheckCircle size={14} />}
                        >
                          Mark complete
                        </Button>
                      )}

                    {rescue.isOwner &&
                      (rescue.status === "open" ||
                        rescue.status === "claimed" ||
                        rescue.status === "in_progress") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Close this rescue request without marking it complete?"
                              )
                            ) {
                              void actOnRescue(rescue, "abandon");
                            }
                          }}
                          isLoading={busyId === rescue.id}
                        >
                          Close request
                        </Button>
                      )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post a rescue request"
        description="Share a specific blocker and link the public repository"
        maxWidth="540px"
      >
        <form
          onSubmit={createRescue}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <Input
            label="GitHub repository URL"
            placeholder="https://github.com/username/project"
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            maxLength={300}
            required
          />

          <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
            <legend
              style={{
                fontSize: "var(--dp-typography-small)",
                fontWeight: 700,
                color: "var(--dp-color-ink)",
                display: "block",
                marginBottom: "8px",
                marginLeft: "12px",
              }}
            >
              Assistance type
            </legend>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {TASK_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  aria-pressed={taskType === type}
                  onClick={() => setTaskType(type)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "var(--dp-radius-control)",
                    fontSize: "var(--dp-typography-metadata)",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "none",
                    backgroundColor:
                      taskType === type
                        ? "var(--dp-color-accent)"
                        : "var(--dp-color-surface)",
                    boxShadow:
                      taskType === type
                        ? "var(--clay-shadow-pill-pink)"
                        : "var(--clay-shadow-pill)",
                    color: "var(--dp-color-ink)",
                  }}
                >
                  {taskLabels[type]}
                </button>
              ))}
            </div>
          </fieldset>

          <Input
            label="Summary of the blocker"
            placeholder="e.g. Memory leak during WebSocket frame deserialization"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={160}
            required
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="rescue-description"
              style={{
                fontSize: "var(--dp-typography-small)",
                fontWeight: 700,
                color: "var(--dp-color-ink)",
                marginLeft: "12px",
              }}
            >
              Details and what you tried
            </label>
            <textarea
              id="rescue-description"
              rows={4}
              maxLength={4000}
              placeholder="Describe the failure, reproduction steps, or the specific file where you are stuck."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
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
              {description.trim().length}/4000 characters (20 minimum)
            </span>
          </div>

          <Input
            label="Tech stack tags (comma separated)"
            placeholder="Rust, Tokio, Async"
            value={techStackInput}
            onChange={(event) => setTechStackInput(event.target.value)}
            maxLength={400}
          />

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
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              disabled={
                !repoUrl.trim() ||
                !title.trim() ||
                description.trim().length < 20
              }
            >
              Publish request
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(claimSession)}
        onClose={() => setClaimSession(null)}
        title="Offer assistance"
        description={
          claimSession
            ? `Claim ${claimSession.issueOrTask}`
            : undefined
        }
        maxWidth="480px"
      >
        {claimSession && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <p
              style={{
                fontSize: "var(--dp-typography-body)",
                color: "var(--dp-color-ink-secondary)",
                lineHeight: 1.55,
              }}
            >
              Claiming marks you as the helper so others know this request is
              being handled. It does not create a chat; coordinate through the
              repository or an accepted connection.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <Button variant="ghost" onClick={() => setClaimSession(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => void actOnRescue(claimSession, "claim")}
                isLoading={busyId === claimSession.id}
              >
                Confirm claim
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
