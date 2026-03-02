/**
 * LLM-as-Judge — use a strong model to evaluate a weaker model's output.
 *
 * Pattern: generate with a cheap model, then judge with a stronger one.
 * Useful for evaluating free-form text quality, not just schema compliance.
 *
 * Requires OPENAI_API_KEY in .env.secrets.
 *
 * Run:
 *   glubean run explore/ai-contracts/judge.test.ts
 */
import { test } from "@glubean/sdk";
import { z } from "zod";
import { ai } from "../../config/ai.ts";

const SummarySchema = z.object({
  summary: z.string(),
});

const JudgeSchema = z.object({
  score: z.number().min(1).max(5),
  reason: z.string(),
});

// ---------------------------------------------------------------------------
// 1. Generate with cheap model, judge with strong model
// ---------------------------------------------------------------------------

export const judgedSummary = test(
  { id: "ai-judge-summary", name: "LLM-as-judge: summary quality", tags: ["ai"] },
  async ({ expect, log }) => {
    const article = `
The European Space Agency's Euclid telescope has completed its first survey
of the deep universe, mapping over 300 million galaxies in unprecedented
detail. The data, released today, covers roughly one-third of the
extragalactic sky and includes precise measurements of galaxy shapes and
distances. Scientists expect the dataset to significantly advance
understanding of dark matter distribution and the accelerating expansion
of the universe. The mission, launched in July 2023, is planned to
continue observations for at least six years.`.trim();

    // Step 1: cheap model generates
    const { object: generated } = await ai.generate(
      SummarySchema,
      `Summarize this article in one sentence:\n\n${article}`,
      "gpt-4o-mini",
    );

    log(`Summary: ${generated.summary}`);

    // Step 2: strong model judges
    const { object: evaluation } = await ai.generate(
      JudgeSchema,
      `Rate this summary on a scale of 1-5 for accuracy and completeness.

Original article:
${article}

Summary to evaluate:
${generated.summary}

Score 1 = completely wrong, 5 = perfect. Be strict.`,
      "gpt-4o",
    );

    expect(evaluation.score).toBeGreaterThanOrEqual(3);

    log(`Score: ${evaluation.score}/5`);
    log(`Reason: ${evaluation.reason}`);
  },
);

// ---------------------------------------------------------------------------
// 2. Judge factual correctness with known ground truth
// ---------------------------------------------------------------------------

export const judgedExtraction = test(
  { id: "ai-judge-facts", name: "LLM-as-judge: factual accuracy", tags: ["ai"] },
  async ({ expect, log }) => {
    const input = `
Order #12345 was placed on 2024-01-15 by customer Alice Johnson.
It contains 3 items totaling $247.50, shipped to 123 Main St, Portland, OR.
Payment was made via Visa ending in 4242.`.trim();

    const ExtractionSchema = z.object({
      orderId: z.string(),
      date: z.string(),
      customerName: z.string(),
      totalAmount: z.number(),
      itemCount: z.number(),
    });

    // Generate extraction
    const { object: extracted } = await ai.generate(
      ExtractionSchema,
      `Extract order details from this text:\n\n${input}`,
      "gpt-4o-mini",
    );

    log(`Extracted: ${JSON.stringify(extracted)}`);

    // Judge against ground truth
    const { object: evaluation } = await ai.generate(
      JudgeSchema,
      `Verify if this extracted data is factually correct given the source text.

Source text:
${input}

Extracted data:
${JSON.stringify(extracted, null, 2)}

Score 1 = major errors, 5 = all fields correct. Check every field.`,
      "gpt-4o",
    );

    expect(evaluation.score).toBeGreaterThanOrEqual(4);

    log(`Score: ${evaluation.score}/5`);
    log(`Reason: ${evaluation.reason}`);
  },
);
