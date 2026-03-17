# Stripe Pattern

Advanced recipe for webhook end-to-end testing with setup/teardown.

> **How to run?** See
> [Start](../../README.md#start-recommended-click--in-editor) for all ways to
> run (editor ▶, CLI, npm scripts, Glubean panel).

This is intentionally focused on one pattern:

- Register webhook endpoint
- Trigger real event
- Verify payload and signature
- Clean up endpoint automatically

## Setup required

Copy `.env.secrets.example` to `.env.secrets`, then make sure your host
environment has these values exported (or replace them locally in the copied
file). The real `.env.secrets` file is gitignored and should never be
committed.

```bash
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
SMEE_URL=${SMEE_URL}
```

## Run

```bash
npx glubean run explore/stripe
```

## Recipe

| Recipe                               | Setup                | Pattern                         |
| ------------------------------------ | -------------------- | ------------------------------- |
| [`webhook.test.ts`](webhook.test.ts) | Needs token + tunnel | webhook E2E with setup/teardown |
