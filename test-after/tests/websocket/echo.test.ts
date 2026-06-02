/**
 * WebSocket — echo server and multi-message patterns.
 * Uses `ws` library for Node 18/20 compatibility.
 *
 * Echo server: wss://echo.websocket.org (free, hosted by Ably)
 * Note: this server sends a welcome message on connect, which we skip.
 *
 * Run:
 *   npx glubean run tests/websocket
 */
import { test } from "@glubean/sdk";
import WebSocket from "ws";

// ---------------------------------------------------------------------------
// Helper: open a WebSocket, wait for connection, skip welcome message
// ---------------------------------------------------------------------------

function connect(url: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.once("error", reject);
    ws.once("open", () => {
      // echo.websocket.org sends a welcome message on connect — skip it
      ws.once("message", () => resolve(ws));
    });
  });
}

// ---------------------------------------------------------------------------
// 1. Send a message, receive the echo
// ---------------------------------------------------------------------------

export const echo = test(
  { id: "ws-echo", name: "WebSocket echo", tags: ["smoke", "ws"] },
  async ({ expect, log }) => {
    const ws = await connect("wss://echo.websocket.org");

    try {
      const reply = new Promise<string>((resolve) => {
        ws.once("message", (data) => resolve(data.toString()));
      });

      ws.send("hello glubean");
      const response = await reply;

      expect(response).toBe("hello glubean");
      log(`Sent: "hello glubean" → Received: "${response}"`);
    } finally {
      ws.close();
    }
  },
);

// ---------------------------------------------------------------------------
// 2. Send N messages, verify all N echoes in order
// ---------------------------------------------------------------------------

export const multiMessage = test(
  { id: "ws-multi", name: "WebSocket multi-message ordering", tags: ["ws"] },
  async ({ expect, log }) => {
    const ws = await connect("wss://echo.websocket.org");

    try {
      const messages = ["first", "second", "third"];
      const replies: string[] = [];

      const allReceived = new Promise<void>((resolve) => {
        ws.on("message", (data) => {
          replies.push(data.toString());
          if (replies.length === messages.length) resolve();
        });
      });

      for (const msg of messages) {
        ws.send(msg);
      }

      await allReceived;

      expect(replies).toEqual(messages);
      log(`Sent ${messages.length} messages, all echoed in order`);
      for (let i = 0; i < messages.length; i++) {
        log(`  [${i}] "${messages[i]}" → "${replies[i]}"`);
      }
    } finally {
      ws.close();
    }
  },
);

// ---------------------------------------------------------------------------
// 3. Send and receive JSON payloads
// ---------------------------------------------------------------------------

export const jsonPayload = test(
  { id: "ws-json", name: "WebSocket JSON round-trip", tags: ["ws"] },
  async ({ expect, log }) => {
    const ws = await connect("wss://echo.websocket.org");

    try {
      const reply = new Promise<string>((resolve) => {
        ws.once("message", (data) => resolve(data.toString()));
      });

      const payload = { type: "ping", ts: Date.now() };
      ws.send(JSON.stringify(payload));

      const parsed = JSON.parse(await reply);
      expect(parsed.type).toBe("ping");
      expect(parsed.ts).toBe(payload.ts);
      log(`JSON round-trip OK: ${JSON.stringify(parsed)}`);
    } finally {
      ws.close();
    }
  },
);
