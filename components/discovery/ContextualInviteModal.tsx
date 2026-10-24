"use client";

import React, { useState } from "react";
import { Send, ShieldCheck, AlertCircle } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Avatar } from "../ui/Avatar";
import { signInWithGitHub } from "@/lib/auth/signIn";
import { INTENTS, type Intent, type PublicProfile } from "@/lib/types";

interface ContextualInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  developer: PublicProfile | null;
  onSuccess?: () => void;
}

const intentLabels: Record<Intent, string> = {
  "side-projects": "Side project",
  hackathons: "Hackathon team",
  "open-source": "Open source",
  pairing: "Pair programming",
};

function defaultIntent(developer: PublicProfile | null): Intent {
  const first = developer?.intents.find((intent): intent is Intent =>
    INTENTS.includes(intent as Intent)
  );
  return first ?? "side-projects";
}

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: unknown };
    if (typeof data.error === "string") return data.error;
  } catch {
    // Fall through to the generic message.
  }
  return "The invitation could not be sent. Please try again.";
}

export const ContextualInviteModal: React.FC<ContextualInviteModalProps> = ({
  isOpen,
  onClose,
  developer,
  onSuccess,
}) => {
  const [intent, setIntent] = useState<Intent>(defaultIntent(developer));
  const [projectName, setProjectName] = useState("");
  const [contextMessage, setContextMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  if (!developer) return null;

  const resetState = () => {
    setSuccess(false);
    setError(null);
    setNeedsAuth(false);
    setIntent(defaultIntent(developer));
    setProjectName("");
    setContextMessage("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!projectName.trim()) {
      setError("Add a project name or title.");
      return;
    }
    if (contextMessage.trim().length < 20) {
      setError("Add at least 20 characters of collaboration context.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: developer.id,
          intent,
          projectName: projectName.trim(),
          contextMessage: contextMessage.trim(),
        }),
      });

      if (response.status === 401) {
        setNeedsAuth(true);
        setError("Sign in with GitHub to send an invitation.");
        return;
      }

      if (!response.ok) {
        setError(await readError(response));
        return;
      }

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      console.error("Invitation failed:", err);
      setError("Network error. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Send an invitation"
      description={`Ask @${developer.username} whether they want to collaborate`}
      maxWidth="560px"
    >
      {success ? (
        <div
          style={{
            textAlign: "center",
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "var(--dp-color-surface-support)",
              boxShadow: "var(--clay-shadow-mint)",
              color: "#1d5c2c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h3
            style={{
              fontSize: "1.45rem",
              color: "var(--dp-color-ink)",
              fontWeight: 700,
            }}
          >
            Invitation sent
          </h3>
          <p
            style={{
              fontSize: "var(--dp-typography-body)",
              color: "var(--dp-color-ink-secondary)",
              lineHeight: 1.55,
            }}
          >
            @{developer.username} can accept or decline. Messages and contact
            details unlock only after they accept.
          </p>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        </div>
      ) : needsAuth ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <p
            style={{
              fontSize: "var(--dp-typography-body)",
              color: "var(--dp-color-ink-secondary)",
              lineHeight: 1.55,
            }}
          >
            Invitations are tied to a real account so the recipient can see who
            is reaching out. Sign in with GitHub to continue.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <Button variant="ghost" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={() =>
                signInWithGitHub(
                  `/profile/${developer.username}`
                )
              }
            >
              Sign in with GitHub
            </Button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "12px 18px",
              backgroundColor: "#edeef6",
              borderRadius: "var(--dp-radius-control)",
              boxShadow: "var(--clay-shadow-recessed)",
            }}
          >
            <Avatar
              src={developer.avatar_url}
              name={developer.name || developer.username}
              size="md"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: "var(--dp-color-ink)",
                }}
              >
                {developer.name || developer.username} (@{developer.username})
              </div>
              <div
                style={{
                  fontSize: "var(--dp-typography-caption)",
                  color: "var(--dp-color-ink-secondary)",
                }}
              >
                {developer.skills.length > 0
                  ? `Public skills: ${developer.skills
                      .slice(0, 3)
                      .map((skill) => skill.name)
                      .join(", ")}`
                  : "No public skills listed"}
              </div>
            </div>
          </div>

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
              Collaboration intent
            </legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {INTENTS.map((value) => {
                const isSelected = intent === value;
                return (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={isSelected}
                    onClick={() => setIntent(value)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "var(--dp-radius-control)",
                      fontSize: "var(--dp-typography-small)",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "none",
                      backgroundColor: isSelected
                        ? "var(--dp-color-accent)"
                        : "var(--dp-color-surface)",
                      boxShadow: isSelected
                        ? "var(--clay-shadow-pill-pink)"
                        : "var(--clay-shadow-pill)",
                      color: "var(--dp-color-ink)",
                      transition:
                        "transform var(--dp-motion-interaction) ease, box-shadow var(--dp-motion-interaction) ease",
                    }}
                  >
                    {intentLabels[value]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Input
            label="Project name or title"
            placeholder="e.g. Distributed ledger observability tool"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            maxLength={120}
            required
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="invite-context"
              style={{
                fontSize: "var(--dp-typography-small)",
                fontWeight: 700,
                color: "var(--dp-color-ink)",
                marginLeft: "12px",
              }}
            >
              Why are you reaching out?
            </label>
            <textarea
              id="invite-context"
              rows={4}
              maxLength={2000}
              placeholder="Share what you are building, what kind of help you need, and why you think they may be a fit."
              value={contextMessage}
              onChange={(event) => setContextMessage(event.target.value)}
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
              {contextMessage.trim().length}/2000 characters (20 minimum)
            </span>
          </div>

          {error && (
            <span
              role="alert"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "var(--dp-typography-caption)",
                color: "var(--status-danger)",
                fontWeight: 600,
                marginLeft: "12px",
              }}
            >
              <AlertCircle size={14} /> {error}
            </span>
          )}

          <div
            style={{
              padding: "12px 18px",
              backgroundColor: "var(--dp-color-surface-compare)",
              borderRadius: "var(--dp-radius-control)",
              boxShadow: "var(--clay-shadow-lavender)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <ShieldCheck
              size={18}
              color="var(--dp-color-ink)"
              style={{ flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: "var(--dp-typography-caption)",
                color: "var(--dp-color-ink)",
                fontWeight: 600,
              }}
            >
              Invitations are requests, not messages. Contact details and chat
              are shared only after the recipient accepts.
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "6px",
            }}
          >
            <Button
              variant="ghost"
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              disabled={contextMessage.trim().length < 20 || !projectName.trim()}
              leftIcon={<Send size={15} />}
            >
              Send invitation
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
