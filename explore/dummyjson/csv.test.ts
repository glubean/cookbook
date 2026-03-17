/**
 * DummyJSON data loading with fromCsv().
 *
 * Demonstrates:
 *   - loading rows from CSV
 *   - turning CSV rows into test.each() cases
 *   - parsing string fields into typed assertions
 *
 * Run:
 *   npx glubean run explore/dummyjson/csv.test.ts
 */
import { fromCsv, test } from "@glubean/sdk";

const API = "https://dummyjson.com";

const rows = await fromCsv<{
  id: string;
  label: string;
  minPrice: string;
}>("./data/dummyjson/products.csv");

export const csvCases = test.each(rows)(
  { id: "dj-csv-$label", name: "CSV case: $label", tags: ["smoke", "csv"] },
  async (ctx, row) => {
    const id = Number(row.id);
    const minPrice = Number(row.minPrice);

    const product = await ctx.http
      .get(`${API}/products/${id}`)
      .json<{ id: number; title: string; price: number }>();

    ctx.expect(product.id).toBe(id);
    ctx.expect(product.price).toBeGreaterThanOrEqual(minPrice);

    ctx.log(`Loaded ${product.title} from CSV-backed test data`);
  },
);
