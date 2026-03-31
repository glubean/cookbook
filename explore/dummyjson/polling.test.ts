/**
 * DummyJSON polling pattern with ctx.pollUntil().
 *
 * Demonstrates:
 *   - polling a condition until it becomes truthy
 *   - logging retries
 *   - keeping eventual-consistency logic out of ad hoc sleep() calls
 *
 * Run:
 *   npx glubean run explore/dummyjson/polling.test.ts
 */
import { test } from "@glubean/sdk";
import { dummyApi } from "../../config/dummyjson-api.ts";

export const waitForSearchResults = test(
  {
    id: "dj-poll-search",
    name: "Poll until search returns results",
    tags: ["smoke", "polling"],
  },
  async (ctx) => {
    let attempts = 0;

    await ctx.pollUntil(
      {
        timeoutMs: 5_000,
        intervalMs: 500,
      },
      async () => {
        attempts += 1;

        const result = await dummyApi
          .get("products/search", { searchParams: { q: "phone" } })
          .json<{ total: number }>();

        ctx.log(`Attempt ${attempts}: found ${result.total} matches`);
        return result.total > 0;
      },
    );

    ctx.expect(attempts).toBeGreaterThan(0);
    ctx.log(`Polling succeeded after ${attempts} attempt(s)`);
  },
);
