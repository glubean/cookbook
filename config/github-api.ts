import { configure } from "@glubean/sdk";

/**
 * Pre-configured HTTP client for the GitHub public API.
 * Uses GITHUB_API as the base URL (default: https://api.github.com).
 * No token required — for smoke / public tests.
 */
export const { http: githubApi, vars: githubVars } = configure({
  vars: {
    user: "GITHUB_USER",
    repo: "GITHUB_REPO",
    searchQuery: "GITHUB_SEARCH_QUERY",
  },
  http: {
    prefixUrl: "GITHUB_API",
    headers: { Accept: "application/vnd.github+json" },
  },
});

/**
 * Pre-configured HTTP client for the GitHub authenticated API.
 * Requires GITHUB_TOKEN in secrets (.env.secrets).
 */
export const { http: githubAuthApi } = configure({
  secrets: { token: "GITHUB_TOKEN" },
  http: {
    prefixUrl: "GITHUB_API",
    headers: {
      Authorization: "Bearer {{GITHUB_TOKEN}}",
      Accept: "application/vnd.github+json",
    },
  },
});
