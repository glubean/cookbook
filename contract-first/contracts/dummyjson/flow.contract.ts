/**
 * DummyJSON Workflow — lifecycle verification with `workflow()`.
 *
 * Verifies login + authenticated profile fetch work together. Demonstrates
 * state threading between nodes via `in` / `out` typed lenses (no callback
 * black boxes — scanner / MCP / Cloud see the field mappings).
 *
 * API changes from v0.3.x:
 *   - `contract.flow()` was removed; `workflow()` is the lifecycle API.
 *   - `.step(ref, bindings)` → `.call(nodeId, ref, bindings)` — every node
 *     carries an explicit id that shows up in projection and run output.
 *   - `in` returns the case's needs-shaped LOGICAL input; the case's own
 *     function-valued action fields (body / pathParams / query / headers)
 *     map it onto the wire.
 *
 * Run:
 *   npx glubean run contracts/dummyjson/flow.contract.ts
 */
import { workflow } from "@glubean/sdk";
import { login } from "./auth.contract.ts";
import { getProfile } from "./profile.contract.ts";

export const loginThenGetProfile = workflow({
  id: "login-then-profile",
  description:
    "Login with valid credentials, then fetch the profile using the returned token",
  tags: ["e2e"],
})
  // Node 1: call `login.case("success")`. The login contract already encodes
  // `body: { username, password }` — no need to repeat it here.
  // The `out` lens captures the access token into workflow state.
  .call("login", login.case("success"), {
    out: (_s, res) => ({
      token: (res as { body: { accessToken: string } }).body.accessToken,
      userId: (res as { body: { id: number } }).body.id,
    }),
  })
  // Node 2: call `getProfile.case("authorized")`. The lens passes the
  // logical input declared by the case's `needs` schema.
  .call("get-profile", getProfile.case("authorized"), {
    in: (s) => ({ token: s.token }),
  });
