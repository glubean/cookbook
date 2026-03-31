/**
 * DummyJSON — retry patterns.
 *
 * Demonstrates:
 *   1. HTTP-level retry — automatic retry on transient failures (429, 503)
 *   2. Step-level retry — retry an entire step on any failure
 *
 * Run:
 *   npx glubean run explore/dummyjson/retry.test.ts
 */
import { test } from "@glubean/sdk";

const API = "https://dummyjson.com";

// ---------------------------------------------------------------------------
// 1. HTTP retry — retry on transient status codes
// ---------------------------------------------------------------------------

export const httpRetrySimple = test(
  { id: "http-retry-simple", name: "HTTP retry (simple)", tags: ["smoke", "retry"] },
  async (ctx) => {
    // Simple: retry up to 3 times on 408/429/500/502/503/504
    const product = await ctx.http
      .get(`${API}/products/1`, { retry: 3 })
      .json<{ id: number; title: string }>();

    ctx.expect(product.id).toBe(1);
    ctx.log(`Got ${product.title} (with retry: 3)`);
  },
);

export const httpRetryAdvanced = test(
  { id: "http-retry-advanced", name: "HTTP retry (advanced)", tags: ["retry"] },
  async (ctx) => {
    // Advanced: control which status codes and methods trigger retry
    const product = await ctx.http
      .get(`${API}/products/2`, {
        retry: {
          limit: 3,
          statusCodes: [429, 503],
          methods: ["GET"],
        },
      })
      .json<{ id: number; title: string }>();

    ctx.expect(product.id).toBe(2);
    ctx.log(`Got ${product.title} (with custom retry config)`);
  },
);

// ---------------------------------------------------------------------------
// 2. Step retry — retry entire step on failure
// ---------------------------------------------------------------------------

export const stepRetry = test("step-retry")
  .meta({ name: "Step-level retry", tags: ["retry"] })
  .step("fetch with retry", { retries: 2 }, async (ctx) => {
    const product = await ctx.http
      .get(`${API}/products/3`)
      .json<{ id: number; title: string; price: number }>();

    ctx.expect(product.id).toBe(3);
    ctx.expect(product.price).toBeGreaterThan(0);
    ctx.log(`Got ${product.title} — $${product.price} (step retries: 2)`);

    return { title: product.title };
  })
  .step("verify", async (ctx, { title }) => {
    ctx.expect(title).toBeDefined();
    ctx.log(`Verified: ${title}`);
  })
  .build();
