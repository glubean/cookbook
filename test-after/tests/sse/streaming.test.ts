/**
 * SSE (Server-Sent Events) — streaming response parsing.
 *
 * Each test starts a tiny local SSE server so the recipe is deterministic
 * and does not depend on an external demo service.
 * Uses `eventsource-parser` for clean async iteration over SSE streams.
 * This pattern works for any SSE API (OpenAI, Anthropic, Gemini, etc.)
 *
 * Run:
 *   npx glubean run tests/sse
 */
import { test } from "@glubean/sdk";
import { EventSourceParserStream } from "eventsource-parser/stream";
import { createServer, type Server } from "node:http";

async function startSseServer(): Promise<{ url: string; close: () => Promise<void> }> {
  const server = createServer((req, res) => {
    if (req.url !== "/events") {
      res.writeHead(404).end();
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    for (const event of [
      { index: 1, type: "started" },
      { index: 2, type: "progress" },
      { index: 3, type: "complete" },
    ]) {
      res.write("event: message\n");
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
    res.end();
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("SSE server did not bind to a TCP port");
  }

  return {
    url: `http://127.0.0.1:${address.port}/events`,
    close: () => closeServer(server),
  };
}

async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}

// ---------------------------------------------------------------------------
// 1. Connect to an SSE stream and collect events
// ---------------------------------------------------------------------------

export const collectEvents = test(
  { id: "sse-collect", name: "collect SSE events", tags: ["smoke", "sse"] },
  async ({ assert, expect, log }) => {
    const server = await startSseServer();
    try {
      const res = await fetch(server.url, {
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
    } finally {
      await server.close();
    }
  },
);

// ---------------------------------------------------------------------------
// 2. Parse structured SSE data (JSON payloads)
// ---------------------------------------------------------------------------

export const parseJsonEvents = test(
  { id: "sse-parse-json", name: "parse JSON SSE payloads", tags: ["sse"] },
  async ({ assert, expect, log }) => {
    const server = await startSseServer();
    try {
      const res = await fetch(server.url, {
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
    } finally {
      await server.close();
    }
  },
);
