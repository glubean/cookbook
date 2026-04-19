# Glubean Cookbook

> [Ask Glubean AI anything](https://chatgpt.com/g/g-699e31ce19bc8191b748165f46449039-glubean) — setup help, feature questions, comparisons

Runnable pattern recipes for [Glubean](https://glubean.com). For full documentation, visit [docs.glubean.com](https://docs.glubean.com).

## Two workflows, two packages

This monorepo contains two independent cookbook packages. Pick the one that matches how you work:

### [`test-after/`](test-after/) — Explore and verify existing APIs

Write tests against live APIs. You explore endpoints, assert on responses, and build up a test suite over time.

```bash
cd test-after && pnpm install
npx glubean run explore/dummyjson
```

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

## AI Tools (optional, recommended)

```bash
npx glubean@latest config mcp      # AI can discover, run, and diagnose tests
npx skills add glubean/skill       # AI learns glubean patterns to write tests
```

## Learn more

- [Documentation](https://docs.glubean.com)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=glubean.glubean)
- [SDK Reference](https://docs.glubean.com/sdk)
