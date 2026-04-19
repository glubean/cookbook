/**
 * DummyJSON schema validation pattern.
 *
 * Demonstrates ctx.validate() with Zod:
 *   - validate the response shape
 *   - keep semantic assertions separate from schema assertions
 *
 * Run:
 *   npx glubean run explore/dummyjson/validate.test.ts
 */
import { test } from "@glubean/sdk";
import { z } from "zod";
import { dummyApi } from "../../config/dummyjson-api.ts";

const ProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
  stock: z.number(),
  category: z.string(),
});

export const validateProductShape = test(
  {
    id: "dj-validate-product",
    name: "Schema validation with Zod",
    tags: ["smoke", "validate"],
  },
  async (ctx) => {
    const body = await dummyApi.get("products/1").json();

    const product = ctx.validate(body, ProductSchema, "product response");

    ctx.expect(product.id).toBe(1);
    ctx.expect(product.price).toBeGreaterThan(0);
    ctx.expect(product.stock).toBeGreaterThanOrEqual(0);

    ctx.log(`Validated ${product.title} in category ${product.category}`);
  },
);
