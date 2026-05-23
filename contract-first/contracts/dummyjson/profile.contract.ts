/**
 * DummyJSON Profile — authenticated GET /auth/me.
 *
 * The authorized case declares `needs: { token }`, so the token is part
 * of the contract's logical input. `profile.bootstrap.ts` supplies that
 * input for standalone runs, and `flow.contract.ts` supplies it from the
 * login step when composing contracts.
 *
 * Run:
 *   npx glubean run contracts/dummyjson/profile.contract.ts
 */
import { z } from "zod";
import { contract, defineHttpCase } from "@glubean/sdk";
import { dummyApi } from "../../config/dummyjson-api.ts";

const dummyjson = contract.http.with("dummyjson-auth", {
  client: dummyApi,
  // Declaratively mark this instance as Bearer-authenticated so the
  // scanner / OpenAPI / markdown projections record the requirement.
  // Runtime: cases inject Authorization from their logical input.
  // Documentation layer: emits
  // `securitySchemes.bearerAuth` + per-operation `security` entries.
  security: "bearer",
});

const ProfileSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type Profile = z.infer<typeof ProfileSchema>;

const authorized = defineHttpCase<{ token: string }, Profile>({
  description: "Valid bearer token returns the caller's profile",
  severity: "critical",
  needs: z.object({ token: z.string() }),
  headers: ({ token }) => ({ Authorization: `Bearer ${token}` }),
  expect: { status: 200, schema: ProfileSchema },
});

// @contract
export const getProfile = dummyjson("get-profile", {
  endpoint: "GET /auth/me",
  feature: "Authentication",
  description: "Return the authenticated user's profile",
  cases: {
    authorized,
    unauthorized: {
      description: "Missing or invalid token is rejected",
      headers: { Authorization: "Bearer invalid-token" },
      expect: { status: 401 },
    },
  },
});
