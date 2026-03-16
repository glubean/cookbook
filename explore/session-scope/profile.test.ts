import { test, configure } from "@glubean/sdk";

/**
 * This file uses the auth token created by session.ts setup.
 * No need to log in again — session state is automatically injected.
 */

const { http } = configure({
  http: { prefixUrl: "DUMMYJSON_API" },
});

export const getOwnProfile = test("get-own-profile", async (ctx) => {
  const token = ctx.session.require("authToken");

  const res = await http.get("auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  ctx.expect(res).toHaveStatus(200);

  const body = await res.json<{ id: number; username: string }>();
  ctx.assert(body.username === "emilys", `expected emilys, got ${body.username}`);
  ctx.log(`Profile: ${body.username} (id: ${body.id})`);
});

export const updateProfile = test("update-profile", async (ctx) => {
  const token = ctx.session.require("authToken");
  const userId = ctx.session.require("userId");

  const res = await http.put(`users/${userId}`, {
    json: { firstName: "Updated" },
    headers: { Authorization: `Bearer ${token}` },
  });

  ctx.expect(res).toHaveStatus(200);

  const body = await res.json<{ firstName: string }>();
  ctx.assert(body.firstName === "Updated", `expected Updated, got ${body.firstName}`);
});
