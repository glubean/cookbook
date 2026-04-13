/**
 * DummyJSON Products — contract-first example.
 *
 * Declares expected behavior for the products endpoints
 * using contract.http(). No test() wrapper needed.
 *
 * Run:
 *   npx glubean run contracts/dummyjson/
 *
 * View as spec:
 *   npx glubean contracts --dir .
 */
import { z } from "zod";
import { contract } from "@glubean/sdk";
import { dummyApi } from "../../config/dummyjson-api.ts";

// ── Schemas ────────────────────────────────────────────────────────────────

const ProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
  rating: z.number(),
  brand: z.string().optional(),
  category: z.string(),
});

const ProductListSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

// ── Get product by ID ──────────────────────────────────────────────────────

export const getProduct = contract.http("get-product", {
  endpoint: "GET /products/:id",
  feature: "Product Catalog",
  description: "Retrieve a single product by ID",
  client: dummyApi,
  cases: {
    found: {
      description: "Existing product returns full details with schema validation",
      params: { id: "1" },
      expect: { status: 200, schema: ProductSchema },
    },
    notFound: {
      description: "Non-existent product ID returns error",
      params: { id: "99999" },
      expect: { status: 404 },
    },
  },
});

// ── List products ──────────────────────────────────────────────────────────

export const listProducts = contract.http("list-products", {
  endpoint: "GET /products",
  feature: "Product Catalog",
  description: "List products with pagination",
  client: dummyApi,
  cases: {
    defaultPage: {
      description: "Default request returns first page with limit 30",
      expect: { status: 200, schema: ProductListSchema },
      verify: async (ctx, res) => {
        ctx.expect(res.products.length).toBeGreaterThan(0);
        ctx.expect(res.skip).toBe(0);
      },
    },
    withLimit: {
      description: "Custom limit restricts result count",
      query: { limit: "5" },
      expect: { status: 200, schema: ProductListSchema },
      verify: async (ctx, res) => {
        ctx.expect(res.products.length).toBe(5);
        ctx.expect(res.limit).toBe(5);
      },
    },
    withSkip: {
      description: "Skip parameter offsets results for pagination",
      query: { limit: "5", skip: "10" },
      expect: { status: 200 },
      verify: async (ctx, res) => {
        ctx.expect(res.skip).toBe(10);
      },
    },
  },
});

// ── Search products ────────────────────────────────────────────────────────

export const searchProducts = contract.http("search-products", {
  endpoint: "GET /products/search",
  feature: "Product Search",
  description: "Full-text search across product catalog",
  client: dummyApi,
  cases: {
    matchFound: {
      description: "Known keyword returns matching products",
      query: { q: "phone" },
      expect: { status: 200 },
      verify: async (ctx, res) => {
        ctx.expect(res.products.length).toBeGreaterThan(0);
      },
    },
    noMatch: {
      description: "Nonsense keyword returns empty result set",
      query: { q: "xyznonexistent999" },
      expect: { status: 200 },
      verify: async (ctx, res) => {
        ctx.expect(res.products.length).toBe(0);
      },
    },
  },
});
