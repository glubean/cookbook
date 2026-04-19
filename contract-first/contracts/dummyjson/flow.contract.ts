/**
 * DummyJSON Flow — v0.2 `contract.flow()` example.
 *
 * Verifies login + authenticated profile fetch work together. Demonstrates
 * state threading between steps via `in` / `out` typed lenses (no callback
 * black boxes — scanner / MCP / Cloud see the field mappings).
 *
 * API changes from v0.1.x:
 *   - FlowBuilder API replaced: `.http(name, spec).returns(fn)` →
 *     `.step(contract.case("key"), { in, out })`.
 *   - Steps compose existing contract cases instead of declaring new ad-hoc
 *     specs — `login` and `getProfile` are imported from their own files.
 *   - `.compute(fn)` handles pure synchronous computation (e.g. string
 *     concatenation) that lenses can't express. Lenses are strict
 *     "select & repack" — template literals and method calls throw a
 *     LensPurityError at projection time, so `"Bearer ${token}"` must
 *     be built in a compute step.
 *
 * Run:
 *   npx glubean run contracts/dummyjson/flow.contract.ts
 */
import { contract } from "@glubean/sdk";
import { login } from "./auth.contract.ts";
import { getProfile } from "./profile.contract.ts";

// @flow
export const loginThenGetProfile = contract
  .flow("login-then-profile")
  .meta({
    description:
      "Login with valid credentials, then fetch the profile using the returned token",
    tags: ["e2e"],
  })
  // Step 1: call `login.case("success")`. The login contract already encodes
  // `body: { username, password }` — no need to repeat it here.
  // The `out` lens captures the access token into flow state.
  .step(login.case("success"), {
    out: (_s, res: any) => ({
      token: res.body.accessToken as string,
      userId: res.body.id as number,
    }),
  })
  // Build the Authorization header via `.compute()`. String concatenation
  // is not a lens operation (it would call `.toString()` on the traced
  // state), so compute is the canonical place for it.
  .compute((s) => ({
    ...s,
    authHeader: `Bearer ${s.token}`,
  }))
  // Step 2: call `getProfile.case("authorized")`. The lens injects the
  // pre-built authHeader as a pure field lookup — no computation in the lens.
  .step(getProfile.case("authorized"), {
    in: (s) => ({ headers: { Authorization: s.authHeader } }),
  });
