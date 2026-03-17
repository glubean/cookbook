/**
 * DummyJSON data loading with fromYaml().
 *
 * Demonstrates:
 *   - loading an array from a YAML file
 *   - using the `pick` option for nested YAML
 *   - turning file data into test.each() cases
 *
 * Run:
 *   npx glubean run explore/dummyjson/yaml.test.ts
 */
import { fromYaml, test } from "@glubean/sdk";

const API = "https://dummyjson.com";

const cases = await fromYaml<{
  id: number;
  label: string;
  minPrice: number;
  category: string;
}>("./data/dummyjson/catalog.yaml", {
  pick: "testCases",
});

export const yamlCases = test.each(cases)(
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
