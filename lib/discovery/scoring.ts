import type {
  DiscoverExtraction,
  Intent,
  PublicProfile,
  RepositorySummary,
  SkillSummary,
  TimeCommitment,
} from "../types";

export interface ScoringCriteria {
  skills: string[];
  intent?: Intent | null;
  timeCommitment?: TimeCommitment | null;
  timezoneHint?: string | null;
  text?: string;
}

const KNOWN_SKILLS = [
  "typescript",
  "javascript",
  "react",
  "next.js",
  "nextjs",
  "node",
  "python",
  "rust",
  "go",
  "golang",
  "java",
  "kotlin",
  "swift",
  "php",
  "ruby",
  "c#",
  "c++",
  "sql",
  "postgres",
  "postgresql",
  "mysql",
  "redis",
  "kafka",
  "docker",
  "kubernetes",
  "graphql",
  "supabase",
  "tailwind",
  "aws",
  "gcp",
  "azure",
  "machine learning",
  "ai",
  "llm",
  "embeddings",
  "react native",
  "android",
  "ios",
  "webassembly",
  "wasm",
  "distributed systems",
  "data engineering",
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+#.]/g, " ").replace(/\s+/g, " ").trim();
}

function uniqueNormalized(values: string[]): string[] {
  return Array.from(new Set(values.map(normalize).filter(Boolean)));
}

export function extractHeuristicSkills(query: string): string[] {
  const normalizedQuery = normalize(query);
  return KNOWN_SKILLS.filter((skill) => {
    const normalizedSkill = normalize(skill);
    if (!normalizedSkill) return false;
    if (normalizedSkill.includes(" ")) {
      return normalizedQuery.includes(normalizedSkill);
    }
    return new RegExp(`(^|\\s)${escapeRegExp(normalizedSkill)}(\\s|$)`).test(
      normalizedQuery
    );
  }).slice(0, 10);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scoreSkill(skill: SkillSummary, requested: string[]): boolean {
  const name = normalize(skill.name);
  return requested.some(
    (item) => name === item || name.includes(item) || item.includes(name)
  );
}

function scoreRepository(
  repository: RepositorySummary,
  requested: string[],
  text: string
): boolean {
  const haystack = normalize(
    [
      repository.name,
      repository.description ?? "",
      repository.language ?? "",
      ...(repository.topics ?? []),
    ].join(" ")
  );

  if (requested.some((skill) => haystack.includes(skill))) return true;
  if (!text) return false;

  const words = normalize(text)
    .split(" ")
    .filter((word) => word.length >= 4);
  return words.some((word) => haystack.includes(word));
}

function timezoneMatches(timezones: string[], hint: string | null | undefined): boolean {
  if (!hint) return false;
  const normalizedHint = normalize(hint).replace(/\s/g, "");
  return timezones.some((timezone) => {
    const normalizedZone = normalize(timezone).replace(/\s/g, "");
    return normalizedZone === normalizedHint || normalizedZone.includes(normalizedHint);
  });
}

export function scoreCandidate(
  candidate: PublicProfile,
  criteria: ScoringCriteria
): { score: number; reason: string } {
  const requested = uniqueNormalized(criteria.skills);
  const requestedText = normalize(criteria.text ?? "");
  const matchedSkills = candidate.skills.filter((skill) =>
    scoreSkill(skill, requested)
  );
  const matchedRepos = candidate.repositories.filter((repository) =>
    scoreRepository(repository, requested, requestedText)
  );

  let score = 0.1;
  score += Math.min(matchedSkills.length * 0.18, 0.54);
  score += Math.min(matchedRepos.length * 0.08, 0.24);

  if (criteria.intent && candidate.intents.includes(criteria.intent)) {
    score += 0.1;
  }
  if (
    criteria.timeCommitment &&
    candidate.time_commitment === criteria.timeCommitment
  ) {
    score += 0.04;
  }
  if (timezoneMatches(candidate.timezones, criteria.timezoneHint)) {
    score += 0.04;
  }

  const bounded = Math.max(0, Math.min(1, score));
  const evidenceNames = matchedSkills
    .slice(0, 3)
    .map((skill) => skill.name)
    .join(", ");
  const repoName = matchedRepos[0]?.name;

  let reason = "Public profile metadata only; no specific overlap was found.";
  if (evidenceNames && repoName) {
    reason = `Overlapping evidence: ${evidenceNames}; related repository: ${repoName}.`;
  } else if (evidenceNames) {
    reason = `Overlapping skills listed on the public profile: ${evidenceNames}.`;
  } else if (repoName) {
    reason = `A public repository, ${repoName}, uses related technology.`;
  } else if (criteria.intent && candidate.intents.includes(criteria.intent)) {
    reason = `Publicly stated collaboration intent matches ${criteria.intent}.`;
  }

  return { score: Number(bounded.toFixed(3)), reason };
}

export function rankCandidates(
  candidates: PublicProfile[],
  criteria: ScoringCriteria
): PublicProfile[] {
  return candidates
    .map((candidate) => {
      const { score, reason } = scoreCandidate(candidate, criteria);
      return { ...candidate, matchScore: score, matchReason: reason };
    })
    .sort((left, right) => (right.matchScore ?? 0) - (left.matchScore ?? 0));
}

export function criteriaFromExtraction(
  extraction: DiscoverExtraction,
  query: string
): ScoringCriteria {
  return {
    skills: extraction.skills,
    intent: extraction.intent,
    timeCommitment: extraction.timeCommitment,
    timezoneHint: extraction.timezoneHint,
    text: query,
  };
}
