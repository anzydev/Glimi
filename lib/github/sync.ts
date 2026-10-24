import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateEmbedding,
  generateText,
  isAiConfigured,
} from "@/lib/ai/client";

interface SyncProfileParams {
  userId: string;
  githubId: string;
  username: string;
  name?: string;
  avatarUrl?: string;
  providerToken?: string | null;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  topics?: string[];
  updated_at: string;
  pushed_at: string | null;
}

interface GitHubUser {
  login?: string;
  name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  company?: string | null;
  blog?: string | null;
  twitter_username?: string | null;
  public_repos?: number;
  followers?: number;
}

const MAX_REPO_PAGES = 10;
const REPOS_PER_PAGE = 100;
const MAX_STORED_REPOS = 300;

function githubHeaders(providerToken?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Glimi-Developer-Discovery",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (providerToken) {
    headers.Authorization = `Bearer ${providerToken}`;
  }

  return headers;
}

async function fetchGitHubUser(
  username: string,
  headers: Record<string, string>
): Promise<GitHubUser> {
  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}`,
    { headers, cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`GitHub profile request failed (${response.status}).`);
  }

  return (await response.json()) as GitHubUser;
}

async function fetchGitHubRepositories(
  username: string,
  headers: Record<string, string>
): Promise<GitHubRepo[]> {
  const repositories: GitHubRepo[] = [];

  for (let page = 1; page <= MAX_REPO_PAGES; page += 1) {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(
        username
      )}/repos?sort=updated&per_page=${REPOS_PER_PAGE}&page=${page}`,
      { headers, cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`GitHub repository request failed (${response.status}).`);
    }

    const batch = (await response.json()) as GitHubRepo[];
    if (!Array.isArray(batch) || batch.length === 0) break;

    repositories.push(...batch);
    if (batch.length < REPOS_PER_PAGE) break;
  }

  return repositories;
}

function buildSkillRows(userId: string, repositories: GitHubRepo[]) {
  const languageCounts: Record<string, { count: number; repos: string[] }> = {};
  const topicSet = new Set<string>();

  for (const repository of repositories) {
    if (repository.language) {
      const existing = languageCounts[repository.language] ?? {
        count: 0,
        repos: [],
      };
      existing.count += 1;
      existing.repos.push(repository.name);
      languageCounts[repository.language] = existing;
    }

    if (Array.isArray(repository.topics)) {
      for (const topic of repository.topics) {
        if (typeof topic === "string" && topic.trim()) {
          topicSet.add(topic.trim());
        }
      }
    }
  }

  const topLanguages = Object.entries(languageCounts)
    .sort((left, right) => right[1].count - left[1].count)
    .map(([language]) => language);

  const skillRows = Object.entries(languageCounts).map(([language, stats]) => ({
    user_id: userId,
    name: language,
    category: "language",
    evidence_type: "observed",
    repo_count: stats.count,
    primary_language: language === topLanguages[0],
    evidence_summary: `Observed as the primary language in ${stats.count} public repositor${
      stats.count === 1 ? "y" : "ies"
    } (${stats.repos.slice(0, 3).join(", ")}). This is repository metadata, not proof of expertise.`,
  }));

  for (const topic of Array.from(topicSet).slice(0, 20)) {
    if (languageCounts[topic]) continue;
    skillRows.push({
      user_id: userId,
      name: topic,
      category: "topic",
      evidence_type: "reported",
      repo_count: 1,
      primary_language: false,
      evidence_summary:
        "Reported through public repository topics. Repository topics are self-selected labels.",
    });
  }

  return skillRows;
}

async function summarizeProfile(
  username: string,
  repositories: GitHubRepo[],
  languages: string[],
  topics: string[]
): Promise<{ summary: string | null; embedding: number[] | null }> {
  if (!isAiConfigured()) {
    return { summary: null, embedding: null };
  }

  const repoDetails = repositories
    .slice(0, 8)
    .map(
      (repository) =>
        `${repository.name} (${repository.language ?? "unknown language"}): ${
          repository.description ?? "No description"
        }`
    )
    .join("\n");

  const prompt = `Developer @${username}
Observed public languages: ${languages.join(", ") || "None listed"}
Public repository topics: ${topics.slice(0, 10).join(", ") || "None listed"}
Recent public repositories:
${repoDetails}`;

  try {
    const summary = await generateText(
      "Summarize this developer's publicly observable repository metadata in two concise sentences. Describe only what the repository metadata shows. Do not claim expertise, employment, authorship outside these public repositories, or verification.",
      prompt,
      true
    );

    const embedding = await generateEmbedding(
      `Developer ${username}. Observed languages: ${languages.join(
        ", "
      )}. Repository topics: ${topics.slice(0, 10).join(", ")}. Repositories: ${repositories
        .slice(0, 10)
        .map((repository) => `${repository.name} ${repository.language ?? ""}`)
        .join(" ")}`
    );

    return { summary: summary || null, embedding };
  } catch (error) {
    console.warn(
      `GitHub sync AI enrichment skipped: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
    return { summary: null, embedding: null };
  }
}

export async function syncGitHubProfile({
  userId,
  githubId,
  username,
  name,
  avatarUrl,
  providerToken,
}: SyncProfileParams) {
  const adminClient = createAdminClient();
  const headers = githubHeaders(providerToken);

  const githubUser = await fetchGitHubUser(username, headers);
  const allRepositories = await fetchGitHubRepositories(username, headers);

  const nonForkRepositories = allRepositories.filter(
    (repository) => !repository.fork
  );
  const relevantRepositories = (
    nonForkRepositories.length > 0 ? nonForkRepositories : allRepositories
  ).slice(0, MAX_STORED_REPOS);

  const languageCounts = new Map<string, number>();
  const topicSet = new Set<string>();
  for (const repository of relevantRepositories) {
    if (repository.language) {
      languageCounts.set(
        repository.language,
        (languageCounts.get(repository.language) ?? 0) + 1
      );
    }
    for (const topic of repository.topics ?? []) {
      if (topic.trim()) topicSet.add(topic.trim());
    }
  }

  const topLanguages = Array.from(languageCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([language]) => language)
    .slice(0, 12);
  const topTopics = Array.from(topicSet).slice(0, 20);

  const { summary, embedding } = await summarizeProfile(
    username,
    relevantRepositories,
    topLanguages,
    topTopics
  );

  const { data: existingUser, error: existingUserError } = await adminClient
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existingUserError) throw existingUserError;

  const syncedAt = new Date().toISOString();
  const baseProfile = {
    id: userId,
    github_id: githubId,
    username: username.toLowerCase(),
    avatar_url: avatarUrl ?? githubUser.avatar_url ?? null,
    public_repos_count: githubUser.public_repos ?? allRepositories.length,
    followers_count: githubUser.followers ?? 0,
    summary_ai: summary,
    is_ai_generated: Boolean(summary),
    skill_embedding: embedding,
    github_synced_at: syncedAt,
    updated_at: syncedAt,
  };

  const profileRow = existingUser
    ? baseProfile
    : {
        ...baseProfile,
        name: name ?? githubUser.name ?? username,
        bio: githubUser.bio ?? null,
        location: githubUser.location ?? null,
        company: githubUser.company ?? null,
        website: githubUser.blog ?? null,
        twitter_username: githubUser.twitter_username ?? null,
      };

  const { error: userError } = await adminClient
    .from("users")
    .upsert(profileRow, { onConflict: "id" });

  if (userError) throw userError;

  const repositoryRows = relevantRepositories.map((repository) => ({
    user_id: userId,
    github_repo_id: repository.id,
    name: repository.name,
    full_name: repository.full_name,
    description: repository.description,
    language: repository.language,
    stars_count: repository.stargazers_count ?? 0,
    forks_count: repository.forks_count ?? 0,
    is_fork: repository.fork,
    topics: repository.topics ?? [],
    repo_url: repository.html_url,
    last_commit_at: repository.pushed_at ?? repository.updated_at,
  }));

  const currentRepositoryIds = repositoryRows.map(
    (repository) => repository.github_repo_id
  );

  if (currentRepositoryIds.length > 0) {
    const { error: deleteError } = await adminClient
      .from("repositories")
      .delete()
      .eq("user_id", userId)
      .not(
        "github_repo_id",
        "in",
        `(${currentRepositoryIds.join(",")})`
      );

    if (deleteError) throw deleteError;

    for (let index = 0; index < repositoryRows.length; index += 100) {
      const batch = repositoryRows.slice(index, index + 100);
      const { error: repositoryError } = await adminClient
        .from("repositories")
        .upsert(batch, { onConflict: "user_id,github_repo_id" });

      if (repositoryError) throw repositoryError;
    }
  } else {
    const { error: deleteError } = await adminClient
      .from("repositories")
      .delete()
      .eq("user_id", userId);

    if (deleteError) throw deleteError;
  }

  const { error: skillsDeleteError } = await adminClient
    .from("skills")
    .delete()
    .eq("user_id", userId);

  if (skillsDeleteError) throw skillsDeleteError;

  const skillRows = buildSkillRows(userId, relevantRepositories);
  if (skillRows.length > 0) {
    const { error: skillsError } = await adminClient
      .from("skills")
      .insert(skillRows);

    if (skillsError) throw skillsError;
  }

  return {
    success: true,
    isNew: !existingUser,
    reposCount: repositoryRows.length,
    skillsCount: skillRows.length,
    syncedAt,
  };
}
