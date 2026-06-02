/**
 * Mock layer for third-party dependencies you DON'T own (here: Stripe).
 *
 * This is a *scaffold*, not a test. It lets you draft and run a Glubean test
 * while the real dependency is unreachable — no sandbox key yet, offline, or
 * in CI. It is OFF by default: `glubean.setup.ts` only starts it when the
 * GLUBEAN_MOCK env var is set. Drop the flag to hit the real API. Same test,
 * no edits — see tests/mocking/README.md.
 *
 * Boundary: mock ONLY third parties you don't control. NEVER mock your own
 * backend / the system under test — a test that mocks its own subject proves
 * nothing.
 */
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const mockServer = setupServer(
  // POST https://api.stripe.com/v1/charges
  http.post("https://api.stripe.com/v1/charges", ({ request }) => {
    // Error injection — reproduce failures the live sandbox won't give you on
    // demand (declined card, 402, timeout, 502). This is the real payoff:
    // exercising YOUR error handling, not the happy path.
    if (request.headers.get("x-test-scenario") === "card_declined") {
      return HttpResponse.json(
        {
          error: {
            type: "card_error",
            code: "card_declined",
            message: "Your card was declined.",
          },
        },
        { status: 402 },
      );
    }

    // Happy path stub — proves your test is well-formed, NOT that Stripe works.
    // Graduate this case to a contract against the real sandbox before trusting it.
    return HttpResponse.json(
      {
        id: "ch_mock_123",
        object: "charge",
        status: "succeeded",
        amount: 2000,
        currency: "usd",
      },
      { status: 200 },
    );
  }),
);
