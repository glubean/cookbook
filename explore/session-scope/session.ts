import { defineSession } from "@glubean/sdk";

/**
 * Session setup runs once before all test files in this directory.
 * Use it to create shared resources (users, tokens, etc.) that
 * multiple test files need.
 *
 * Teardown runs after all test files finish — even if setup fails.
 */
export default defineSession({
  async setup(ctx) {
    // Create a test user and store the auth token for all tests
    const api = ctx.vars.require("DUMMYJSON_API");
    const res = await ctx.http.post(`${api}/auth/login`, {
      json: {
        username: "emilys",
        password: "emilyspass",
      },
    });

    const body = await res.json<{ accessToken: string; id: number }>();

    ctx.session.set("authToken", body.accessToken);
    ctx.session.set("userId", body.id);

    ctx.log(`Session ready: userId=${body.id}`);
  },

  async teardown(ctx) {
    const userId = ctx.session.get("userId");
    ctx.log(`Teardown: cleaning up for userId=${userId}`);
    // In a real scenario, you'd delete the test user or revoke tokens here
  },
});
