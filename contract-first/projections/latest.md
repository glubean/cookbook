# Contract Specification

Generated: 2026-04-14 | 19 cases | 10 active | 9 deferred

## Authentication

User login with username and password

- **success** — Valid credentials return user profile with auth token
- **wrongPassword** — Incorrect password is rejected
- **unknownUser** — Non-existent username is rejected

## Product Catalog

Retrieve a single product by ID

- **found** — Existing product returns full details with schema validation
- **notFound** — Non-existent product ID returns error

List products with pagination

- **defaultPage** — Default request returns first page with limit 30
- **withLimit** — Custom limit restricts result count
- **withSkip** — Skip parameter offsets results for pagination

## Product Search

Full-text search across product catalog

- **matchFound** — Known keyword returns matching products
- **noMatch** — Nonsense keyword returns empty result set

## Notification Delivery

Send a notification through any supported channel

- ⊘ **email** — deferred: API not implemented yet
- ⊘ **sms** — deferred: API not implemented yet
- ⊘ **push** — deferred: API not implemented yet
- ⊘ **invalidChannel** — deferred: API not implemented yet

## Notification Tracking

Retrieve notification details including delivery status and channel-specific payload

- ⊘ **delivered** — deferred: API not implemented yet
- ⊘ **failed** — deferred: API not implemented yet
- ⊘ **notFound** — deferred: API not implemented yet

List notifications with pagination, filterable by channel and status

- ⊘ **defaultPage** — deferred: API not implemented yet
- ⊘ **filterByChannel** — deferred: API not implemented yet
