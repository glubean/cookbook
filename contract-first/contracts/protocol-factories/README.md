# Protocol Case Factories

This folder keeps non-HTTP contract-first fixtures for the protocol-specific
`defineXCase<Needs>` factories.

- `graphql.contract.ts.example` shows `defineGraphqlCase<Needs>` locking a
  case's `needs` schema to function-valued `variables`.
- gRPC uses the same pattern with `defineGrpcCase<Needs>` and function-valued
  `request` / `metadata`.

