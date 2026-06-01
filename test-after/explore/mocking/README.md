# Mocking a third-party dependency (escape hatch)

A defensive pattern, **not a recommended default**. Reach for it when a
dependency you don't own is unreachable and your authoring loop would
otherwise stall — no sandbox key yet, offline, or CI without secrets.

Use it to keep moving while you draft, then **swap to the real API** — the
same test, just drop a flag.

## Run it

```bash
# Draft (offline, mocked). In this cookbook there is no .env.secrets, so the
# script injects a throwaway STRIPE_SECRET_KEY — the mocked run needs no real
# credentials (MSW answers before the key is ever checked).
pnpm run explore:mocking
```

In your own project, where `STRIPE_SECRET_KEY` already lives in `.env.secrets`,
the swap is literally one flag — the test body is byte-for-byte identical:

```bash
GLUBEAN_MOCK=1 glubean run explore/mocking   # draft: mocked, offline
glubean run explore/mocking                  # real:  live sandbox
```

`tok_visa` and `tok_chargeDeclined` are Stripe's real test tokens, so the same
`200` / `402` assertions hold in both modes.

## How it works

- [`config/mocks.ts`](../../config/mocks.ts) defines an MSW server with handlers
  for third-party hosts (here, Stripe). It is just a definition — nothing runs.
- [`glubean.setup.ts`](../../glubean.setup.ts) calls `mockServer.listen()` **only
  when `GLUBEAN_MOCK` is set**, with `onUnhandledRequest: "bypass"` so every
  other host still goes to the real network. Real runs are untouched.
- The test body ([`stripe-dependency.test.ts`](./stripe-dependency.test.ts)) has
  **zero mock code** and uses the real Stripe client (auth header + form-encoded
  body). Mocked vs. real differ only by the flag — so swapping is one line, never
  a rewrite. Glubean still traces mocked calls, so you keep the request log either
  way.

## The boundary (read this)

1. **Mock only third parties you don't own.** Never mock your own backend / the
   system under test — a test that mocks its own subject proves nothing. This is
   the line that separates a scaffold from a fake.
2. **The payoff is error injection, not the happy path.** The point of the mock
   is to exercise *your* handling of failures the live sandbox won't produce on
   demand — declined card (402), timeout, 502. A mocked happy-path pass only
   proves your test is *well-formed*, not that the dependency works.
3. **A hand-written mock is an unverified assumption.** It drifts from the real
   API silently: the field shape changes upstream, your test stays green, prod
   breaks. So before you trust the happy path, **graduate it to a contract**
   against the real sandbox (see `contract-first/`). The mock is the scaffold;
   the contract is what stays.
