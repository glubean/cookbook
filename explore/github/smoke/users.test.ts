/**
 * GitHub Public API — data-driven user lookup with fromDir.
 *
 * Each JSON file in data/github-users/ becomes one test case.
 * Add your own by creating a *.local.json file — it's gitignored:
 *
 *   data/github-users/my-friend.local.json
 *   { "username": "octocat", "expectReposGte": 1 }
 *
 * Run:
 *   glubean run explore/github/smoke/users.test.ts
 */
import { fromDir, test } from "@glubean/sdk";
import { githubApi } from "../../../config/github-api.ts";

const users = await fromDir<{ username: string; expectReposGte: number }>("./data/github-users/");

export const userLookup = test.each(users)("gh-user-$username", async (ctx, { username, expectReposGte }) => {
  const user = await githubApi
    .get(`users/${username}`)
    .json<{ login: string; public_repos: number; followers: number }>();

  ctx.expect(user.login).toBe(username);
  ctx.expect(user.public_repos).toBeGreaterThanOrEqual(expectReposGte);

  ctx.log(`${user.login} — ${user.public_repos} repos, ${user.followers} followers`);
});
