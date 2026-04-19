/**
 * DummyJSON Auth — contract-first example.
 *
 * Declares login endpoint behavior with success and error cases.
 * Shows per-case body variations and schema validation.
 *
 * Run:
 *   npx glubean run contracts/dummyjson/
 */
import { z } from "zod";
import { contract } from "@glubean/sdk";
import { dummyApi } from "../../config/dummyjson-api.ts";

const dummyjson = contract.http.with("dummyjson", {
  client: dummyApi,
});

const LoginResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  accessToken: z.string(),
});

// @contract
export const login = dummyjson("login", {
  endpoint: "POST /auth/login",
  feature: "Authentication",
  description: "User login with username and password",
  cases: {
    success: {
      description: "Valid credentials return user profile with auth token",
      severity: "critical",
      body: { username: "emilys", password: "emilyspass" },
      expect: { status: 200, schema: LoginResponseSchema },
    },
    wrongPassword: {
      description: "Incorrect password is rejected",
      body: { username: "emilys", password: "wrongpassword" },
      expect: { status: 400 },
    },
    unknownUser: {
      description: "Non-existent username is rejected",
      body: { username: "nonexistentuser999", password: "anything" },
      expect: { status: 400 },
    },
    legacyTokenRefresh: {
      description: "Legacy token refresh endpoint was removed in v2",
      body: { username: "emilys", refreshToken: "old-token" },
      expect: { status: 400 },
      deprecated: "replaced by /auth/refresh in API v2",
    },
  },
});
