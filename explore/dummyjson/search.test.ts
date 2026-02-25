/**
 * DummyJSON — product search with test.pick + fromDir.merge.
 * https://dummyjson.com
 *
 * This recipe demonstrates the "git-safe" data pattern:
 *   - data/search-queries/shared.json   ← committed (team baseline)
 *   - data/search-queries/*.local.json  ← gitignored (your own queries)
 *
 * To add your own search queries, create a file like:
 *   data/search-queries/mine.local.json
 *   { "gaming-laptop": { "q": "gaming laptop", "minResults": 1 } }
 *
 * Your local file won't affect git. Shared files load first,
 * then local files — local keys override shared ones.
 *
 * Run all examples:
 *   glubean run explore/dummyjson/search.test.ts --pick all
 *
 * Run a specific example:
 *   glubean run explore/dummyjson/search.test.ts --pick by-name
 */
import { fromDir, test } from "@glubean/sdk";

const API = "https://dummyjson.com";

const queries = await fromDir.merge<{ q: string; minResults: number }>(
  "./data/search-queries/",
);

export const searchProducts = test.pick(queries)(
  "dj-search-$_pick",
  async (ctx, { q, minResults }) => {
    const result = await ctx.http
      .get(`${API}/products/search`, { searchParams: { q } })
      .json<{ products: { id: number; title: string }[]; total: number }>();

    ctx.expect(result.total).toBeGreaterThanOrEqual(minResults);

    ctx.log(`"${q}" → ${result.total} results`);
    for (const p of result.products.slice(0, 3)) {
      ctx.log(`  [${p.id}] ${p.title}`);
    }
  },
);
