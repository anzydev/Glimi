const GITHUB_USERNAME = /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/;
const GITHUB_REPO_URL =
  /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;

export function normalizeGitHubUsername(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return GITHUB_USERNAME.test(normalized) ? normalized : null;
}

export function isGitHubRepoUrl(value: string): boolean {
  return GITHUB_REPO_URL.test(value.trim());
}

export function githubRepoName(value: string): string {
  const match = value.trim().match(/^https:\/\/github\.com\/([^/]+)\/([^/?#]+)/i);
  if (!match) return value.trim();
  return `${match[1]}/${match[2].replace(/\.git$/i, "")}`;
}
