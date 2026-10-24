import test from "node:test";
import assert from "node:assert/strict";
import {
  githubRepoName,
  isGitHubRepoUrl,
  normalizeGitHubUsername,
} from "../lib/utils/github.ts";
import { safeRedirectPath } from "../lib/utils/redirect.ts";

test("normalizeGitHubUsername accepts valid handles", () => {
  assert.equal(normalizeGitHubUsername("  Octo-Cat "), "octo-cat");
  assert.equal(normalizeGitHubUsername("a"), "a");
  assert.equal(normalizeGitHubUsername("a".repeat(39)), "a".repeat(39));
});

test("normalizeGitHubUsername rejects invalid handles", () => {
  assert.equal(normalizeGitHubUsername(null), null);
  assert.equal(normalizeGitHubUsername(""), null);
  assert.equal(normalizeGitHubUsername("-leading"), null);
  assert.equal(normalizeGitHubUsername("trailing-"), null);
  assert.equal(normalizeGitHubUsername("has space"), null);
  assert.equal(normalizeGitHubUsername("a".repeat(40)), null);
});

test("GitHub repository URLs are constrained to public repo shapes", () => {
  assert.equal(
    isGitHubRepoUrl("https://github.com/octocat/hello-world"),
    true
  );
  assert.equal(isGitHubRepoUrl("https://github.com/octocat/hello-world.git"), true);
  assert.equal(isGitHubRepoUrl("http://github.com/octocat/hello-world"), false);
  assert.equal(isGitHubRepoUrl("https://example.com/octocat/hello-world"), false);
  assert.equal(isGitHubRepoUrl("https://github.com/octocat"), false);
});

test("githubRepoName returns owner/name", () => {
  assert.equal(
    githubRepoName("https://github.com/octocat/hello-world.git"),
    "octocat/hello-world"
  );
  assert.equal(
    githubRepoName("https://github.com/octocat/hello-world/tree/main"),
    "octocat/hello-world"
  );
  assert.equal(githubRepoName("not a url"), "not a url");
});

test("safeRedirectPath blocks external and protocol-relative paths", () => {
  assert.equal(safeRedirectPath("/discover"), "/discover");
  assert.equal(safeRedirectPath("/profile/alice?tab=skills"), "/profile/alice?tab=skills");
  assert.equal(safeRedirectPath("https://evil.example", "/discover"), "/discover");
  assert.equal(safeRedirectPath("//evil.example", "/discover"), "/discover");
  assert.equal(safeRedirectPath("/\\evil.example", "/discover"), "/discover");
  assert.equal(safeRedirectPath("/path\nheader", "/discover"), "/discover");
  assert.equal(safeRedirectPath(null, "/discover"), "/discover");
});
