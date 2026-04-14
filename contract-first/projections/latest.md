# Contract Specification — DummyJSON API

> Generated: 2026-04-14 | 10 cases | 10 active | 0 deferred

This project declares the expected behavior of the [DummyJSON](https://dummyjson.com) API using contract-first testing. Each contract defines what an endpoint should do — the runner validates the live API against these declarations.

## Feature Index

| Feature | Contracts | Cases | Status |
|---------|-----------|-------|--------|
| Authentication | 1 | 3 | 3 active |
| Product Catalog | 2 | 5 | 5 active |
| Product Search | 1 | 2 | 2 active |

## Artifacts

| Output | Generated from | File |
|--------|---------------|------|
| Markdown spec | `glubean contracts` | this file |
| OpenAPI 3.1 | `glubean_openapi` MCP tool | [openapi.json](openapi.json) |

---

## Authentication

Verifies the login flow: valid credentials return a user profile with an access token, while invalid credentials (wrong password or unknown user) are rejected with appropriate error responses.

**POST /auth/login** — User login with username and password

- **success** — Valid credentials return user profile with auth token
- **wrongPassword** — Incorrect password is rejected
- **unknownUser** — Non-existent username is rejected

## Product Catalog

Covers single-product retrieval and paginated listing. Retrieval validates the full product schema on success and confirms 404 on missing IDs. Listing verifies default pagination behavior and custom limit/skip parameters.

**GET /products/:id** — Retrieve a single product by ID

- **found** — Existing product returns full details with schema validation
- **notFound** — Non-existent product ID returns error

**GET /products** — List products with pagination

- **defaultPage** — Default request returns first page with limit 30
- **withLimit** — Custom limit restricts result count
- **withSkip** — Skip parameter offsets results for pagination

## Product Search

Verifies full-text search across the product catalog: known keywords return matching results, nonsense keywords return an empty set.

**GET /products/search** — Full-text search across product catalog

- **matchFound** — Known keyword returns matching products
- **noMatch** — Nonsense keyword returns empty result set
