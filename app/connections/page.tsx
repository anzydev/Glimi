"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { signInWithGitHub } from "@/lib/auth/signIn";
import type {
  ConnectionContact,
  ConnectionView,
  MessageView,
} from "@/lib/types";
import {
  Users,
  Send,
  Check,
  X,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Clock,
  Mail,
} from "lucide-react";

type Tab = "incoming" | "active" | "outgoing";

const tabLabels: Record<Tab, string> = {
  incoming: "Incoming",
  active: "Active",
  outgoing: "Sent",
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
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function contactHref(contact: ConnectionContact): string | null {
  if (!contact.handle) return null;
  if (contact.preference === "github") {
    return `https://github.com/${contact.handle.replace(/^@/, "")}`;
  }
  if (contact.preference === "email") {
    return `mailto:${contact.handle}`;
  }
  return null;
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<ConnectionView[]>([]);
  const [selectedTab, setSelectedTab] = useState<Tab>("incoming");
  const [isLoading, setIsLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [messageErrors, setMessageErrors] = useState<Record<string, string>>({});

  const loadConnections = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/connections", { cache: "no-store" });

      if (response.status === 401) {
        setNeedsAuth(true);
        setConnections([]);
        return;
      }

      if (!response.ok) {
        setError(await readError(response, "Connections could not be loaded."));
        return;
      }

      const data = (await response.json()) as {
        connections?: ConnectionView[];
      };
      setConnections(data.connections ?? []);
      setNeedsAuth(false);
    } catch (err) {
      console.error("Connections load failed:", err);
      setError("Connections could not be loaded. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConnections();
  }, [loadConnections]);

  const handleAction = async (
    connectionId: string,
    action: "accept" | "decline" | "cancel"
  ) => {
    if (busyId) return;
    setBusyId(connectionId);
    setActionError(null);

    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error(
          await readError(response, "The invitation could not be updated.")
        );
      }

      if (action === "accept") setSelectedTab("active");
      await loadConnections();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "The invitation could not be updated."
      );
    } finally {
      setBusyId(null);
    }
  };

  const sendMessage = async (connection: ConnectionView) => {
    const content = (drafts[connection.id] ?? "").trim();
    if (!content || sendingId) return;

    setSendingId(connection.id);
    setMessageErrors((prev) => ({ ...prev, [connection.id]: "" }));

    try {
      const response = await fetch(
        `/api/connections/${connection.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error(await readError(response, "Message could not be sent."));
      }

      const data = (await response.json()) as { message: MessageView };
      setConnections((prev) =>
        prev.map((item) =>
          item.id === connection.id
            ? { ...item, messages: [...item.messages, data.message] }
            : item
        )
      );
      setDrafts((prev) => ({ ...prev, [connection.id]: "" }));
    } catch (err) {
      setMessageErrors((prev) => ({
        ...prev,
        [connection.id]:
          err instanceof Error ? err.message : "Message could not be sent.",
      }));
    } finally {
      setSendingId(null);
    }
  };

  const incoming = connections.filter(
    (connection) =>
      connection.status === "pending" && connection.direction === "incoming"
  );
  const outgoing = connections.filter(
    (connection) =>
      connection.status === "pending" && connection.direction === "outgoing"
  );
  const active = connections.filter(
    (connection) => connection.status === "accepted"
  );

  const visibleConnections =
    selectedTab === "incoming"
      ? incoming
      : selectedTab === "active"
        ? active
        : outgoing;

  const renderContact = (connection: ConnectionView) => {
    if (!connection.contact) return null;
    const href = contactHref(connection.contact);
    const label =
      connection.contact.preference === "in-app"
        ? "In-app messaging"
        : connection.contact.handle ?? "No handle shared";

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "var(--dp-typography-caption)",
          color: "var(--dp-color-ink-secondary)",
          flexWrap: "wrap",
        }}
      >
        <ShieldCheck size={14} />
        <span>Shared after acceptance:</span>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--dp-color-ink)",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {connection.contact.preference === "email" ? (
              <Mail size={13} />
            ) : (
              <span>@</span>
            )}
            {label}
          </a>
        ) : (
          <span style={{ fontWeight: 700, color: "var(--dp-color-ink)" }}>
            {label}
          </span>
        )}
      </div>
    );
  };

  return (
    <AppShell>
      <div
        className="container-max"
        style={{ paddingTop: "32px", paddingBottom: "64px" }}
      >
        <div
          className="clay-cushion-mint"
          style={{ padding: "40px", marginBottom: "36px" }}
        >
          <div style={{ display: "inline-flex", marginBottom: "12px" }}>
            <span className="ai-badge">
              <ShieldCheck size={13} /> Invitations and consent
            </span>
          </div>
          <h1
            style={{ marginBottom: "10px", fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Connections
          </h1>
          <p
            style={{
              color: "var(--dp-color-ink-secondary)",
              fontSize: "1.1rem",
              maxWidth: "660px",
              lineHeight: 1.6,
            }}
          >
            Invitations include project context before anyone can message.
            Chat and contact details unlock only after the recipient accepts.
          </p>
        </div>

        {needsAuth ? (
          <div
            className="clay-cushion-cream"
            style={{
              padding: "48px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <Users size={28} />
            <p style={{ fontSize: "1.15rem", fontWeight: 700 }}>
              Sign in to see your invitations and messages.
            </p>
            <p
              style={{
                fontSize: "var(--dp-typography-small)",
                color: "var(--dp-color-ink-secondary)",
                maxWidth: "480px",
              }}
            >
              Connections are private to the two people involved.
            </p>
            <Button
              variant="primary"
              onClick={() => signInWithGitHub("/connections")}
            >
              Sign in with GitHub
            </Button>
          </div>
        ) : (
          <>
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
              role="tablist"
              aria-label="Connection lists"
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "28px",
                padding: "0 8px",
                flexWrap: "wrap",
              }}
            >
              {(["incoming", "active", "outgoing"] as Tab[]).map((tab) => {
                const count =
                  tab === "incoming"
                    ? incoming.length
                    : tab === "active"
                      ? active.length
                      : outgoing.length;
                const isActive = selectedTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedTab(tab)}
                    style={{
                      background: isActive
                        ? "var(--dp-color-accent)"
                        : "var(--dp-color-surface)",
                      boxShadow: isActive
                        ? "var(--clay-shadow-pill-pink)"
                        : "var(--clay-shadow-pill)",
                      borderRadius: "var(--dp-radius-control)",
                      padding: "10px 22px",
                      fontSize: "var(--dp-typography-small)",
                      fontWeight: 700,
                      color: "var(--dp-color-ink)",
                      cursor: "pointer",
                      border: "none",
                      transition:
                        "transform var(--dp-motion-interaction) ease, box-shadow var(--dp-motion-interaction) ease",
                    }}
                  >
                    {tabLabels[tab]} ({count})
                  </button>
                );
              })}
            </div>

            {isLoading ? (
              <div
                className="clay-cushion-cream"
                style={{ padding: "48px 24px", textAlign: "center" }}
              >
                <p style={{ color: "var(--dp-color-ink-secondary)" }}>
                  Loading connections...
                </p>
              </div>
            ) : visibleConnections.length === 0 ? (
              <div
                className="clay-cushion-cream"
                style={{ padding: "56px 24px", textAlign: "center" }}
              >
                <p
                  style={{
                    color: "var(--dp-color-ink-secondary)",
                    fontSize: "1.1rem",
                  }}
                >
                  {selectedTab === "incoming"
                    ? "No pending invitations."
                    : selectedTab === "outgoing"
                      ? "No sent invitations waiting for a response."
                      : "No accepted connections yet. Accept an invitation or send one from discovery."}
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {visibleConnections.map((connection) => {
                  const statusLabel =
                    connection.status === "accepted"
                      ? "Accepted"
                      : connection.direction === "incoming"
                        ? "Needs your response"
                        : "Waiting for response";

                  return (
                    <Card
                      key={connection.id}
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
                            gap: "14px",
                          }}
                        >
                          <Avatar
                            src={connection.peer.avatar_url}
                            name={connection.peer.name || connection.peer.username}
                            size="md"
                          />
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                color: "var(--dp-color-ink)",
                                fontSize: "1.2rem",
                              }}
                            >
                              {connection.peer.name || connection.peer.username}
                            </div>
                            <div
                              style={{
                                fontSize: "var(--dp-typography-caption)",
                                color: "var(--dp-color-ink-secondary)",
                              }}
                            >
                              @{connection.peer.username}
                              {connection.createdAt
                                ? ` · ${formatDate(connection.createdAt)}`
                                : ""}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <Badge variant="intent" size="sm">
                            #{connection.intent.replace("-", " ")}
                          </Badge>
                          <Badge
                            variant={
                              connection.status === "accepted"
                                ? "verified"
                                : "yellow"
                            }
                            size="sm"
                          >
                            {connection.status === "accepted" ? (
                              <Check size={11} />
                            ) : (
                              <Clock size={11} />
                            )}
                            {statusLabel}
                          </Badge>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "18px 22px",
                          backgroundColor: "#edeef6",
                          borderRadius: "24px",
                          boxShadow: "var(--clay-shadow-recessed)",
                        }}
                      >
                        {connection.projectName && (
                          <div
                            style={{
                              fontSize: "1rem",
                              fontWeight: 700,
                              color: "var(--dp-color-ink)",
                              marginBottom: "4px",
                            }}
                          >
                            {connection.projectName}
                          </div>
                        )}
                        <p
                          style={{
                            fontSize: "var(--dp-typography-body)",
                            color: "var(--dp-color-ink-secondary)",
                            lineHeight: 1.55,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {connection.contextMessage}
                        </p>
                        {connection.whyMatched && (
                          <div
                            style={{
                              marginTop: "10px",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "6px",
                              fontSize: "var(--dp-typography-caption)",
                              color: "var(--dp-color-ink)",
                              fontWeight: 600,
                              lineHeight: 1.5,
                            }}
                          >
                            <Sparkles
                              size={13}
                              color="var(--dp-color-accent)"
                              style={{ flexShrink: 0, marginTop: "2px" }}
                            />
                            <span>
                              <strong>Match note (profile metadata):</strong>{" "}
                              {connection.whyMatched}
                            </span>
                          </div>
                        )}
                      </div>

                      {connection.status === "pending" &&
                        connection.direction === "incoming" && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: "12px",
                              flexWrap: "wrap",
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                void handleAction(connection.id, "decline")
                              }
                              isLoading={busyId === connection.id}
                              leftIcon={<X size={14} />}
                            >
                              Decline
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                void handleAction(connection.id, "accept")
                              }
                              isLoading={busyId === connection.id}
                              leftIcon={<Check size={14} />}
                            >
                              Accept
                            </Button>
                          </div>
                        )}

                      {connection.status === "pending" &&
                        connection.direction === "outgoing" && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: "12px",
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                void handleAction(connection.id, "cancel")
                              }
                              isLoading={busyId === connection.id}
                              leftIcon={<X size={14} />}
                            >
                              Cancel invitation
                            </Button>
                          </div>
                        )}

                      {connection.status === "accepted" && (
                        <>
                          <div>
                            <h3
                              style={{ fontSize: "1.2rem", marginBottom: "8px" }}
                            >
                              Messages
                            </h3>
                            <div
                              style={{
                                backgroundColor: "#edeef6",
                                borderRadius: "24px",
                                boxShadow: "var(--clay-shadow-recessed)",
                                padding: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                                maxHeight: "320px",
                                overflowY: "auto",
                              }}
                            >
                              {connection.messages.length === 0 ? (
                                <p
                                  style={{
                                    fontSize: "var(--dp-typography-small)",
                                    color: "var(--dp-color-ink-secondary)",
                                  }}
                                >
                                  No messages yet. Say hello and share what you
                                  want to work on.
                                </p>
                              ) : (
                                connection.messages.map((message) => (
                                  <div
                                    key={message.id}
                                    style={{
                                      fontSize: "var(--dp-typography-small)",
                                      alignSelf: message.mine
                                        ? "flex-end"
                                        : "flex-start",
                                      backgroundColor: message.mine
                                        ? "var(--dp-color-accent)"
                                        : "#ffffff",
                                      boxShadow: message.mine
                                        ? "var(--clay-shadow-pill-pink)"
                                        : "var(--clay-shadow-pill)",
                                      color: "var(--dp-color-ink)",
                                      padding: "6px 14px",
                                      borderRadius: "var(--dp-radius-control)",
                                      maxWidth: "85%",
                                      whiteSpace: "pre-wrap",
                                    }}
                                  >
                                    <span style={{ fontWeight: 700 }}>
                                      {message.senderName}:{" "}
                                    </span>
                                    <span>{message.content}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {renderContact(connection)}

                          <form
                            onSubmit={(event) => {
                              event.preventDefault();
                              void sendMessage(connection);
                            }}
                            style={{ display: "flex", gap: "10px" }}
                          >
                            <label
                              htmlFor={`message-${connection.id}`}
                              className="sr-only"
                            >
                              Message {connection.peer.name || connection.peer.username}
                            </label>
                            <input
                              id={`message-${connection.id}`}
                              type="text"
                              placeholder="Write a message..."
                              maxLength={4000}
                              value={drafts[connection.id] ?? ""}
                              onChange={(event) =>
                                setDrafts((prev) => ({
                                  ...prev,
                                  [connection.id]: event.target.value,
                                }))
                              }
                              style={{
                                flex: 1,
                                padding: "10px 18px",
                                backgroundColor: "#edeef6",
                                border: "none",
                                borderRadius: "var(--dp-radius-control)",
                                boxShadow: "var(--clay-shadow-recessed)",
                                color: "var(--dp-color-ink)",
                                fontFamily: "var(--dp-typography-face)",
                                fontSize: "var(--dp-typography-small)",
                                outline: "none",
                              }}
                            />
                            <Button
                              variant="primary"
                              size="sm"
                              type="submit"
                              isLoading={sendingId === connection.id}
                              disabled={!(drafts[connection.id] ?? "").trim()}
                              leftIcon={<Send size={14} />}
                            >
                              Send
                            </Button>
                          </form>
                          {messageErrors[connection.id] && (
                            <p
                              role="alert"
                              style={{
                                fontSize: "var(--dp-typography-caption)",
                                color: "var(--status-danger)",
                                fontWeight: 600,
                              }}
                            >
                              {messageErrors[connection.id]}
                            </p>
                          )}
                          <p
                            style={{
                              fontSize: "var(--dp-typography-caption)",
                              color: "var(--dp-color-ink-secondary)",
                            }}
                          >
                            Messages are visible only to both participants and
                            are stored in Glimi.
                          </p>
                        </>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
