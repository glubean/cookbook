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
 *   1. Copy .env.secrets.example to .env.secrets
 *   2. Get a smee.io channel: https://smee.io/new → copy the URL
 *   3. Export SMEE_URL and STRIPE_SECRET_KEY in your host shell, or replace them locally:
 *        SMEE_URL=${SMEE_URL}
 *        STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
 *
 * Run:
 *   npx glubean run tests/stripe
 */
import { test } from "@glubean/sdk";
import SmeeClient from "smee-client";
import { createServer } from "node:http";
import { stripeApi } from "../../config/stripe-api.ts";
import { verifyStripeSignature } from "../../utils/stripe.ts";

type HookPayload = { headers: Record<string, string>; body: string };
type WebhookState = {
  server: import("node:http").Server;
  smee: SmeeClient;
  hookReceived: Promise<HookPayload>;
  smeeUrl: string;
  endpointId?: string;
  webhookSecret?: string;
};

// ---------------------------------------------------------------------------
// Test
// ---------------------------------------------------------------------------

export const webhookDelivery = test("stripe-webhook-delivery")
  .meta({
    name: "Webhook end-to-end delivery",
    tags: ["stripe", "webhook", "out-of-band"],
  })
  // 1. Spin up local server + smee tunnel, return shared state
  .setup<WebhookState>(async ({ secrets, log }) => {
    const stripeSecret = secrets.get("STRIPE_SECRET_KEY");
    const smeeUrl = secrets.get("SMEE_URL");

    if (!stripeSecret || !smeeUrl) {
      const missing = [
        stripeSecret ? undefined : "STRIPE_SECRET_KEY",
        smeeUrl ? undefined : "SMEE_URL",
      ].filter((name): name is string => Boolean(name));
      throw new Error(`Missing required secrets: ${missing.join(", ")}`);
    }
    if (!stripeSecret.startsWith("sk_test_")) {
      throw new Error("STRIPE_SECRET_KEY must be a Stripe test mode secret key");
    }
    if (!smeeUrl.startsWith("https://smee.io/")) {
      throw new Error("SMEE_URL must be a smee.io channel URL");
    }

    let resolveHook!: (p: HookPayload) => void;
    const hookReceived = new Promise<HookPayload>((res) => {
      resolveHook = res;
    });

    const server = await new Promise<import("node:http").Server>((resolve) => {
      const s = createServer((req, res) => {
        let body = "";
        req.on("data", (c) => (body += c));
        req.on("end", () => {
          const headers: Record<string, string> = {};
          for (const [k, v] of Object.entries(req.headers)) {
            if (typeof v === "string") headers[k] = v;
          }
          resolveHook({ headers, body });
          res.end("ok");
        });
      });
      s.listen(0, () => resolve(s));
    });

    const port = (server.address() as { port: number }).port;
    log(`Local server listening on :${port}`);

    const smee = new SmeeClient({
      source: smeeUrl,
      target: `http://localhost:${port}`,
    });
    await smee.start();
    log(`Smee tunnel: ${smeeUrl} → localhost:${port}`);

    return { server, smee, hookReceived, smeeUrl };
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
    if (!sig) {
      throw new Error("missing stripe-signature header");
    }

    if (!state.webhookSecret) {
      throw new Error("missing webhook secret from Stripe endpoint registration");
    }

    const valid = await verifyStripeSignature(body, sig, state.webhookSecret);
    expect(valid).toBe(true);

    log(`Event received: ${payload.type}`);
    log(`PaymentIntent: ${payload.data.object.id}`);
    log("Signature verified ✓");
  })
  // 5. Always clean up, even on failure
  .teardown(async ({ log }, state: WebhookState | undefined) => {
    if (!state) {
      return;
    }
    if (state.endpointId) {
      await stripeApi.delete(`v1/webhook_endpoints/${state.endpointId}`).json();
      log(`Deleted webhook endpoint: ${state.endpointId}`);
    }
    await state.smee.stop();
    state.server.close();
  });
