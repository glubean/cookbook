/**
 * SSE (Server-Sent Events) — streaming response parsing.
 * https://sse.dev
 *
 * Uses `eventsource-parser` for clean async iteration over SSE streams.
 * This pattern works for any SSE API (OpenAI, Anthropic, Gemini, etc.)
 *
 * Run:
 *   npx glubean run explore/sse
 */
import { test } from "@glubean/sdk";
import { EventSourceParserStream } from "eventsource-parser/stream";

// ---------------------------------------------------------------------------
// 1. Connect to an SSE stream and collect events
// ---------------------------------------------------------------------------

export const collectEvents = test(
  { id: "sse-collect", name: "collect SSE events", tags: ["smoke", "sse"] },
  async ({ assert, expect, log }) => {
    const res = await fetch("https://sse.dev/test", {
      headers: { Accept: "text/event-stream" },
    });

    assert(res.ok, `HTTP ${res.status}`);
    assert(
      res.headers.get("content-type")?.includes("text/event-stream") ?? false,
      "content-type is text/event-stream",
    );

    const stream = res.body!
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventSourceParserStream());

    const events: string[] = [];
    for await (const { data } of stream) {
      events.push(data);
      log(`  ${data}`);
      if (events.length >= 3) break;
    }

    expect(events.length).toBeGreaterThan(0);
    log(`Collected ${events.length} SSE events`);
  },
);

// ---------------------------------------------------------------------------
// 2. Parse structured SSE data (JSON payloads)
// ---------------------------------------------------------------------------

export const parseJsonEvents = test(
  { id: "sse-parse-json", name: "parse JSON SSE payloads", tags: ["sse"] },
  async ({ assert, expect, log }) => {
    const res = await fetch("https://sse.dev/test", {
      headers: { Accept: "text/event-stream" },
    });

    assert(res.ok, `HTTP ${res.status}`);

    const stream = res.body!
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventSourceParserStream());

    const parsed: unknown[] = [];
    for await (const { data } of stream) {
      try {
        parsed.push(JSON.parse(data));
      } catch {
        // non-JSON data line, skip
      }
      if (parsed.length >= 3) break;
    }

    expect(parsed.length).toBeGreaterThan(0);
    log(`Parsed ${parsed.length} JSON events`);
    for (const obj of parsed) {
      log(`  ${JSON.stringify(obj)}`);
    }
  },
);
