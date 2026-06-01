/**
 * Glubean plugin installation entry point.
 *
 * Runs once per process on `glubean run` / `glubean contracts` / MCP /
 * VSCode scan — wherever a Glubean tool needs plugin-registered matchers
 * and protocol adapters to be available before test files or `.contract.ts`
 * modules are imported.
 */

import { installPlugin } from "@glubean/sdk";
import graphqlPlugin from "@glubean/graphql";
import grpcPlugin from "@glubean/grpc";

await installPlugin(graphqlPlugin, grpcPlugin);

// Optional mock layer for third-party dependencies — an escape hatch for
// drafting tests while a dependency is unreachable. See explore/mocking/.
// OFF unless GLUBEAN_MOCK is set, so real runs are never affected. Scoped +
// onUnhandledRequest:"bypass" → only the mocked hosts are intercepted.
if (process.env["GLUBEAN_MOCK"]) {
  const { mockServer } = await import("./config/mocks.ts");
  mockServer.listen({ onUnhandledRequest: "bypass" });
}
