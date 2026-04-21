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
