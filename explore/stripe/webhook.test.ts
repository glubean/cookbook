/**
 * Stripe Webhook — end-to-end delivery test.
 *
 * What this test does:
 *   1. Starts a local HTTP server to receive webhooks
 *   2. Opens a smee.io tunnel so Stripe can reach it
 *   3. Registers a webhook endpoint on Stripe pointing to the tunnel
 *   4. Creates a PaymentIntent to trigger a real event
 *   5. Waits for the webhook to arrive and verifies payload + signature
 *   6. Cleans up the webhook endpoint
 *
 * Setup:
 *   1. Copy .env.example to .env.secrets
 *   2. Get a smee.io channel: https://smee.io/new → copy the URL
 *   3. Fill in .env.secrets:
 *        SMEE_URL=https://smee.io/your-channel
 *        STRIPE_SECRET_KEY=sk_test_...
 *
 * Run:
 *   glubean run explore/stripe
 */
import { test } from "@glubean/sdk";
import SmeeClient from "smee-client";
import { stripeApi } from "../../config/stripe-api.ts";
import { verifyStripeSignature } from "../../utils/stripe.ts";

type HookPayload = { headers: Record<string, string>; body: string };

// ---------------------------------------------------------------------------
// Test
// ---------------------------------------------------------------------------

export const webhookDelivery = test("stripe-webhook-delivery")
  .meta({ name: "Webhook end-to-end delivery", tags: ["webhook"] })
  // 1. Spin up local server + smee tunnel, return shared state
  .setup(async ({ vars, log }) => {
    const smeeUrl = vars.require("SMEE_URL");

    let resolveHook!: (p: HookPayload) => void;
    const hookReceived = new Promise<HookPayload>((res) => {
      resolveHook = res;
    });

    const server = Deno.serve({ port: 0 }, async (req) => {
      const body = await req.text();
      const headers: Record<string, string> = {};
      req.headers.forEach((v, k) => {
        headers[k] = v;
      });
      resolveHook({ headers, body });
      return new Response("ok");
    });

    const { port } = server.addr as Deno.NetAddr;
    log(`Local server listening on :${port}`);

    const smee = new SmeeClient({
      source: smeeUrl,
      target: `http://localhost:${port}`,
    });
    const events = smee.start();
    log(`Smee tunnel: ${smeeUrl} → localhost:${port}`);

    return { server, events, hookReceived, smeeUrl };
  })
  // 2. Register a webhook endpoint on Stripe pointing to the smee URL
  .step("register webhook endpoint", async ({ log }, state) => {
    const endpoint = await stripeApi
      .post("v1/webhook_endpoints", {
        body: new URLSearchParams({
          url: state.smeeUrl,
          "enabled_events[]": "payment_intent.created",
        }),
      })
      .json<{ id: string; secret: string }>();

    log(`Registered endpoint: ${endpoint.id}`);
    return {
      ...state,
      endpointId: endpoint.id,
      webhookSecret: endpoint.secret,
    };
  })
  // 3. Create a PaymentIntent — this triggers a payment_intent.created event
  .step("trigger event", async ({ log }, state) => {
    const intent = await stripeApi
      .post("v1/payment_intents", {
        body: new URLSearchParams({
          amount: "1000",
          currency: "usd",
          "automatic_payment_methods[enabled]": "true",
        }),
      })
      .json<{ id: string }>();

    log(`Created PaymentIntent: ${intent.id}`);
    return state;
  })
  // 4. Wait for the webhook to arrive (Promise resolves when server receives it)
  .step("verify delivery", async ({ expect, log }, state) => {
    const { headers, body } = await state.hookReceived;

    const payload = JSON.parse(body) as {
      type: string;
      data: { object: { id: string; currency: string } };
    };

    expect(payload.type).toBe("payment_intent.created");
    expect(payload.data.object.currency).toBe("usd");

    const sig = headers["stripe-signature"];
    expect(sig).toBeDefined();

    const valid = await verifyStripeSignature(body, sig, state.webhookSecret);
    expect(valid).toBe(true);

    log(`Event received: ${payload.type}`);
    log(`PaymentIntent: ${payload.data.object.id}`);
    log("Signature verified ✓");
  })
  // 5. Always clean up, even on failure
  .teardown(async ({ log }, state) => {
    if (state.endpointId) {
      await stripeApi.delete(`v1/webhook_endpoints/${state.endpointId}`).json();
      log(`Deleted webhook endpoint: ${state.endpointId}`);
    }
    state.events.close();
    await state.server.shutdown();
  });
