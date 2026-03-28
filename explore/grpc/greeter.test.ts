/**
 * gRPC — unary RPC with @glubean/grpc.
 *
 * The local gRPC server is managed by session.ts (setup/teardown).
 *
 * Run:
 *   npx glubean run explore/grpc
 */
import { test } from "@glubean/sdk";
import { client } from "./session.ts";

// ---------------------------------------------------------------------------
// 1. Basic unary call
// ---------------------------------------------------------------------------

export const sayHello = test(
  { id: "grpc-hello", name: "gRPC SayHello", tags: ["smoke", "grpc"] },
  async ({ expect, log }) => {
    const res = await client.call<{ message: string }>("SayHello", {
      name: "Glubean",
    });

    expect(res.status.code).toBe(0);
    expect(res.message.message).toBe("Hello, Glubean!");
    log(`Response: ${res.message.message} (${res.duration}ms)`);
  },
);

// ---------------------------------------------------------------------------
// 2. Call with different input
// ---------------------------------------------------------------------------

export const sayHelloEmpty = test(
  { id: "grpc-hello-empty", name: "gRPC SayHello with empty name", tags: ["grpc"] },
  async ({ expect, log }) => {
    const res = await client.call<{ message: string }>("SayHello", { name: "" });

    expect(res.status.code).toBe(0);
    expect(res.message.message).toBe("Hello, !");
    log(`Empty name response: "${res.message.message}" (${res.duration}ms)`);
  },
);
