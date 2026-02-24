/**
 * DummyJSON expected-error pattern.
 *
 * The SDK's HTTP client throws on non-2xx responses, so try/catch is
 * the idiomatic way to assert expected failures like 404 or 401.
 *
 * Run:
 *   glubean run explore/dummyjson/errors.test.ts
 */
import { test } from "@glubean/sdk";

const API = "https://dummyjson.com";

type HttpLikeError = {
  message?: string;
  response?: { status?: number };
  status?: number;
};

export const assertNotFound = test(
  {
    id: "dj-assert-not-found",
    name: "Error handling: assert 404",
    tags: ["smoke", "errors"],
  },
  async ({ http, expect, log }) => {
    let status: number | undefined;
    let message = "";

    try {
      await http.get(`${API}/products/0`).json();

      // This line should never run. If it runs, the request did not fail.
      expect("request should fail").toBe("request failed as expected");
    } catch (error) {
      const httpError = error as HttpLikeError;
      status = httpError.response?.status ?? httpError.status;
      message = httpError.message ?? "";
    }

    expect(status).toBe(404);
    log(`Caught expected 404. Message: ${message}`);
  },
);
