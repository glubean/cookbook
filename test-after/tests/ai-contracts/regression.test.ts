/**
 * AI Regression Testing — golden dataset validation.
 *
 * Loads test cases from data/ai-golden/ and runs each through the LLM.
 * When you change your prompt or switch models, this catches regressions.
 *
 * Add your own cases:
 *   data/ai-golden/my-case.local.json    (gitignored)
 *   { "label": "sarcasm", "input": "Oh great, another meeting", "expectedSentiment": "negative" }
 *
 * Run:
 *   npx glubean run tests/ai-contracts/regression.test.ts
 */
import { fromDir, test } from "@glubean/sdk";
import { z } from "zod";
import type { GoldenCase } from "../../types/ai-contracts.ts";
import { ai } from "../../config/ai.ts";

// ---------------------------------------------------------------------------
// 1. Load golden dataset — each JSON file becomes one test case
// ---------------------------------------------------------------------------

const goldenCases = await fromDir<GoldenCase>("data/ai-golden/");

const SentimentSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral"]),
  confidence: z.number().min(0).max(1),
});

// ---------------------------------------------------------------------------
// 2. Run each golden case — $label becomes the test ID suffix
// ---------------------------------------------------------------------------

export const sentimentRegression = test.each(goldenCases)(
  {
    id: "ai-golden-$label",
    name: "golden: $label",
    tags: ["ai", "regression", "provider:openai"],
  },
  async (ctx, { label: _label, input, expectedSentiment }) => {
    const { object } = await ai.generate(
      SentimentSchema,
      `Classify this text as exactly one of positive, negative, or neutral.

Use neutral when the text only states factual delivery, contents, or functionality without praise or complaint.

Text: "${input}"`,
    );

    ctx.expect(object.sentiment).toBe(expectedSentiment);
    ctx.expect(object.confidence).toBeGreaterThan(0.5);

    ctx.log(`"${input.slice(0, 60)}${input.length > 60 ? "..." : ""}" → ${object.sentiment} (${object.confidence})`);
  },
);
