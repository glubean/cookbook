import { configure } from "@glubean/sdk";

/**
 * Public DummyJSON HTTP client — no auth header.
 * Use this for endpoints that don't require a bearer token
 * (e.g. `/auth/login`, `/products`).
 */
export const { http: dummyApi } = configure({
  http: {
    prefixUrl: "{{DUMMYJSON_API}}",
    timeout: 10000,
  },
});

/**
 * Authenticated DummyJSON HTTP client.
 *
 * Attaches `Authorization: Bearer {{DUMMYJSON_TOKEN}}` to every request.
 * The token resolves from the session first (set by `session.ts` at
 * setup time via `ctx.session.set("DUMMYJSON_TOKEN", ...)`), falling
 * back to secrets/vars.
 *
 * Contracts that require auth (e.g. `profile.contract.ts` →
 * `GET /auth/me`) use this client so the "authorized" case runs
 * independently — no manual header injection. Flows can still override
 * Authorization per-step via the `in` lens (deep-merge replaces the
 * baked-in header).
 */
export const { http: dummyAuthApi } = configure({
  http: {
    prefixUrl: "{{DUMMYJSON_API}}",
    timeout: 10000,
    headers: { Authorization: "Bearer {{DUMMYJSON_TOKEN}}" },
  },
});
