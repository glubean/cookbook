/**
 * DummyJSON — a free fake REST API, no token required.
 * https://dummyjson.com
 *
 * Start here. These tests show the basics with zero setup:
 *   - Making HTTP requests
 *   - Asserting on the response shape
 *   - Logging output to the trace viewer
 *
 * Run:
 *   glubean run explore/dummyjson
 */
import { test } from "@glubean/sdk";

const API = "https://dummyjson.com";

// ---------------------------------------------------------------------------
// 1. Fetch a single product
// ---------------------------------------------------------------------------

export const getProduct = test(
  { id: "dj-get-product", name: "GET product", tags: ["smoke"] },
  async ({ http, expect, log }) => {
    const product = await http
      .get(`${API}/products/2`)
      .json<{ id: number; title: string; price: number; rating: number }>();

    expect(product.id).toBe(1);
    expect(product.title).toBeDefined();
    expect(product.price).toBeGreaterThan(0);

    log(`${product.title} — $${product.price} (rating: ${product.rating})`);
  },
);

// ---------------------------------------------------------------------------
// 2. List products
// ---------------------------------------------------------------------------

export const listProducts = test(
  { id: "dj-list-products", name: "GET products", tags: ["smoke"] },
  async ({ http, expect, log }) => {
    const result = await http
      .get(`${API}/products`)
      .json<{ products: { id: number; title: string }[]; total: number }>();

    expect(result.total).toBeGreaterThan(0);
    expect(result.products).toBeDefined();

    log(`${result.products.length} of ${result.total} products:`);
    for (const p of result.products.slice(0, 5)) {
      log(`  [${p.id}] ${p.title}`);
    }
  },
);

// ---------------------------------------------------------------------------
// 3. Create a product (fake — DummyJSON doesn't persist it)
// ---------------------------------------------------------------------------

export const createProduct = test(
  { id: "dj-create-product", name: "POST product", tags: ["smoke"] },
  async ({ http, expect, log }) => {
    const created = await http
      .post(`${API}/products/add`, {
        json: { title: "Test Product", price: 9.99, stock: 100 },
      })
      .json<{ id: number; title: string; price: number }>();

    expect(created.id).toBeDefined();
    expect(created.title).toBe("Test Product");

    log(`Created product #${created.id}: ${created.title} — $${created.price}`);
  },
);
