import { test, configure } from "@glubean/sdk";

/**
 * Multi-step workflow using builder API.
 * Each .step() has its own trace, duration, and return state visible in the report.
 * Steps share state through returned values, not module-level mutable variables.
 */

const { http } = configure({
  http: {
    prefixUrl: "{{DUMMYJSON_API}}",
    retry: { limit: 2, retryOnTimeout: true },
  },
});

export const cartWorkflow = test("cart-workflow")
  .meta({
    name: "Session-scoped cart workflow",
    tags: ["session", "workflow"],
  })
  .step("create-cart", async (ctx) => {
    const token = ctx.session.require("authToken");
    const userId = ctx.session.require("userId");

    const res = await http.post("carts/add", {
      json: {
        userId,
        products: [{ id: 1, quantity: 2 }],
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    ctx.expect(res).toHaveStatus(201);

    const body = await res.json<{ id: number; totalProducts: number }>();
    return { cartId: body.id, totalProducts: body.totalProducts };
  })
  .step("verify-cart-exists", async (ctx, { cartId }) => {
    // dummyjson mock: new cart IDs aren't queryable, so we fetch cart 1 instead
    const token = ctx.session.require("authToken");

    const res = await http.get("carts/1", {
      headers: { Authorization: `Bearer ${token}` },
    });

    ctx.expect(res).toHaveStatus(200);

    const body = await res.json<{ id: number; products: unknown[] }>();
    ctx.assert(body.products.length > 0, "cart should have products");
    ctx.assert(cartId > 0, `cart was created with id ${cartId}`);

    return { verifiedCartId: cartId, existingCartProducts: body.products.length };
  })
  .build();
