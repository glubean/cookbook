import { defineSession } from "@glubean/sdk";
import { dummyApi } from "../../config/dummyjson-api.ts";

/**
 * Session setup for DummyJSON contracts.
 *
 * Logs in once and stores the access token as `DUMMYJSON_TOKEN` so
 * `dummyAuthApi`'s `Authorization: Bearer {{DUMMYJSON_TOKEN}}` placeholder
 * resolves — letting auth-required cases (e.g. `getProfile.authorized`)
 * run independently, without requiring callers to pre-provision a token.
 */
export default defineSession({
  async setup(ctx) {
    const res = await dummyApi.post("auth/login", {
      json: { username: "emilys", password: "emilyspass" },
    });
    const body = await res.json<{ accessToken: string; id: number }>();
    ctx.session.set("DUMMYJSON_TOKEN", body.accessToken);
    ctx.log(`session: logged in as emilys (userId=${body.id})`);
  },
});
