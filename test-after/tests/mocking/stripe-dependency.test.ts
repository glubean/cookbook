/**
 * Mocking a third-party dependency — the "keep drafting" escape hatch.
 *
 * The problem: you're writing a test for code that charges Stripe, but you
 * have no sandbox key yet / you're offline / it's CI. Without a stub your
 * authoring loop stalls on step one.
 *
 * The pattern: stub the third party so you can shape and run the test NOW,
 * then swap to the real API later — the SAME test, just drop the flag.
 *
 *   Draft (mocked, offline, no key):  GLUBEAN_MOCK=1 npx glubean run tests/mocking
 *   Real  (live sandbox, needs key):  npx glubean run tests/mocking
 *
 * Read tests/mocking/README.md before leaning on this. It is a scaffold,
 * not a substitute for verifying against the real API (or a contract).
 */
import { test } from "@glubean/sdk";
import { stripeApi } from "../../config/stripe-api.ts";

// Same real Stripe client for mocked and real runs — auth header + base URL
// come from config/stripe-api.ts, requests use Stripe's real form-encoded
// shape and real test tokens. Only `glubean.setup.ts` + the GLUBEAN_MOCK flag
// differ; the test body never knows which mode it is in. Drop the flag (with a
// sk_test_ key in .env.secrets) and these exact assertions run live.

type Charge = { id: string; status: string };

// 1. Happy path — `tok_visa` is Stripe's "always succeeds" test token.
//    A mocked pass proves the test is well-formed, not that Stripe works.
export const chargeSucceeds = test(
  { id: "charge-succeeds", name: "Stripe charge — succeeds (mocked scaffold)", tags: ["mocking"] },
  async ({ expect, log }) => {
    const res = await stripeApi.post("v1/charges", {
      body: new URLSearchParams({ amount: "2000", currency: "usd", source: "tok_visa" }),
    });

    expect(res).toHaveStatus(200);
    const charge = await res.json<Charge>();
    expect(charge.status).toBe("succeeded");
    log(`charge ${charge.id} → ${charge.status}`);
  },
);

// 2. Error injection — the real payoff: test YOUR handling of a failure the
//    live sandbox won't produce on demand. `tok_chargeDeclined` is Stripe's
//    "always declined" test token, so this asserts the same 402 live or mocked.
export const chargeDeclined = test(
  { id: "charge-declined", name: "Stripe charge — card declined (mocked scaffold)", tags: ["mocking"] },
  async ({ expect, log }) => {
    const res = await stripeApi.post("v1/charges", {
      headers: { "x-test-scenario": "card_declined" },
      body: new URLSearchParams({ amount: "2000", currency: "usd", source: "tok_chargeDeclined" }),
    });

    expect(res).toHaveStatus(402);
    const body = await res.json<{ error?: { code?: string } }>();
    expect(body.error?.code).toBe("card_declined");
    log(`declined path exercised → ${body.error?.code}`);
  },
);
