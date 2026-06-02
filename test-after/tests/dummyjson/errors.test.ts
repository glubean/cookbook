/**
 * DummyJSON expected-error pattern.
 *
 * The SDK's HTTP client returns the response by default, even on 4xx/5xx.
 * That means expected failures like 404 can be asserted directly.
 *
 * Run:
 *   npx glubean run tests/dummyjson/errors.test.ts
 */
import { test } from "@glubean/sdk";
import { dummyApi } from "../../config/dummyjson-api.ts";

export const assertNotFound = test(
  {
    id: "dj-assert-not-found",
    name: "Error handling: assert 404",
    tags: ["smoke", "errors"],
  },
  async ({ expect, log }) => {
    const res = await dummyApi.get("products/0");

    expect(res).toHaveStatus(404);

    const body = await res.json<{ message?: string }>();
    expect(body.message).toBeDefined();

    log(`Got expected 404: ${body.message ?? "(no message)"}`);
  },
);
