# Contributing to Glubean Cookbook

All contributions welcome — new APIs, better examples, bug fixes.

## Cookbook scope (important)

This repository is pattern-first, not API-catalog-first.

- Good recipe: teaches one reusable testing pattern clearly.
- Avoid: large endpoint inventories that mostly showcase an API surface.

If a contribution is more like a full project suite, propose it for
`collections` instead.

## Adding a new recipe

1. Prefer extending an existing provider directory under `explore/` when
   possible.
2. Keep one recipe focused on one pattern.
3. Add or update the provider README to explain setup level and what pattern is
   demonstrated.
4. Add links in root `README.md` under both:
   - "Learning paths by setup level"
   - "Pattern index"
5. If secrets are needed, document required env vars in `.env.example`.

## Using data directories

If your recipe accepts user-customizable data (request bodies, search queries,
test cases), use a `data/` subdirectory with the `*.local.json` convention:

```
data/[recipe-name]/
  shared.json              ← committed (team baseline)
  alice.local.json         ← gitignored (personal overrides)
```

- **`test.pick` + `fromDir.merge()`** — for named examples (override semantics)
- **`test.each` + `fromDir()`** — for test case lists (append semantics)

Shared files load first, then `*.local.json` files. This way contributors and
users can each have their own data without conflicts.

## Guidelines

- **Favor zero-config first** — a new user should run something immediately
  after cloning
- **One recipe = one clear pattern** — keep tests focused and teachable
- **One test = one clear thing** — keep assertions focused, use `ctx.log()` to
  explain context
- **Use `ctx.secrets.require()`** for credentials, never hardcode them
- **Add tags** — use meaningful tags like `["smoke"]`, `["auth"]`,
  `["webhook"]`, `["pagination"]`, `["errors"]`
- All code and comments in English

## Questions?

Open an issue or reach out at [glubean.com](https://glubean.com).
