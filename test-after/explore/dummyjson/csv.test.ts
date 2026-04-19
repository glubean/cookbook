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
import type { CatalogRow } from "../../types/dummyjson.ts";
import { dummyApi } from "../../config/dummyjson-api.ts";

const rows = await fromCsv<CatalogRow>("data/dummyjson/products.csv");

export const csvCases = test.each(rows)(
  { id: "dj-csv-$label", name: "CSV case: $label", tags: ["smoke", "csv"] },
  async (ctx, row) => {
    const id = Number(row.id);
    const minPrice = Number(row.minPrice);

    const product = await dummyApi
      .get(`products/${id}`)
      .json<{ id: number; title: string; price: number }>();

    ctx.expect(product.id).toBe(id);
    ctx.expect(product.price).toBeGreaterThanOrEqual(minPrice);

    ctx.log(`Loaded ${product.title} from CSV-backed test data`);
  },
);
