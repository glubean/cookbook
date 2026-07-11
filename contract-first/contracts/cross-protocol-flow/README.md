# Cross-Protocol Flow

This example shows the intended shape for a single `workflow()` that
composes first-party protocol adapters:

1. HTTP creates an order.
2. gRPC captures the payment using the HTTP step output.
3. GraphQL reads the audit view using the gRPC step output.

The files use `.ts.example` — intentionally not type-checked or executed
by the default cookbook test scripts — for two reasons:

1. **Plugin deps**: the base contract-first cookbook ships only HTTP. To
   actually wire `contract.grpc.with(...)` / `contract.graphql.with(...)`
   you need `@glubean/grpc`, `@glubean/graphql`, plus gRPC peer deps
   (`@grpc/grpc-js`, `@grpc/proto-loader`).
2. **Backends**: the flow needs live HTTP / gRPC / GraphQL services;
   `defineGrpcCase` / `defineGraphqlCase` ship in the published
   `@glubean/grpc` / `@glubean/graphql` packages (0.10.3+).

To run this pattern in a real project:

```bash
pnpm add @glubean/grpc @glubean/graphql @grpc/grpc-js @grpc/proto-loader
mv glubean.setup.ts.example glubean.setup.ts
mv checkout.flow.ts.example checkout.flow.ts
# then plug `httpClient`, `grpcClient`, `graphqlClient` into the
# scoped instances at the top of the flow file.
```

Files:

| File | Purpose |
|---|---|
| `glubean.setup.ts.example` | Installs the gRPC and GraphQL plugin manifests |
| `checkout.flow.ts.example` | HTTP → gRPC → GraphQL workflow composition |

The workflow uses each protocol's `defineXCase<Needs>(...)` factory so the
case `needs` schema and the action input (`request`/`variables`) stay
type-correlated — typos in the input destructuring become compile
errors, not runtime errors.
