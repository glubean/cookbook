/**
 * v10 Attachment-Model — `GET /auth/me` redone as a pure contract case.
 *
 * Compare with `../dummyjson/profile.contract.ts`, which uses the same
 * logical-input idea in a smaller feature folder. This example goes deeper
 * on `runnability.requireAttachment` and runner input channels.
 *
 * Here the case declares `needs: { token }` as its **logical input**.
 * The contract is pure semantics — no setup, no ky-base header magic.
 * The `me.bootstrap.ts` sibling registers a `contract.bootstrap()`
 * overlay that does the login and supplies `{ token }`. CLI / MCP /
 * `runCase` can also bypass the overlay with `--input-json` and supply
 * the token directly.
 *
 * @see ./README.md for the full walkthrough and run commands.
 */

import { z } from "zod";
import { contract, defineHttpCase } from "@glubean/sdk";
import { dummyApi } from "../../config/dummyjson-api.ts";

const dummyjson = contract.http.with("dummyjson-attachment-model", {
  client: dummyApi,
  security: "bearer",
});

const ProfileSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
});

// `defineHttpCase<{ token: string }>` captures Needs once and locks
// every action field's parameter type. Drift between `needs` and the
// `headers` function destructure becomes a compile error (closes the
// v3 P2 known-open).
const authorized = defineHttpCase<{ token: string }>({
  description: "Valid bearer token returns the caller's profile",
  severity: "critical",
  given: "an authenticated session whose access token is in flight",
  needs: z.object({ token: z.string() }),
  // `headers` is now a function of the case's logical input. The
  // overlay's `run()` produces `{ token }`; CLI `--input-json`
  // supplies it directly. Either way `headers` builds the wire shape.
  headers: ({ token }) => ({ Authorization: `Bearer ${token}` }),
  expect: { status: 200, schema: ProfileSchema },
});

const requiresAttachment = defineHttpCase<{ token: string }>({
  description: "Case marked requireAttachment — bare runs blocked; --input-json + overlay both OK because `needs` is declared",
  needs: z.object({ token: z.string() }),
  headers: ({ token }) => ({ Authorization: `Bearer ${token}` }),
  expect: { status: 200, schema: ProfileSchema },
  // Per §6.3: with `needs` declared AND `requireAttachment: true`:
  //   - bare run (no input, no overlay) → ❌ blocked
  //   - --input-json '{"token":"..."}' → ✅ rawBypass (school B)
  //   - overlay registered → ✅
  //   - inside flow via .step() → ✅
  // For the no-needs variant where --input-json is also blocked
  // (only overlay / flow / --force-standalone work), see §6.3 table.
  runnability: { requireAttachment: true },
});

// @contract
export const getMe = dummyjson("auth.me", {
  endpoint: "GET /auth/me",
  feature: "Authentication (v10 attachment model)",
  description: "Return the authenticated user's profile via overlay-supplied token",
  cases: {
    authorized,
    requiresAttachment,
  },
});
