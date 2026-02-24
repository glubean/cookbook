/**
 * GitHub Authenticated API — requires a personal access token.
 *
 * Setup:
 *   1. Copy .env.example to .env.secrets
 *   2. Add your token: GITHUB_TOKEN=ghp_...
 *      Get one at: https://github.com/settings/tokens (read:user, public_repo)
 *
 * Run:
 *   glubean run explore/github/advanced
 */
import { test } from "@glubean/sdk";
import { githubAuthApi } from "../../../config/github-api.ts";

// ---------------------------------------------------------------------------
// 1. Get your own authenticated profile
// ---------------------------------------------------------------------------

export const getAuthenticatedUser = test(
  { id: "gh-auth-user", name: "GET authenticated user", tags: ["auth"] },
  async ({ expect, log }) => {
    const user = await githubAuthApi
      .get("user")
      .json<{ login: string; email: string | null; plan: { name: string } }>();

    expect(user.login).toBeDefined();

    log(`Authenticated as: ${user.login}`);
    log(`Email: ${user.email ?? "(private)"}`);
    log(`Plan: ${user.plan?.name ?? "unknown"}`);
  },
);

// ---------------------------------------------------------------------------
// 2. List your repos and verify shape
// ---------------------------------------------------------------------------

export const listMyRepos = test(
  { id: "gh-my-repos", name: "GET my repositories", tags: ["auth"] },
  async ({ expect, log }) => {
    const repos = await githubAuthApi
      .get("user/repos?per_page=10&sort=updated")
      .json<{ name: string; private: boolean; updated_at: string }[]>();

    expect(repos).toBeDefined();

    log(`Found ${repos.length} repos (most recently updated):`);
    for (const repo of repos.slice(0, 5)) {
      log(`  ${repo.private ? "🔒" : "🌐"} ${repo.name} — ${repo.updated_at}`);
    }
  },
);

// ---------------------------------------------------------------------------
// 3. Multi-step: authenticate → fetch profile → list starred repos
//    Demonstrates passing state between steps
// ---------------------------------------------------------------------------

export const profileThenStarred = test("gh-profile-then-starred")
  .meta({ name: "Profile → Starred repos", tags: ["auth", "multi-step"] })
  .step("authenticate", async ({ expect, log }) => {
    const user = await githubAuthApi
      .get("user")
      .json<{ login: string }>();

    expect(user.login).toBeDefined();
    log(`Authenticated as ${user.login}`);

    return { login: user.login };
  })
  .step("fetch starred repos", async ({ expect, log }, state) => {
    const repos = await githubAuthApi
      .get(`users/${state.login}/starred?per_page=5`)
      .json<{ full_name: string; stargazers_count: number }[]>();

    expect(repos).toBeDefined();

    log(`${state.login} has starred (top 5):`);
    for (const repo of repos) {
      log(`  ⭐ ${repo.full_name} (${repo.stargazers_count} stars)`);
    }
  });
