/**
 * DummyJSON Profile — authenticated GET /auth/me.
 *
 * Separate contract from auth/login so it can be reused by flows that
 * compose login → fetch-profile (see `flow.contract.ts`).
 *
 * Run:
 *   npx glubean run contracts/dummyjson/profile.contract.ts
 */
import { z } from "zod";
import { contract } from "@glubean/sdk";
import { dummyApi } from "../../config/dummyjson-api.ts";

const dummyjson = contract.http.with("dummyjson", {
  client: dummyApi,
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
      // Authorization header injected by the flow lens at call time.
      expect: { status: 200, schema: ProfileSchema },
    },
    unauthorized: {
      description: "Missing or invalid token is rejected",
      headers: { Authorization: "Bearer invalid-token" },
      expect: { status: 401 },
    },
  },
});
