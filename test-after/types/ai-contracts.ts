/**
 * Types for AI contract regression test data.
 */

/** Row shape for data/ai-golden/*.json */
export type GoldenCase = {
  label: string;
  input: string;
  expectedSentiment: "positive" | "negative" | "neutral";
};
