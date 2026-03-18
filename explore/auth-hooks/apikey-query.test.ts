/**
 * Integration test: @glubean/auth apiKey("query") via configure()
 *
 * Verifies that the beforeRequest hook injected by apiKey("query")
 * actually runs through configure() → ky → HTTP request.
 *
 * Uses httpbin.org/get which echoes back query params in the response.
 */

import { test, configure } from "@glubean/sdk";
import { apiKey } from "@glubean/auth";

const { http } = configure({
  secrets: { key: "TEST_API_KEY" },
  http: apiKey("HTTPBIN_URL", "apiKey", "TEST_API_KEY", "query"),
});

export const apiKeyInQueryString = test(
  { id: "auth-apikey-query", name: "apiKey appears in query string", tags: ["auth", "integration"] },
  async ({ expect, log }) => {
    const res = await http.get("get").json<{
      args: Record<string, string>;
      url: string;
    }>();

    log(`Response URL: ${res.url}`);
    log(`Query args: ${JSON.stringify(res.args)}`);

    // If hooks were forwarded correctly, apiKey should be in the query string
    expect(res.args.apiKey).toBe("test-secret-123");
  },
);
