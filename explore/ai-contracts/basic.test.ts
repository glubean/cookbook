/**
 * AI Contract Testing — structured output validation.
 *
 * Uses Vercel AI SDK's generateObject() with Zod schemas to call an LLM
 * and assert the response matches a contract — just like testing any API.
 *
 * Patterns taught:
 *   - Schema-level contract (Zod enforces structure)
 *   - Semantic assertions (values make sense, not just shape)
 *   - Token usage logging
 *
 * Requires OPENAI_API_KEY in .env.secrets.
 *
 * Run:
 *   glubean run explore/ai-contracts/basic.test.ts
 */
import { test } from "@glubean/sdk";
import { z } from "zod";
import { ai } from "../../config/ai.ts";

// ---------------------------------------------------------------------------
// 1. Sentiment analysis — schema + semantic assertion
// ---------------------------------------------------------------------------

const SentimentSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral"]),
  confidence: z.number().min(0).max(1),
  keywords: z.array(z.string()).min(1),
});

export const sentimentCheck = test(
  { id: "ai-sentiment", name: "sentiment analysis contract", tags: ["ai"] },
  async ({ expect, log }) => {
    const { object, usage } = await ai.generate(
      SentimentSchema,
      'Analyze the sentiment: "This product is absolutely fantastic, best purchase ever!"',
    );

    // Structure — Zod guarantees shape, but assert for documentation
    expect(object.sentiment).toBeDefined();
    expect(object.confidence).toBeGreaterThan(0);
    expect(object.keywords.length).toBeGreaterThan(0);

    // Semantics — the real value of the test
    expect(object.sentiment).toBe("positive");
    expect(object.confidence).toBeGreaterThan(0.7);

    log(`Sentiment: ${object.sentiment} (${object.confidence})`);
    log(`Keywords: ${object.keywords.join(", ")}`);
    log(`Tokens: ${usage.totalTokens}`);
  },
);

// ---------------------------------------------------------------------------
// 2. Entity extraction — nested object contract
// ---------------------------------------------------------------------------

const ExtractionSchema = z.object({
  person: z.object({
    name: z.string(),
    role: z.string(),
    company: z.string(),
  }),
  contact: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
});

export const extractionCheck = test(
  { id: "ai-extraction", name: "entity extraction contract", tags: ["ai"] },
  async ({ expect, log }) => {
    const { object } = await ai.generate(
      ExtractionSchema,
      `Extract structured info from this text:
"Hi, I'm Jane Smith, VP of Engineering at Acme Corp. Reach me at jane@acme.com"`,
    );

    expect(object.person.name).toMatch(/jane/i);
    expect(object.person.company).toMatch(/acme/i);
    expect(object.contact.email).toBe("jane@acme.com");

    log(`${object.person.name} — ${object.person.role} @ ${object.person.company}`);
    log(`Contact: ${object.contact.email ?? "n/a"}`);
  },
);
