/**
 * Auth Plugin — API key in query param via @glubean/auth.
 *
 * Demonstrates apiKey({ location: "query" }) which injects the key
 * into every request's query string automatically.
 *
 * Uses httpbin.org/get which echoes back query params.
 *
 * Patterns taught:
 *   - apiKey() with location: "query"
 *   - Combining apiKey() with custom headers (spread pattern)
 *   - {{KEY}} references vs literal values
 *
 * Run:
 *   npx glubean run tests/auth-plugin/apikey-query.test.ts
 */
import { test, configure } from "@glubean/sdk";
import { apiKey } from "@glubean/auth";

// Simple: apiKey in query string, literal values for demo
const { http } = configure({
  http: {
    ...apiKey({
      prefixUrl: "https://httpbin.org",
      param: "apiKey",
      value: "demo-key-123",
      location: "query",
    }),
    retry: { limit: 2, retryOnTimeout: true },
  },
});

export const apiKeyInQuery = test(
  {
    id: "auth-apikey-query",
    name: "API key appears in query string",
    tags: ["auth", "plugin"],
  },
  async ({ expect, log }) => {
    const res = await http.get("get").json<{
      args: Record<string, string>;
      url: string;
    }>();

    log(`URL: ${res.url}`);
    expect(res.args.apiKey).toBe("demo-key-123");
  },
);

// Advanced: combine apiKey() with custom headers
const base = apiKey({
  prefixUrl: "https://httpbin.org",
  param: "apiKey",
  value: "demo-key-456",
  location: "query",
});

const { http: combined } = configure({
  http: {
    ...base,
    headers: {
      ...base.headers, // preserve apiKey's internal marker header
      "X-Custom": "my-value",
    },
    retry: { limit: 2, retryOnTimeout: true },
  },
});

export const apiKeyWithCustomHeaders = test(
  {
    id: "auth-apikey-combined",
    name: "API key + custom headers combined",
    tags: ["auth", "plugin"],
  },
  async ({ expect, log }) => {
    const res = await combined.get("get").json<{
      args: Record<string, string>;
      headers: Record<string, string>;
    }>();

    expect(res.args.apiKey).toBe("demo-key-456");
    expect(res.headers["X-Custom"]).toBe("my-value");
    log(`apiKey=${res.args.apiKey}, X-Custom=${res.headers["X-Custom"]}`);
  },
);
