/**
 * Stripe utility functions.
 *
 * These are pure helpers — no SDK imports, no side effects.
 * Safe to use in both explore/ and tests/.
 */

/**
 * Verify a Stripe webhook signature.
 *
 * Stripe signs every webhook with HMAC-SHA256 using your endpoint's signing
 * secret. Always verify before trusting the payload in production.
 *
 * @param body      Raw request body (string, not parsed JSON)
 * @param sigHeader Value of the `Stripe-Signature` header
 * @param secret    Signing secret from the webhook endpoint (`whsec_...`)
 * @returns         true if the signature is valid
 *
 * @see https://docs.stripe.com/webhooks#verify-official-libraries
 */
export async function verifyStripeSignature(
  body: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=")));
  const timestamp = parts["t"];
  const received = parts["v1"];
  if (!timestamp || !received) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${body}`),
  );
  const expected = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expected === received;
}
