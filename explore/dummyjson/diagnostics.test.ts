/**
 * DummyJSON observability pattern.
 *
 * Demonstrates:
 *   - ctx.metric() for custom measurements
 *   - ctx.action() / ctx.event() for structured timeline data
 *   - ctx.warn() for non-failing quality signals
 *
 * Run:
 *   npx glubean run explore/dummyjson/diagnostics.test.ts
 */
import { test } from "@glubean/sdk";

const API = "https://dummyjson.com";

export const diagnostics = test(
  {
    id: "dj-diagnostics",
    name: "Metrics + events + warnings",
    tags: ["smoke", "diagnostics"],
  },
  async (ctx) => {
    const startedAt = Date.now();

    const result = await ctx.http
      .get(`${API}/products?limit=5`)
      .json<{ products: { id: number; title: string; price: number }[] }>();

    const durationMs = Date.now() - startedAt;
    const productCount = result.products.length;
    const averagePrice =
      result.products.reduce((sum, product) => sum + product.price, 0) /
      Math.max(productCount, 1);

    ctx.metric("sample_product_count", productCount, { unit: "count" });
    ctx.metric("sample_average_price", averagePrice, { unit: "usd" });
    ctx.metric("manual_request_duration_ms", durationMs, { unit: "ms" });

    if (averagePrice > 1000) {
      ctx.warn(false, `Average price looks suspiciously high: ${averagePrice}`);
    } else {
      ctx.warn(true, `Average price looks normal: ${averagePrice}`);
    }

    ctx.action({
      category: "analysis",
      target: "dummyjson sample",
      status: "ok",
      duration: durationMs,
    });

    ctx.event({
      type: "sample:summary",
      data: {
        sampledAt: new Date().toISOString(),
        productCount,
        averagePrice,
        firstProduct: result.products[0]?.title,
      },
    });

    ctx.expect(productCount).toBe(5);
    ctx.log(`Captured ${productCount} products in ${durationMs}ms`);
  },
);
