# Tests

The cookbook's worked examples — curated, stable tests you can copy from.
`glubean run` runs this directory by default, and these are what CI runs on
every commit.

Each subdirectory is one topic:

| Dir | Shows |
|---|---|
| `dummyjson/` | Core HTTP patterns: status/error handling, pagination, retry, polling, search, CSV/YAML, schema validation |
| `github/` | Public API smoke + token-gated advanced calls |
| `graphql/` | Queries + mutations via `@glubean/graphql` |
| `grpc/` | Unary RPC via `@glubean/grpc` |
| `browser/` | Browser-driven flows via `@glubean/browser` |
| `sse/`, `websocket/` | Streaming + socket patterns |
| `auth-plugin/`, `session-scope/` | Auth + session lifecycle |
| `mocking/` | Offline drafting with `GLUBEAN_MOCK=1` |
| `ai-contracts/`, `stripe/` | LLM-backed assertions + webhook capture (need secrets) |

Each topic is a `suite` in [`../glubean.yaml`](../glubean.yaml); run them through
the profiles declared there:

```bash
glubean run --profile public                     # all no-secret suites
glubean run --profile public --suite dummyjson   # narrow to one topic
glubean run --profile smoke                      # fast smoke-tagged pass
glubean run --profile secrets                    # suites that need real creds
```

Need a scratchpad for work-in-progress? That's what [`../explore/`](../explore/)
is for — draft unstable tests there, then move the keepers here.
