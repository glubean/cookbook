/**
 * DummyJSON data loading with fromYaml().
 *
 * Demonstrates:
 *   1. Flat array YAML — load rows with `pick`, feed to test.each()
 *   2. Structured YAML — each case has description, query, expect
 *      (data drives both input and assertions)
 *
 * Run:
 *   npx glubean run explore/dummyjson/yaml.test.ts
 */
import { fromYaml, test } from "@glubean/sdk";
import type { CatalogCase, SearchCase } from "../../types/dummyjson.ts";

const API = "https://dummyjson.com";

// ---------------------------------------------------------------------------
// 1. Flat array YAML (pick a nested key)
// ---------------------------------------------------------------------------

const catalogCases = await fromYaml<CatalogCase>("data/dummyjson/catalog.yaml", {
  pick: "testCases",
});

export const yamlCases = test.each(catalogCases)(
  { id: "dj-yaml-$label", name: "YAML case: $label", tags: ["smoke", "yaml"] },
  async (ctx, { id, minPrice, category }) => {
    const product = await ctx.http
      .get(`${API}/products/${id}`)
      .json<{ id: number; title: string; price: number; category: string }>();

    ctx.expect(product.id).toBe(id);
    ctx.expect(product.price).toBeGreaterThanOrEqual(minPrice);
    ctx.expect(product.category).toBe(category);

    ctx.log(`Loaded ${product.title} from YAML-backed test data`);
  },
);

// ---------------------------------------------------------------------------
// 2. Structured YAML — description + query + expect per case
//    Data simultaneously drives the request AND the assertions.
// ---------------------------------------------------------------------------

const searchCases = await fromYaml<SearchCase>("data/search-queries-yaml/shared.yaml");

export const yamlSearch = test.each(searchCases)(
  { id: "dj-yaml-search-$index", name: "YAML search: $description", tags: ["yaml"] },
  async (ctx, { description, query, expect: exp }) => {
    ctx.log(description);

    const result = await ctx.http
      .get(`${API}/products/search`, { searchParams: { q: query.q } })
      .json<{ products: { id: number; title: string }[]; total: number }>();

    ctx.expect(result.total).toBeGreaterThanOrEqual(exp.minResults);

    ctx.log(`"${query.q}" → ${result.total} results`);
    for (const p of result.products.slice(0, 3)) {
      ctx.log(`  [${p.id}] ${p.title}`);
    }
  },
);
