import { configure } from "@glubean/sdk";

/**
 * Pre-configured HTTP client for the DummyJSON API.
 * Uses DUMMYJSON_API from .env as the base URL.
 */
export const { http: dummyApi } = configure({
  http: {
    prefixUrl: "{{DUMMYJSON_API}}",
    retry: { limit: 2, retryOnTimeout: true },
  },
});
