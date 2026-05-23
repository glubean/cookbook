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
