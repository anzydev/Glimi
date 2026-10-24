"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Clock, Star, Sparkles, Send, GitBranch } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import type { EvidenceType, PublicProfile } from "@/lib/types";

interface DeveloperCardProps {
  developer: PublicProfile;
  onInvite: (dev: PublicProfile) => void;
}

const evidenceLabels: Record<EvidenceType, string> = {
  observed: "Observed in public repos",
  verified: "Source-marked as verified",
  reported: "Self-reported",
  learning: "Learning",
};

export const DeveloperCard: React.FC<DeveloperCardProps> = ({
  developer,
  onInvite,
}) => {
  const displayName = developer.name || developer.username;
  const matchPercent =
    typeof developer.matchScore === "number"
      ? Math.round(
          developer.matchScore <= 1
            ? developer.matchScore * 100
            : developer.matchScore
        )
      : null;

  return (
    <Card
      variant="cream"
      style={{
        padding: "28px",
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
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Avatar src={developer.avatar_url} name={displayName} size="lg" />
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <Link
                href={`/profile/${developer.username}`}
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--dp-color-ink)",
                  letterSpacing: "-0.02em",
                }}
              >
                {displayName}
              </Link>
              {developer.company && (
                <span
                  style={{
                    fontSize: "var(--dp-typography-caption)",
                    color: "var(--dp-color-ink-secondary)",
                  }}
                >
                  {developer.company}
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "2px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "var(--dp-typography-metadata)",
                  color: "var(--dp-color-ink-secondary)",
                  fontWeight: 600,
                }}
              >
                @{developer.username}
              </span>
              {developer.location && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "var(--dp-typography-caption)",
                    color: "var(--dp-color-ink-secondary)",
                  }}
                >
                  <MapPin size={12} color="var(--dp-color-accent)" />{" "}
                  {developer.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {matchPercent !== null ? (
          <Badge variant="yellow" size="md">
            <Sparkles size={12} />
            <span>{matchPercent}% signal</span>
          </Badge>
        ) : developer.time_commitment ? (
          <Badge variant="blue" size="sm">
            <Clock size={12} /> {developer.time_commitment}
          </Badge>
        ) : null}
      </div>

      {developer.intents.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {developer.intents.map((intent) => (
            <Badge key={intent} variant="intent" size="sm">
              #{intent.replace("-", " ")}
            </Badge>
          ))}
        </div>
      )}

      {developer.summary_ai ? (
        <div
          style={{
            backgroundColor: "var(--dp-color-surface-compare)",
            borderRadius: "24px",
            boxShadow: "var(--clay-shadow-lavender)",
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                fontSize: "var(--dp-typography-caption)",
                fontWeight: 700,
                color: "var(--dp-color-ink)",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Sparkles size={12} /> AI-generated summary
            </span>
          </div>
          <p
            style={{
              fontSize: "var(--dp-typography-small)",
              color: "var(--dp-color-ink)",
              lineHeight: 1.55,
            }}
          >
            {developer.summary_ai}
          </p>
          <p
            style={{
              fontSize: "var(--dp-typography-caption)",
              color: "var(--dp-color-ink-secondary)",
              marginTop: "6px",
            }}
          >
            Generated from public repository metadata. It may be incomplete or
            inaccurate.
          </p>
        </div>
      ) : developer.bio ? (
        <p
          style={{
            fontSize: "var(--dp-typography-small)",
            color: "var(--dp-color-ink-secondary)",
            lineHeight: 1.55,
          }}
        >
          {developer.bio}
        </p>
      ) : null}

      {developer.skills.length > 0 && (
        <div>
          <span
            style={{
              fontSize: "var(--dp-typography-caption)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--dp-color-ink-secondary)",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Skills and evidence
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {developer.skills.slice(0, 5).map((skill) => (
              <Badge
                key={`${skill.name}-${skill.evidence_type}`}
                variant={skill.evidence_type}
                size="sm"
                title={evidenceLabels[skill.evidence_type]}
              >
                {skill.name}
                {skill.repo_count ? ` (${skill.repo_count})` : ""}
              </Badge>
            ))}
          </div>
          <p
            style={{
              fontSize: "var(--dp-typography-caption)",
              color: "var(--dp-color-ink-secondary)",
              marginTop: "6px",
            }}
          >
            Evidence labels describe how information was obtained; they are not
            an endorsement.
          </p>
        </div>
      )}

      {developer.repositories.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span
            style={{
              fontSize: "var(--dp-typography-caption)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--dp-color-ink-secondary)",
            }}
          >
            Public repositories
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
            {developer.repositories.slice(0, 2).map((repo) => (
              <a
                key={repo.repo_url}
                href={repo.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  backgroundColor: "#edeef6",
                  borderRadius: "var(--dp-radius-control)",
                  boxShadow: "var(--clay-shadow-recessed)",
                  fontSize: "var(--dp-typography-small)",
                  transition: "transform var(--dp-motion-interaction) ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    overflow: "hidden",
                  }}
                >
                  <GitBranch size={14} color="var(--dp-color-ink)" />
                  <span
                    style={{
                      fontWeight: 700,
                      color: "var(--dp-color-ink)",
                      fontFamily: "var(--dp-typography-mono-face)",
                      fontSize: "0.825rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {repo.name}
                  </span>
                  {repo.language && (
                    <span
                      style={{
                        color: "var(--dp-color-ink-secondary)",
                        fontSize: "0.8rem",
                      }}
                    >
                      &bull; {repo.language}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "var(--dp-color-ink)",
                  }}
                >
                  <Star size={12} color="#7a5210" fill="#f9e7a8" />
                  <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                    {repo.stars_count ?? 0}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {developer.matchReason && (
        <p
          style={{
            fontSize: "var(--dp-typography-caption)",
            color: "var(--dp-color-ink-secondary)",
            lineHeight: 1.5,
          }}
        >
          <strong>Why this surfaced:</strong> {developer.matchReason}
        </p>
      )}

      <div
        style={{
          marginTop: "auto",
          paddingTop: "16px",
          borderTop: "1px solid rgba(56, 49, 57, 0.08)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Button
          variant="primary"
          size="sm"
          style={{ flex: 1 }}
          leftIcon={<Send size={14} />}
          onClick={() => onInvite(developer)}
        >
          Invite to build
        </Button>
        <Link href={`/profile/${developer.username}`} style={{ flex: 1 }}>
          <Button variant="secondary" size="sm" style={{ width: "100%" }}>
            View profile
          </Button>
        </Link>
      </div>
    </Card>
  );
};
