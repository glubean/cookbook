/**
 * v10 Attachment-Model — bootstrap overlay for `auth.me.authorized`.
 *
 * Sibling to `me.contract.ts`. Scanner's §7.4 eager-load picks this up
 * automatically when running anything in this folder: scanner walks
 * `*.bootstrap.{ts,js,mjs}` patterns, dynamically imports each, and
 * the `contract.bootstrap()` call here registers the overlay before
 * any test runs.
 *
 * Two registrations:
 *   - `meAuthorizedOverlay` — plain-function form. Logs in, returns
 *     `{ token }`. Used by default when CLI runs `auth.me.authorized`.
 *   - `meAttachOverlay` — structured form WITH `params` schema.
 *     Demonstrates `--bootstrap-json '{"projectId":"{{PROJECT_ID}}"}'`
 *     style: runner-supplied params validated against the schema and
 *     passed to `run(ctx, params)`.
 */

import { z } from "zod";
import { contract } from "@glubean/sdk";
import { dummyApi } from "../../config/dummyjson-api.ts";
import { getMe } from "./me.contract.ts";

// ── Overlay 1: plain-function form ─────────────────────────────────
//
// CLI `glubean run --filter auth.me.authorized` (no --input-json /
// --bootstrap-json) hits this branch. Overlay does login, returns
// `{ token }`, dispatcher validates against the case's `needs`
// schema, then passes the validated input to the case's `headers`
// function.
export const meAuthorizedOverlay = contract.bootstrap(
  getMe.case("authorized"),
  async (ctx) => {
    const res = await dummyApi.post("auth/login", {
      json: { username: "emilys", password: "emilyspass" },
    });
    const body = (await res.json()) as { accessToken: string };

    // `ctx.cleanup(...)` runs LIFO around the case (after the case
    // executes, even on failure). dummyjson has no real "logout" API;
    // a real overlay would call something like /auth/logout here.
    ctx.cleanup(async () => {
      ctx.log("[overlay-cleanup] would log out emilys here");
    });

    return { token: body.accessToken };
  },
);

// ── Overlay 2: structured form with `params` schema ────────────────
//
// Demonstrates the `--bootstrap-json` channel:
//
//   glubean run contracts/attachment-model/me.contract.ts \
//     --filter auth.me.requiresAttachment \
//     --bootstrap-json '{"username":"emilys","password":"emilyspass"}'
//
// Runner validates the JSON against `params`, passes the validated
// value to `run(ctx, params)`. Templating ({{VAR}}) substitutes
// from project .env / process env before validation.
export const meAttachOverlay = contract.bootstrap(
  getMe.case("requiresAttachment"),
  {
    // Optional schema — overlay runs with hardcoded defaults when no
    // `--bootstrap-json` supplied, accepts overrides when supplied.
    // Alternative pattern: use required params (drop `.optional()`) to
    // force explicit `--bootstrap-json` from the runner — overlay then
    // hard-errors with "Bootstrap params does not satisfy params schema"
    // if input is missing.
    params: z.object({
      username: z.string().optional(),
      password: z.string().optional(),
    }).optional(),
    run: async (ctx, params) => {
      const username = params?.username ?? "emilys";
      const password = params?.password ?? "emilyspass";

      const res = await dummyApi.post("auth/login", {
        json: { username, password },
      });
      const body = (await res.json()) as { accessToken: string };

      ctx.cleanup(async () => {
        ctx.log(`[overlay-cleanup] would log out ${username} here`);
      });

      return { token: body.accessToken };
    },
  },
);
