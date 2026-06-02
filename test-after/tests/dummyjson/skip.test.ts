/**
 * DummyJSON skip pattern.
 *
 * Demonstrates:
 *   - test.skip() for intentionally disabled checks
 *   - keeping optional or future checks visible without making the run fail
 *
 * Run:
 *   npx glubean run tests/dummyjson/skip.test.ts
 */
import { test } from "@glubean/sdk";
import { dummyApi } from "../../config/dummyjson-api.ts";

export const activeCheck = test(
  {
    id: "dj-active-check",
    name: "Active check runs normally",
    tags: ["skip"],
  },
  async (ctx) => {
    const product = await dummyApi
      .get("products/1")
      .json<{ id: number; title: string }>();

    ctx.expect(product.id).toBe(1);
    ctx.log(`Active check ran for ${product.title}`);
  },
);

export const optionalCheck = test.skip(
  {
    id: "dj-optional-check",
    name: "Skipped check stays visible in discovery",
    tags: ["skip"],
  },
  async (ctx) => {
    const product = await dummyApi
      .get("products/1")
      .json<{ id: number; title: string }>();

    ctx.expect(product.id).toBe(1);
    ctx.log(`This check is skipped, but if enabled it would verify ${product.title}`);
  },
);
