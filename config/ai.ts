import { configure, definePlugin } from "@glubean/sdk";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { ZodType } from "zod";

/**
 * Pre-configured AI client using Vercel AI SDK + OpenAI.
 * Requires OPENAI_API_KEY in secrets (.env.secrets).
 *
 * Usage:
 *   const { object, usage } = await ai.generate(MySchema, "prompt text");
 *   const { object } = await ai.generate(MySchema, "prompt", "gpt-4o");
 */
export const { ai } = configure({
  secrets: { key: "OPENAI_API_KEY" },
  plugins: {
    ai: definePlugin((rt) => {
      const openai = createOpenAI({
        apiKey: rt.requireSecret("OPENAI_API_KEY"),
      });
      return {
        generate: <T>(
          schema: ZodType<T>,
          prompt: string,
          model = "gpt-4o-mini",
        ) => generateObject({ model: openai(model), schema, prompt }),
      };
    }),
  },
});
