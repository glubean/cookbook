# Attachment-Model v10 — Worked Example

This folder shows the **v10 attachment model** end-to-end against a
real public API (DummyJSON). It re-implements the same scenario as
`../dummyjson/profile.contract.ts` (`GET /auth/me`) using the v10
surface so you can compare the two side-by-side.

## What the v10 surface gives you

The contract case (`me.contract.ts`) is **pure semantics**:

- `needs: z.object({ token: z.string() })` — declared logical input
- `given: "an authenticated session..."` — world-state precondition
- `headers: ({ token }) => ({ Authorization: ... })` — function of the
  logical input
- `runnability.requireAttachment: true` — opt-in for "don't run bare"

The case has **no `setup` / `teardown`**. Setup-style work (the actual
login call) lives in a separate `*.bootstrap.ts` sibling file.

The overlay (`me.bootstrap.ts`) is **execution attachment**:

- `contract.bootstrap(getMe.case("authorized"), async (ctx) => { ... })`
  — plain-function form
- `contract.bootstrap(getMe.case("requiresAttachment"), { params, run })`
  — structured form with a `params` schema for runner-supplied input
- `ctx.cleanup(fn)` — LIFO cleanup runs around the case

The runner has **three input channels** (attachment-model §8):

| Flag | Behavior |
|---|---|
| (none) | Default. Overlay runs and supplies `needs` input. |
| `--input-json '{...}'` | Explicit input. Validated against `needs`. **Overlay NOT invoked.** |
| `--bootstrap-json '{...}'` | Bootstrap params. Validated against overlay's `params` schema. Passed to `run(ctx, params)`. |

## Run

### 1. Default — overlay logs in, supplies token

```bash
npx glubean run contracts/attachment-model/me.contract.ts \
  --filter auth.me.authorized --no-session
```

Expected: overlay calls `/auth/login`, returns `{ token }`, case
receives it via `headers: ({token}) => ...`, response 200.

### 2. Explicit input — bypass overlay, supply token directly

First obtain a token (or read from `.env`):

```bash
TOKEN=$(curl -sX POST https://dummyjson.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"emilys","password":"emilyspass"}' | jq -r .accessToken)

npx glubean run contracts/attachment-model/me.contract.ts \
  --filter auth.me.authorized --no-session \
  --input-json "{\"token\":\"$TOKEN\"}"
```

Expected: overlay `meAuthorizedOverlay` is **not** invoked (no extra
HTTP call); case runs raw with the supplied token.

### 3. Structured-form params — feed the overlay via runner

```bash
npx glubean run contracts/attachment-model/me.contract.ts \
  --filter auth.me.requiresAttachment --no-session \
  --bootstrap-json '{"username":"emilys","password":"emilyspass"}'
```

Expected: runner validates `--bootstrap-json` against the overlay's
`params` schema, passes the validated value to `run(ctx, params)`.
Login uses the supplied credentials. `requireAttachment` is satisfied
because an overlay is registered.

### 4. `requireAttachment` semantics (§6.3)

The `requiresAttachment` case sets `runnability: { requireAttachment: true }`.
Per §6.3, with `needs` ALSO declared (as in this example), four paths
are valid:

| Scenario | Result |
|---|---|
| Bare standalone (no input, no overlay) | ❌ Error: requires attachment |
| `--input-json '{"token":"..."}'` | ✅ rawBypass (school B trusts explicit input) |
| Overlay registered | ✅ |
| Inside a flow via `.step()` | ✅ |

The error path is exercised by deleting (or commenting out) the
`meAttachOverlay` registration in `me.bootstrap.ts` and running:

```bash
npx glubean run contracts/attachment-model/me.contract.ts \
  --filter auth.me.requiresAttachment --no-session
```

You'll see:

```
case "auth.me.requiresAttachment" sets `runnability.requireAttachment: true`
but no bootstrap overlay is registered.
```

For a no-needs case with `requireAttachment` (different §6.3 row),
`--input-json` is rejected too — only overlay / flow / `--force-standalone`
debug bypass work.

### 5. {{VAR}} templating

The runner substitutes `{{VAR}}` placeholders inside `--input-json` /
`--bootstrap-json` against `{ ...vars, ...secrets, ...process.env }`
**before** schema validation. Example:

```bash
DUMMY_USER=emilys DUMMY_PASS=emilyspass \
npx glubean run contracts/attachment-model/me.contract.ts \
  --filter auth.me.requiresAttachment --no-session \
  --bootstrap-json '{"username":"{{DUMMY_USER}}","password":"{{DUMMY_PASS}}"}'
```

## Inventory

The scanner builds an attachment inventory per contract case (see
attachment-model §7.3). Each case becomes one of:

- `kind: "raw"` — default; case has no overlay, runs directly
- `kind: "bootstrap-overlay"` — sibling `.bootstrap.ts` registered an
  overlay; carries `rawBypass.available: true` when the case declares
  `needs` (so `--input-json` is also a valid path)
- `kind: "flow"` — case is part of a `contract.flow(...)` orchestration

In v0, this inventory is **internally consumed** by the CLI / MCP / VSCode
extension (filtering by `kind` for discovery, surfacing
`requireAttachment` warnings, etc.). It isn't yet exported through the
public `glubean contracts --format json` output — that's a documentation
follow-up.

What you _can_ verify externally:

```bash
# Listing — sees the case but doesn't differentiate overlay vs raw yet
npx glubean contracts --dir contracts/attachment-model
```

The runtime guarantees the model from §5.1 still hold even if the inventory
isn't surfaced in the listing format (overlay runs by default, `--input-json`
bypasses overlay, `requireAttachment` blocks bare runs).

## What's _not_ shown here

- `contract.flow(...)` — flow attachments and `step.in` lens (see
  `../dummyjson/flow.contract.ts` for the flow surface; v10 cases are
  flow-composable without any lifecycle on the case)
- `runCase()` programmatic API — same channels as CLI / MCP, see
  `@glubean/runner`'s exported `runCase` function
- gRPC / GraphQL adapters — Spike 4 migrated them; same `needs` /
  `bootstrap` patterns work with `contract.grpc.with(...)` and
  `contract.graphql.with(...)`
