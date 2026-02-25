/**
 * DummyJSON pagination pattern.
 *
 * Run:
 *   glubean run explore/dummyjson/pagination.test.ts
 */
import { test } from "@glubean/sdk";

const API = "https://dummyjson.com";

type ProductList = { products: { id: number; title: string }[]; total: number };

export const paginateProducts = test(
  {
    id: "dj-pagination-products",
    name: "Pagination: compare two pages",
    tags: ["smoke", "pagination"],
  },
  async ({ http, expect, log }) => {
    const pageSize = 5;

    const firstPage = await http
      .get(`${API}/products`, {
        searchParams: { limit: String(pageSize), skip: "0" },
      })
      .json<ProductList>();

    const secondPage = await http
      .get(`${API}/products`, {
        searchParams: { limit: String(pageSize), skip: String(pageSize) },
      })
      .json<ProductList>();

    expect(firstPage.total).toBeGreaterThan(pageSize);
    expect(firstPage.products.length).toBe(pageSize);
    expect(secondPage.products.length).toBe(pageSize);

    const firstIds = firstPage.products.map((p) => p.id);
    const secondIds = secondPage.products.map((p) => p.id);
    const overlapCount = firstIds.filter((id) => secondIds.includes(id)).length;

    expect(overlapCount).toBe(0);

    log(`Total products: ${firstPage.total}`);
    log(`Page 1 IDs: ${firstIds.join(", ")}`);
    log(`Page 2 IDs: ${secondIds.join(", ")}`);
  },
);
