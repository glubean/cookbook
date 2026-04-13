# Contract-First — DummyJSON

Contract-first examples using the free [DummyJSON API](https://dummyjson.com). No token required.

## What you'll learn

- `contract.http()` — declare endpoint behavior with named cases
- `contract.flow()` — verify cross-endpoint workflows
- Zod schema validation with `expect.schema`
- Custom assertions with `verify`
- Feature grouping and description conventions

## Files

| File | Pattern |
|------|---------|
| `products.contract.ts` | Single-endpoint contracts with success, error, and pagination cases |
| `auth.contract.ts` | Login contract with valid/invalid credential cases |
| `flow.contract.ts` | Login → get profile flow with state passing |

## Run

```bash
# Run all contracts
npx glubean run contracts/dummyjson/

# View as human-readable spec
npx glubean contracts --dir .

# View as JSON
npx glubean contracts --dir . --format json
```

## How it differs from explore/

| | explore/ (test-after) | contracts/ (contract-first) |
|---|---|---|
| API state | Already exists | May not exist yet |
| Source of truth | Live API responses | Your intent |
| Response shape | Inferred from real data | Declared upfront in schemas |
| Organization | By pattern | By feature |
