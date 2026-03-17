/**
 * DummyJSON expected-error pattern.
 *
 * The SDK's HTTP client returns the response by default, even on 4xx/5xx.
 * That means expected failures like 404 can be asserted directly.
 *
 * Run:
 *   npx glubean run explore/dummyjson/errors.test.ts
 */
import { test } from "@glubean/sdk";

const API = "https://dummyjson.com";

export const assertNotFound = test(
  {
    id: "dj-assert-not-found",
    name: "Error handling: assert 404",
    tags: ["smoke", "errors"],
  },
  async ({ http, expect, log }) => {
    const res = await http.get(`${API}/products/0`);

    expect(res).toHaveStatus(404);

    const body = await res.json<{ message?: string }>();
    expect(body.message).toBeDefined();

    log(`Got expected 404: ${body.message ?? "(no message)"}`);
  },
);
