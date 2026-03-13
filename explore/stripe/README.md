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

Add these values to `.env.secrets` at the project root:

```bash
STRIPE_SECRET_KEY=sk_test_...
SMEE_URL=https://smee.io/your-channel
```

## Run

```bash
glubean run explore/stripe
```

## Recipe

| Recipe                               | Setup                | Pattern                         |
| ------------------------------------ | -------------------- | ------------------------------- |
| [`webhook.test.ts`](webhook.test.ts) | Needs token + tunnel | webhook E2E with setup/teardown |
