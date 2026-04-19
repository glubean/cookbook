/**
 * DummyJSON Profile — authenticated GET /auth/me.
 *
 * Independently runnable: uses `dummyAuthApi`, which attaches
 * `Authorization: Bearer {{DUMMYJSON_TOKEN}}` resolved from the session
 * (see `session.ts`). The flow in `flow.contract.ts` composes this
 * contract by overriding Authorization with a fresh token per run.
 *
 * Run:
 *   npx glubean run contracts/dummyjson/profile.contract.ts
 */
import { z } from "zod";
import { contract } from "@glubean/sdk";
import { dummyAuthApi } from "../../config/dummyjson-api.ts";

const dummyjson = contract.http.with("dummyjson-auth", {
  client: dummyAuthApi,
});

const ProfileSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// @contract
export const getProfile = dummyjson("get-profile", {
  endpoint: "GET /auth/me",
  feature: "Authentication",
  description: "Return the authenticated user's profile",
  cases: {
    authorized: {
      description: "Valid bearer token returns the caller's profile",
      severity: "critical",
      expect: { status: 200, schema: ProfileSchema },
    },
    unauthorized: {
      description: "Missing or invalid token is rejected",
      // Per-case Authorization overrides the baked-in session token via
      // ky's header merge semantics — so this case forces a 401 even
      // when DUMMYJSON_TOKEN is set.
      headers: { Authorization: "Bearer invalid-token" },
      expect: { status: 401 },
    },
  },
});
