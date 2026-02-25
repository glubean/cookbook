# DummyJSON Patterns

Zero-config recipes for learning core Glubean patterns.

DummyJSON is a public fake API, so you can run everything here without tokens.

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

On first run, the extension auto-installs Deno and the Glubean CLI. This is a
one-time setup that typically takes 1–3 minutes depending on your network. After
that, every run is instant. If setup stalls, click the status bar hint:
**Glubean: Setup needed**.

### Option B: CLI-first

Install CLI and run all DummyJSON recipes:

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

### Option C: Deno Tasks

Use the preconfigured task:

```bash
deno task explore:dummyjson
```

In VS Code, you can also run it via **Tasks: Run Task**.

## Recipes

| Recipe                                     | Setup      | Pattern                        |
| ------------------------------------------ | ---------- | ------------------------------ |
| [`smoke.test.ts`](smoke.test.ts)           | Zero setup | basic `test`, assertions, logs |
| [`search.test.ts`](search.test.ts)         | Zero setup | `test.pick` + `fromDir.merge`  |
| [`pagination.test.ts`](pagination.test.ts) | Zero setup | pagination assertions          |
| [`errors.test.ts`](errors.test.ts)         | Zero setup | error handling assertions      |

## When to use

- Start here if this is your first time with Glubean.
- Use these files as copy-paste templates for your own API tests.
- Move to `explore/github` when you want public API + auth patterns.
