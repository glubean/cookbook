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
    // Public demo API — absorb transient timeouts. retryOnTimeout is required
    // because ky does not retry TimeoutError by default. Idempotent methods only.
    retry: { limit: 2, retryOnTimeout: true },
  },
});
