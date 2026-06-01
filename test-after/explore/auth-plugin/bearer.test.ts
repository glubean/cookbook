/**
 * Auth Plugin — Bearer token via @glubean/auth.
 *
 * Uses dummyjson.com's auth endpoint to get a token,
 * then accesses a protected resource with the bearer helper.
 *
 * Patterns taught:
 *   - bearer() shortcut from @glubean/auth
 *   - Literal values for quick prototyping (no .env needed)
 *   - http.extend() for per-request auth override
 *
 * Run:
 *   npx glubean run explore/auth-plugin/bearer.test.ts
 */
import { test, configure } from "@glubean/sdk";
import { bearer } from "@glubean/auth";

// Quick prototype: literal base URL, no .env needed.
const { http: publicHttp } = configure({
  http: {
    prefixUrl: "https://dummyjson.com",
    retry: { limit: 2, retryOnTimeout: true },
  },
});

const { http: bearerHttp } = configure({
  http: {
    ...bearer({
      prefixUrl: "https://dummyjson.com",
      token: "placeholder", // will be overridden per-request
    }),
    retry: { limit: 2, retryOnTimeout: true },
  },
});

export const loginThenAccess = test("auth-bearer-flow")
  .meta({ name: "Login then access profile with bearer", tags: ["auth", "plugin"] })
  .step("login", async ({ log }) => {
    const { accessToken } = await publicHttp
      .post("auth/login", {
        json: { username: "emilys", password: "emilyspass" },
      })
      .json<{ accessToken: string }>();

    log(`Got token: ${accessToken.slice(0, 20)}...`);
    return { token: accessToken };
  })
  .step("access profile", async ({ expect, log }, { token }) => {
    // Override bearer token with the real one
    const authed = bearerHttp.extend({
      headers: { Authorization: `Bearer ${token}` },
    });
    const profile = await authed.get("auth/me").json<{ id: number; username: string }>();
    expect(profile.username).toBe("emilys");
    log(`Profile: ${profile.username} (id: ${profile.id})`);
  });
