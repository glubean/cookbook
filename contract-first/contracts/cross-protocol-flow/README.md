# Cross-Protocol Flow

This example shows the intended shape for a single `contract.flow()` that
composes first-party protocol adapters:

1. HTTP creates an order.
2. gRPC captures the payment using the HTTP step output.
3. GraphQL reads the audit view using the gRPC step output.

The files use `.ts.example` because the base contract-first cookbook keeps
only HTTP dependencies installed by default. To run this pattern in a real
project, install `@glubean/grpc`, `@glubean/graphql`, and gRPC peer
dependencies, then copy the setup and flow into normal `.ts` files.

Files:

| File | Purpose |
|---|---|
| `glubean.setup.ts.example` | Installs the gRPC and GraphQL plugin manifests |
| `checkout.flow.ts.example` | HTTP -> gRPC -> GraphQL flow composition |
