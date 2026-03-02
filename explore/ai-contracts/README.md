# AI Contract Testing

Test LLM outputs like any other API — structured schemas, golden datasets,
consistency checks, and LLM-as-judge evaluation.

These recipes use [Vercel AI SDK](https://sdk.vercel.ai/) with OpenAI, but the
patterns work with any provider (Anthropic, Google, local models).

## Setup

1. Copy `.env.example` to `.env.secrets`
2. Add your OpenAI key: `OPENAI_API_KEY=sk-...`

## Run

```bash
# Editor — click ▶ next to any test(
# CLI
glubean run explore/ai-contracts
# Deno Task
deno task explore:ai-contracts
```

## Recipes

| Pattern                  | File                    | What it teaches                            |
| ------------------------ | ----------------------- | ------------------------------------------ |
| Schema + semantic assert | `basic.test.ts`         | Zod schema contract, value-level checks    |
| Golden dataset           | `regression.test.ts`    | `test.each` + `fromDir` for prompt changes |
| Consistency (N runs)     | `consistency.test.ts`   | Majority voting, stability thresholds      |
| LLM-as-judge             | `judge.test.ts`         | Strong model evaluates weak model output   |

## Adding golden cases

Drop a JSON file into `data/ai-golden/`:

```json
{ "label": "sarcasm", "input": "Oh great, another Monday", "expectedSentiment": "negative" }
```

Use `*.local.json` for personal cases (gitignored).

See the [main README](../../README.md) for complete instructions.
