# Glubean Cookbook

Runnable pattern recipes for [Glubean](https://glubean.com).

This repository is intentionally focused on learning and adoption:

- Start from low setup
- Learn one pattern at a time
- Copy the pattern into your own project

For full documentation, visit [docs.glubean.com](https://docs.glubean.com).

> **Highlight**: [`stripe/webhook.test.ts`](explore/stripe/webhook.test.ts) —
> one file that spins up a local server, opens a tunnel, registers a Stripe
> webhook, triggers a real event, verifies payload + signature, and cleans up
> automatically. Setup, multi-step orchestration, and teardown — in plain
> TypeScript. Try doing that in Postman.

## Suggested path

Do not start with the hardest recipe.

The intended learning order is:

1. **No token, low setup:** `explore/dummyjson/*`
   Start with:
   - `explore/dummyjson/smoke.test.ts`
   - `explore/dummyjson/search.test.ts`
   - `explore/dummyjson/validate.test.ts`
2. **Still no token, but shared config / public APIs:** `explore/github/smoke/*`
3. **Local browser workflow:** `explore/browser/*`
4. **Session and multi-step state:** `explore/session-scope/*`
5. **Needs token or external setup:** `explore/github/advanced/*`, `explore/stripe/*`, `explore/ai-contracts/*`

If this is your first time with Glubean, stay in `explore/dummyjson/` until the
editor loop feels natural. See [Quick Start](https://docs.glubean.com/extension/quick-start) for setup help.

## AI Tools (optional, recommended)

Set up MCP + AI skill so your editor can discover, run, and explain cookbook tests:

```bash
npx glubean@latest config mcp      # AI can discover, run, and diagnose tests
npx glubean@latest config skill    # AI learns glubean patterns to write tests
npx glubean@latest docs pull       # download SDK reference for AI context
```

Supports Claude Code, Codex, and Cursor. [Learn more →](https://docs.glubean.com/extension/generate-with-ai)

After setup, try:

```
/glubean run the dummyjson smoke tests and explain what each one does
```

## Start (recommended: click ▶ in editor)

### Option A: Editor-first (lowest friction)

1. Install the
   [Glubean VS Code extension](https://marketplace.visualstudio.com/items?itemName=glubean.glubean)
   (or install VSIX for Cursor/VSCodium from
   [Releases](https://github.com/glubean/vscode/releases)).
2. Clone this repo and install dependencies:

   ```bash
   git clone https://github.com/glubean/cookbook
   cd cookbook
   npm install
   ```

3. Open the repo in VS Code.
4. Open `explore/dummyjson/smoke.test.ts` and click **▶** next to any `test(`.
5. Or run from the **Glubean panel** in the sidebar (Tasks section) if you
   prefer panel-driven execution.

No build step beyond `npm install` needed — the extension runs TypeScript directly.

If you later want to try token-based recipes, copy `.env.secrets.example` to
`.env.secrets`. That file is gitignored on purpose. The example uses `${NAME}`
syntax so you can map host environment variables into the names used by this
project. If the raw token already exists in your shell or CI environment, you
do not need to copy that raw value into project files again.

### Option B: CLI-first

If you prefer terminal workflow:

```bash
npm install
npx glubean run explore/dummyjson
```

CLI runs always write a machine-readable result file to:

```text
.glubean/last-run.result.json
```

If you want a stable custom artifact path (for scripts/CI), pass
`--result-json`:

```bash
npx glubean run explore/dummyjson --result-json results/dummyjson.result.json
```

### Option C: npm scripts

This repository includes ready-made scripts in `package.json`:

```bash
npm run explore:dummyjson
npm run explore:github:smoke
npm run explore:smoke
```

Each script writes a stable artifact under `results/*.result.json` and also
updates `.glubean/last-run.result.json`.

## Path map

```text
Start here first — low setup, no token:
  explore/dummyjson/smoke.test.ts         basic test, assertions, logs
  explore/dummyjson/search.test.ts        test.pick + fromDir.merge
  explore/dummyjson/csv.test.ts           fromCsv + test.each
  explore/dummyjson/yaml.test.ts          fromYaml + test.each
  explore/dummyjson/pagination.test.ts    pagination assertions
  explore/dummyjson/errors.test.ts        error handling assertions
  explore/dummyjson/validate.test.ts      ctx.validate + Zod
  explore/dummyjson/diagnostics.test.ts   metric + event + warn
  explore/dummyjson/polling.test.ts       ctx.pollUntil
  explore/dummyjson/skip.test.ts          test.skip

Then move here — still no token:
  explore/github/smoke/public.test.ts     shared config, public API
  explore/github/smoke/users.test.ts      test.each + fromDir

Then try local browser automation (needs Chrome):
  explore/browser/login.test.ts           form fill + navigation + assertions
  explore/browser/scrape.test.ts          data extraction with evaluate()
  explore/browser/dynamic.test.ts         dropdowns, checkboxes, lazy content

Then move to stateful workflows:
  explore/session-scope/profile.test.ts   session-backed auth reuse
  explore/session-scope/cart-workflow.test.ts multi-step + session state

Auth plugin patterns:
  explore/auth-plugin/bearer.test.ts      bearer token authentication
  explore/auth-plugin/apikey-query.test.ts API key in query param

Needs token or extra setup — leave these for later:
  explore/github/advanced/auth.test.ts    auth + multi-step
  explore/stripe/webhook.test.ts          webhook E2E (+ tunnel)

AI contract testing (needs OpenAI key):
  explore/ai-contracts/basic.test.ts      schema + semantic assertions
  explore/ai-contracts/regression.test.ts golden dataset with test.each
  explore/ai-contracts/consistency.test.ts N-runs stability check
  explore/ai-contracts/judge.test.ts      LLM-as-judge evaluation

Token/setup hint:
  copy .env.secrets.example -> .env.secrets
  then map host env vars with ${NAME}
  real .env.secrets stays gitignored

Project structure patterns:
  config/ai.ts                            shared AI plugin via definePlugin()
  config/browser.ts                       shared browser plugin via configure()
  config/github-api.ts                    shared HTTP client via configure()
  utils/stripe.ts                         pure helper functions for tests
```

## Pattern index

| Pattern                          | File                                                                   |
| -------------------------------- | ---------------------------------------------------------------------- |
| Basic test structure             | [`dummyjson/smoke.test.ts`](explore/dummyjson/smoke.test.ts)           |
| Data-driven named cases (`pick`) | [`dummyjson/search.test.ts`](explore/dummyjson/search.test.ts)         |
| Data-driven file cases (`each`)  | [`github/smoke/users.test.ts`](explore/github/smoke/users.test.ts)     |
| CSV data loader (`fromCsv`)      | [`dummyjson/csv.test.ts`](explore/dummyjson/csv.test.ts)               |
| YAML data loader (`fromYaml`)    | [`dummyjson/yaml.test.ts`](explore/dummyjson/yaml.test.ts)             |
| Schema validation (`validate`)   | [`dummyjson/validate.test.ts`](explore/dummyjson/validate.test.ts)     |
| Metrics + events + warnings      | [`dummyjson/diagnostics.test.ts`](explore/dummyjson/diagnostics.test.ts) |
| Polling (`pollUntil`)            | [`dummyjson/polling.test.ts`](explore/dummyjson/polling.test.ts)       |
| Dynamic skip (`skip`)            | [`dummyjson/skip.test.ts`](explore/dummyjson/skip.test.ts)             |
| Shared HTTP config (`configure`) | [`config/github-api.ts`](config/github-api.ts)                         |
| Browser plugin config            | [`config/browser.ts`](config/browser.ts)                                |
| Browser login flow               | [`browser/login.test.ts`](explore/browser/login.test.ts)               |
| Browser data extraction          | [`browser/scrape.test.ts`](explore/browser/scrape.test.ts)             |
| Browser dynamic content          | [`browser/dynamic.test.ts`](explore/browser/dynamic.test.ts)           |
| Auth plugin: bearer token        | [`auth-plugin/bearer.test.ts`](explore/auth-plugin/bearer.test.ts)     |
| Auth plugin: API key query       | [`auth-plugin/apikey-query.test.ts`](explore/auth-plugin/apikey-query.test.ts) |
| Authenticated requests           | [`github/advanced/auth.test.ts`](explore/github/advanced/auth.test.ts) |
| Multi-step state flow            | [`github/advanced/auth.test.ts`](explore/github/advanced/auth.test.ts) |
| Error handling                   | [`dummyjson/errors.test.ts`](explore/dummyjson/errors.test.ts)         |
| Pagination checks                | [`dummyjson/pagination.test.ts`](explore/dummyjson/pagination.test.ts) |
| Webhook setup/teardown           | [`stripe/webhook.test.ts`](explore/stripe/webhook.test.ts)             |
| AI schema contract               | [`ai-contracts/basic.test.ts`](explore/ai-contracts/basic.test.ts)     |
| AI golden dataset regression     | [`ai-contracts/regression.test.ts`](explore/ai-contracts/regression.test.ts) |
| AI consistency (N runs)          | [`ai-contracts/consistency.test.ts`](explore/ai-contracts/consistency.test.ts) |
| LLM-as-judge                     | [`ai-contracts/judge.test.ts`](explore/ai-contracts/judge.test.ts)     |
| AI plugin config (`definePlugin`)| [`config/ai.ts`](config/ai.ts)                                         |
| Pure test utilities              | [`utils/stripe.ts`](utils/stripe.ts)                                   |

## Git-safe local data

Use `*.local.json` in any `data/` directory for personal overrides.

- Shared files are committed
- `*.local.json` stays uncommitted
- `fromDir.merge` lets local keys override shared keys
- `fromDir` adds local files as additional test cases

Example:

```bash
echo '{ "gaming-laptop": { "q": "gaming laptop", "minResults": 1 } }' \
  > data/search-queries/mine.local.json
```

## Learn more

- [Documentation](https://docs.glubean.com) — full SDK, CLI, and extension docs
- [SDK Reference](https://docs.glubean.com/sdk) — test API, configure, data loaders, assertions
- [Data-Driven Testing](https://docs.glubean.com/sdk/data-driven) — test.each, test.pick, YAML/CSV
- [Limitations](https://docs.glubean.com/reference/limitations) — trade-offs and known limitations
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=glubean.glubean) — install from Marketplace

## Contributing

This cookbook is pattern-first. Keep recipes short, runnable, and focused on one
learning goal.

See [CONTRIBUTING.md](CONTRIBUTING.md).
