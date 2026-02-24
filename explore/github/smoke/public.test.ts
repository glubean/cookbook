/**
 * GitHub Public API — no token required.
 *
 * Run:
 *   glubean run explore/github/smoke
 *
 * What you'll see:
 *   - Trace viewer opens with full request/response for each test
 *   - Use Alt+[ / Alt+] to flip between trace history
 *   - Click any two runs to diff them side by side
 */
import { test } from "@glubean/sdk";
import { githubApi, githubVars } from "../../../config/github-api.ts";

// ---------------------------------------------------------------------------
// 1. Get a public user profile
//    GITHUB_USER defaults to "glubean" in .env
//    Override in .env.local to use your own account
// ---------------------------------------------------------------------------

export const getUser = test(
  { id: "gh-get-user", name: "GET user profile", tags: ["smoke"] },
  async ({ expect, log }) => {
    const username = githubVars.user;

    const user = await githubApi
      .get(`users/${username}`)
      .json<{ login: string; public_repos: number; followers: number }>();

    expect(user.login).toBe(username);
    expect(user.public_repos).toBeGreaterThanOrEqual(0);

    log(
      `${user.login} — ${user.public_repos} repos, ${user.followers} followers`,
    );
  },
);

// ---------------------------------------------------------------------------
// 2. Search repositories
//    GITHUB_SEARCH_QUERY defaults to "glubean" in .env
// ---------------------------------------------------------------------------

export const searchRepos = test(
  { id: "gh-search-repos", name: "Search repositories", tags: ["smoke"] },
  async ({ expect, log }) => {
    const query = githubVars.searchQuery;

    const result = await githubApi
      .get(`search/repositories?q=${query}&sort=stars`)
      .json<
        {
          total_count: number;
          items: { full_name: string; stargazers_count: number }[];
        }
      >();

    expect(result.total_count).toBeGreaterThanOrEqual(0);

    log(`Found ${result.total_count} repos matching "${query}"`);
    for (const repo of result.items.slice(0, 3)) {
      log(`  ${repo.full_name} (⭐ ${repo.stargazers_count})`);
    }
  },
);
