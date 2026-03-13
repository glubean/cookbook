# GitHub API

Real-world GitHub API tests — from zero-config exploration to authenticated
multi-step flows.

> **How to run?** See
> [Start](../../README.md#start-recommended-click--in-editor) for all ways to
> run (editor ▶, CLI, npm scripts, Glubean panel).

## smoke/ — No setup required

```bash
glubean run explore/github/smoke
```

Hits GitHub's public API. No token needed.

| Test          | What it does                   |
| ------------- | ------------------------------ |
| `getUser`     | Fetch a public user profile    |
| `searchRepos` | Search repositories by keyword |

## advanced/ — Requires a GitHub token

1. Add your token to `.env.secrets` at the project root:
   ```
   GITHUB_TOKEN=ghp_...
   ```
   Get one at [github.com/settings/tokens](https://github.com/settings/tokens) —
   scopes: `read:user`, `public_repo`

```bash
glubean run explore/github/advanced
```

| Test                   | What it does                                   |
| ---------------------- | ---------------------------------------------- |
| `getAuthenticatedUser` | Fetch your own profile via token               |
| `listMyRepos`          | List your most recently updated repos          |
| `profileThenStarred`   | Multi-step: authenticate → fetch starred repos |
