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
 *   glubean run explore/ai-contracts/regression.test.ts
 */
import { fromDir, test } from "@glubean/sdk";
import { z } from "zod";
import { ai } from "../../config/ai.ts";

// ---------------------------------------------------------------------------
// 1. Load golden dataset — each JSON file becomes one test case
// ---------------------------------------------------------------------------

const goldenCases = await fromDir<{
  label: string;
  input: string;
  expectedSentiment: "positive" | "negative" | "neutral";
}>("./data/ai-golden/");

const SentimentSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral"]),
  confidence: z.number().min(0).max(1),
});

// ---------------------------------------------------------------------------
// 2. Run each golden case — $label becomes the test ID suffix
// ---------------------------------------------------------------------------

export const sentimentRegression = test.each(goldenCases)(
  { id: "ai-golden-$label", name: "golden: $label", tags: ["ai", "regression"] },
  async (ctx, { label: _label, input, expectedSentiment }) => {
    const { object } = await ai.generate(
      SentimentSchema,
      `Analyze the sentiment of this text: "${input}"`,
    );

    ctx.expect(object.sentiment).toBe(expectedSentiment);
    ctx.expect(object.confidence).toBeGreaterThan(0.5);

    ctx.log(`"${input.slice(0, 60)}${input.length > 60 ? "..." : ""}" → ${object.sentiment} (${object.confidence})`);
  },
);
