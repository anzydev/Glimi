import test from "node:test";
import assert from "node:assert/strict";
import {
  extractHeuristicSkills,
  rankCandidates,
  scoreCandidate,
} from "../lib/discovery/scoring.ts";
import type { PublicProfile } from "../lib/types.ts";

function profile(overrides: Partial<PublicProfile> = {}): PublicProfile {
  return {
    id: "user-1",
    username: "alice",
    name: "Alice",
    avatar_url: null,
    bio: null,
    location: null,
    company: null,
    website: null,
    public_repos_count: 2,
    followers_count: 1,
    intents: ["side-projects"],
    time_commitment: "weekends",
    timezones: ["America/New_York"],
    summary_ai: null,
    is_ai_generated: null,
    skills: [
      {
        name: "TypeScript",
        category: null,
        evidence_type: "observed",
        repo_count: 2,
        primary_language: true,
        evidence_summary: null,
      },
    ],
    repositories: [
      {
        name: "next-app",
        description: "A Next.js application",
        language: "TypeScript",
        stars_count: 4,
        repo_url: "https://github.com/alice/next-app",
        topics: ["nextjs"],
      },
    ],
    ...overrides,
  };
}

test("extractHeuristicSkills finds multi-word and punctuated skills", () => {
  assert.deepEqual(extractHeuristicSkills("Need Next.js and distributed systems help"), [
    "next.js",
    "distributed systems",
  ]);
  assert.deepEqual(extractHeuristicSkills("Rust or Go for a CLI"), ["rust", "go"]);
  assert.deepEqual(extractHeuristicSkills("Nothing technical here"), []);
});

test("scoreCandidate rewards matching skills and intent", () => {
  const strong = scoreCandidate(profile(), {
    skills: ["typescript"],
    intent: "side-projects",
    timeCommitment: "weekends",
    timezoneHint: "new york",
  });
  const weak = scoreCandidate(
    profile({
      skills: [],
      repositories: [],
      intents: ["hackathons"],
      time_commitment: "full-time",
      timezones: [],
    }),
    {
      skills: ["typescript"],
      intent: "side-projects",
      timeCommitment: "weekends",
      timezoneHint: "new york",
    }
  );

  assert.ok(strong.score > weak.score);
  assert.match(strong.reason, /Overlapping/);
  assert.match(weak.reason, /no specific overlap/i);
});

test("rankCandidates sorts by match score and annotates reasons", () => {
  const ranked = rankCandidates(
    [
      profile({
        id: "rust-user",
        username: "rusty",
        skills: [
          {
            name: "Rust",
            category: null,
            evidence_type: "observed",
            repo_count: 1,
            primary_language: true,
            evidence_summary: null,
          },
        ],
        repositories: [],
      }),
      profile({ id: "ts-user", username: "ts-user" }),
    ],
    { skills: ["typescript"] }
  );

  assert.equal(ranked[0].id, "ts-user");
  assert.ok((ranked[0].matchScore ?? 0) > (ranked[1].matchScore ?? 0));
  assert.ok(ranked.every((candidate) => typeof candidate.matchReason === "string"));
});
