import { configure } from "@glubean/sdk";

/**
 * Pre-configured HTTP client for the Stripe API.
 * Requires STRIPE_SECRET_KEY in secrets (.env.secrets).
 * Use your test mode key (sk_test_...) — never your live key.
 */
export const { http: stripeApi } = configure({
  secrets: { secretKey: "STRIPE_SECRET_KEY" },
  http: {
    prefixUrl: "STRIPE_API",
    headers: {
      Authorization: "Bearer {{STRIPE_SECRET_KEY}}",
    },
  },
});
