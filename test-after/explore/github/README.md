# GitHub API

Real-world GitHub API tests — from zero-config exploration to authenticated
multi-step flows.

> **How to run?** See
> [Start](../../README.md#start-recommended-click--in-editor) for all ways to
> run (editor ▶, CLI, npm scripts, Glubean panel).

## smoke/ — No setup required

```bash
npx glubean run explore/github/smoke
```

Hits GitHub's public API. No token needed.

| Test          | What it does                   |
| ------------- | ------------------------------ |
| `getUser`     | Fetch a public user profile    |
| `searchRepos` | Search repositories by keyword |

## advanced/ — Requires a GitHub token

1. Copy `.env.secrets.example` to `.env.secrets` at the project root.
2. Make sure your host environment already has `GITHUB_TOKEN` exported, or replace the value locally.
3. The real `.env.secrets` file is gitignored and should never be committed.
4. Example:
   ```
   GITHUB_TOKEN=${GITHUB_TOKEN}
   ```
   Get one at [github.com/settings/tokens](https://github.com/settings/tokens) —
   scopes: `read:user`, `public_repo`

```bash
npx glubean run explore/github/advanced
```

| Test                   | What it does                                   |
| ---------------------- | ---------------------------------------------- |
| `getAuthenticatedUser` | Fetch your own profile via token               |
| `listMyRepos`          | List your most recently updated repos          |
| `profileThenStarred`   | Multi-step: authenticate → fetch starred repos |
