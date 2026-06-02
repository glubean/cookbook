# Glubean Cookbook

> [Ask Glubean AI anything](https://chatgpt.com/g/g-699e31ce19bc8191b748165f46449039-glubean) — setup help, feature questions, comparisons

Runnable pattern recipes for [Glubean](https://glubean.com). For full documentation, visit [docs.glubean.com](https://docs.glubean.com).

## Two workflows, two packages

This monorepo contains two independent cookbook packages. Pick the one that matches how you work:

### [`test-after/`](test-after/) — Explore and verify existing APIs

Write tests against live APIs. You explore endpoints, assert on responses, and build up a test suite over time.

```bash
cd test-after && pnpm install
npx glubean run tests/dummyjson
```

The worked examples live in [`test-after/tests/`](test-after/tests/); [`test-after/explore/`](test-after/explore/) is your scratchpad for work-in-progress drafts.

Best for: learning Glubean, testing existing APIs, exploratory testing, CI regression suites.

### [`contract-first/`](contract-first/) — Declare API behavior upfront

Define contracts that describe what your API *should* do. Glubean validates the live API against your declarations.

```bash
cd contract-first && pnpm install
npx glubean run contracts/dummyjson
```

Best for: API design reviews, spec-driven development, generating documentation from intent.

## Setup

```bash
git clone https://github.com/glubean/cookbook
cd cookbook
pnpm install    # installs both packages
```

## Run the cookbook

```bash
pnpm run check        # TypeScript checks for both packages
pnpm run test:public  # public examples only, no secrets required
pnpm run test:secrets # examples that intentionally require real secrets
pnpm test             # check + public + secret-backed examples
```

The secret-backed examples are not optionalized or silently skipped. They are
expected to fail fast when required credentials are missing.

Create `test-after/.env.secrets` from the template when you want to run them:

```bash
cp test-after/.env.secrets.example test-after/.env.secrets
```

`test-after/.env.secrets` is gitignored and must stay local. The template maps
host environment variables into the cookbook's secret names:

| Command | Required secrets |
|---|---|
| `pnpm --filter @glubean/cookbook-test-after run test:github:advanced` | `GITHUB_TOKEN` |
| `pnpm --filter @glubean/cookbook-test-after run test:ai-contracts` | `OPENAI_API_KEY` |
| `pnpm --filter @glubean/cookbook-test-after run test:stripe:webhook` | `STRIPE_SECRET_KEY`, `SMEE_URL` |

## AI Tools (optional, recommended)

```bash
npx glubean@latest config mcp      # AI can discover, run, and diagnose tests
npx skills add glubean/skill       # AI learns glubean patterns to write tests
```

## Learn more

- [Documentation](https://docs.glubean.com)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=glubean.glubean)
- [SDK Reference](https://docs.glubean.com/sdk)
