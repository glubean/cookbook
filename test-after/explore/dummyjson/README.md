# DummyJSON Patterns

Zero-config recipes for learning core Glubean patterns.

DummyJSON is a public fake API, so you can run everything here without tokens.

Data-backed examples in this folder intentionally use bare `data/...` paths.
That is the default cookbook style for shared project data.

## Start (recommended: click ▶ in editor)

### Option A: Editor-first (lowest friction)

1. Install the
   [Glubean VS Code extension](https://marketplace.visualstudio.com/items?itemName=glubean.glubean)
   (or install VSIX for Cursor/VSCodium from
   [Releases](https://github.com/glubean/vscode/releases)).
2. Open this repository in VS Code.
3. Open [`smoke.test.ts`](smoke.test.ts) and click **▶** next to any `test(`.
4. Or run from the **Glubean panel** in the sidebar (Tasks section) if you
   prefer panel-driven execution.

No build step needed — the extension runs TypeScript directly.

### Option B: CLI-first

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

```bash
npm run explore:dummyjson
```

## Recipes

| Recipe                                     | Setup      | Pattern                        |
| ------------------------------------------ | ---------- | ------------------------------ |
| [`smoke.test.ts`](smoke.test.ts)           | Zero setup | basic `test`, assertions, logs |
| [`search.test.ts`](search.test.ts)         | Zero setup | `test.pick` + `fromDir.merge`  |
| [`csv.test.ts`](csv.test.ts)               | Zero setup | `fromCsv` + `test.each`        |
| [`yaml.test.ts`](yaml.test.ts)             | Zero setup | `fromYaml` + `test.each`       |
| [`pagination.test.ts`](pagination.test.ts) | Zero setup | pagination assertions          |
| [`errors.test.ts`](errors.test.ts)         | Zero setup | error handling assertions      |
| [`validate.test.ts`](validate.test.ts)     | Zero setup | `ctx.validate()` + Zod         |
| [`diagnostics.test.ts`](diagnostics.test.ts) | Zero setup | metrics + events + warnings    |
| [`polling.test.ts`](polling.test.ts)       | Zero setup | `ctx.pollUntil()`              |
| [`skip.test.ts`](skip.test.ts)             | Zero setup | `test.skip()`                  |

## When to use

- Start here if this is your first time with Glubean.
- Use these files as copy-paste templates for your own API tests.
- Move to `explore/github` when you want public API + auth patterns.
