# Glubean Cookbook

Runnable pattern recipes for [Glubean](https://glubean.com).

This repository is intentionally focused on learning and adoption:

- Start from zero setup
- Learn one pattern at a time
- Copy the pattern into your own project

If you want full, production-oriented API suites, use a separate `collections`
repository.

> **Highlight**: [`stripe/webhook.test.ts`](explore/stripe/webhook.test.ts) —
> one file that spins up a local server, opens a tunnel, registers a Stripe
> webhook, triggers a real event, verifies payload + signature, and cleans up
> automatically. Setup, multi-step orchestration, and teardown — in plain
> TypeScript. Try doing that in Postman.

## Start (recommended: click ▶ in editor)

### Option A: Editor-first (lowest friction)

1. Install the
   [Glubean VS Code extension](https://marketplace.visualstudio.com/items?itemName=glubean.glubean)
   (or install VSIX for Cursor/VSCodium from
   [Releases](https://github.com/glubean/vscode/releases)).
2. Clone and open this repo in VS Code:

   ```bash
   git clone https://github.com/glubean/cookbook
   cd cookbook
   ```

3. Open `explore/dummyjson/smoke.test.ts` and click **▶** next to any `test(`.
4. Or run from the **Glubean panel** in the sidebar (Tasks section) if you
   prefer panel-driven execution.

On first run, the extension auto-installs Deno and the Glubean CLI. This is a
one-time setup that typically takes 1–3 minutes depending on your network. After
that, every run is instant. If setup stalls, click the status bar hint:
**Glubean: Setup needed**.

### Option B: CLI-first

If you prefer terminal workflow, install CLI first, then run:

```bash
curl -fsSL https://glubean.com/install.sh | sh
glubean run explore/dummyjson
```

CLI runs always write a machine-readable result file to:

```text
.glubean/last-run.result.json
```

If you want a stable custom artifact path (for scripts/CI), pass
`--result-json`:

```bash
glubean run explore/dummyjson --result-json results/dummyjson.result.json
```

### Option C: Deno Tasks (scriptable + VS Code Task runner)

This repository includes ready-made tasks in `deno.json`:

```bash
deno task explore:dummyjson
deno task explore:github:smoke
deno task explore:smoke
```

You can run the same tasks from VS Code with **Tasks: Run Task**. Each task
writes a stable artifact under `results/*.result.json` and also updates
`.glubean/last-run.result.json`.

## Path map

```text
Zero setup — start here:
  explore/dummyjson/smoke.test.ts         basic test, assertions, logs
  explore/dummyjson/search.test.ts        test.pick + fromDir.merge
  explore/dummyjson/pagination.test.ts    pagination assertions
  explore/dummyjson/errors.test.ts        error handling assertions

No token required:
  explore/github/smoke/public.test.ts     shared config, public API
  explore/github/smoke/users.test.ts      test.each + fromDir

Browser automation (needs Chrome):
  explore/browser/login.test.ts           form fill + navigation + assertions
  explore/browser/scrape.test.ts          data extraction with evaluate()
  explore/browser/dynamic.test.ts         dropdowns, checkboxes, lazy content

Needs token:
  explore/github/advanced/auth.test.ts    auth + multi-step
  explore/stripe/webhook.test.ts          webhook E2E (+ tunnel)

AI contract testing (needs OpenAI key):
  explore/ai-contracts/basic.test.ts      schema + semantic assertions
  explore/ai-contracts/regression.test.ts golden dataset with test.each
  explore/ai-contracts/consistency.test.ts N-runs stability check
  explore/ai-contracts/judge.test.ts      LLM-as-judge evaluation

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
| Shared HTTP config (`configure`) | [`config/github-api.ts`](config/github-api.ts)                         |
| Browser plugin config            | [`config/browser.ts`](config/browser.ts)                                |
| Browser login flow               | [`browser/login.test.ts`](explore/browser/login.test.ts)               |
| Browser data extraction          | [`browser/scrape.test.ts`](explore/browser/scrape.test.ts)             |
| Browser dynamic content          | [`browser/dynamic.test.ts`](explore/browser/dynamic.test.ts)           |
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

## Contributing

This cookbook is pattern-first. Keep recipes short, runnable, and focused on one
learning goal.

See [CONTRIBUTING.md](CONTRIBUTING.md).
