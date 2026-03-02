/**
 * AI Consistency Testing — stability across multiple runs.
 *
 * Runs the same prompt N times and checks that outputs are stable.
 * Useful for detecting non-determinism, especially on ambiguous inputs.
 *
 * Requires OPENAI_API_KEY in .env.secrets.
 *
 * Run:
 *   glubean run explore/ai-contracts/consistency.test.ts
 */
import { test } from "@glubean/sdk";
import { z } from "zod";
import { ai } from "../../config/ai.ts";

const CategorySchema = z.object({
  category: z.enum(["bug", "feature", "question", "docs"]),
  priority: z.enum(["low", "medium", "high"]),
});

// ---------------------------------------------------------------------------
// 1. Clear-cut input — should be 100% consistent
// ---------------------------------------------------------------------------

export const clearCaseConsistency = test(
  { id: "ai-consistent-clear", name: "consistency: clear case", tags: ["ai"] },
  async ({ expect, log }) => {
    const prompt =
      'Classify this GitHub issue: "App crashes on login with null pointer exception in auth.ts line 42"';

    const results = await Promise.all(
      Array.from({ length: 5 }, () => ai.generate(CategorySchema, prompt)),
    );

    const categories = results.map((r) => r.object.category);
    const allBug = categories.every((c) => c === "bug");

    expect(allBug).toBe(true);

    log(`Results: ${categories.join(", ")} — ${allBug ? "stable ✓" : "unstable ✗"}`);
  },
);

// ---------------------------------------------------------------------------
// 2. Ambiguous input — allow some variance, check majority
// ---------------------------------------------------------------------------

export const ambiguousCaseConsistency = test(
  { id: "ai-consistent-ambiguous", name: "consistency: ambiguous case", tags: ["ai"] },
  async ({ expect, log }) => {
    const prompt =
      'Classify this GitHub issue: "Would be nice to have dark mode, the current light theme hurts my eyes"';

    const N = 5;
    const results = await Promise.all(
      Array.from({ length: N }, () => ai.generate(CategorySchema, prompt)),
    );

    const categories = results.map((r) => r.object.category);
    const counts = new Map<string, number>();
    for (const c of categories) counts.set(c, (counts.get(c) ?? 0) + 1);

    const [topCategory, topCount] = [...counts.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0];

    // Majority should agree (at least 60%)
    expect(topCount / N).toBeGreaterThanOrEqual(0.6);

    log(
      `Distribution: ${[...counts.entries()].map(([k, v]) => `${k}=${v}`).join(", ")}`,
    );
    log(
      `Majority: ${topCategory} (${topCount}/${N} = ${((topCount / N) * 100).toFixed(0)}%)`,
    );
  },
);
