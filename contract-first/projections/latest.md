# Contract Specification

Generated: 2026-04-19 | 22 cases | 12 active | 9 deferred | 1 deprecated

## dummyjson: Authentication

User login with username and password

- **success** — Valid credentials return user profile with auth token 🔴
- **wrongPassword** — Incorrect password is rejected
- **unknownUser** — Non-existent username is rejected
- ⊘ **legacyTokenRefresh** — deprecated: replaced by /auth/refresh in API v2

## dummyjson: Product Catalog

Retrieve a single product by ID

- **found** — Existing product returns full details with schema validation
- **notFound** — Non-existent product ID returns error ℹ️

List products with pagination

- **defaultPage** — Default request returns first page with limit 30
- **withLimit** — Custom limit restricts result count
- **withSkip** — Skip parameter offsets results for pagination

## dummyjson: Product Search

Full-text search across product catalog

- **matchFound** — Known keyword returns matching products
- **noMatch** — Nonsense keyword returns empty result set

## dummyjson-auth: Authentication

Return the authenticated user's profile

- **authorized** — Valid bearer token returns the caller's profile 🔴
- **unauthorized** — Missing or invalid token is rejected

## notifications: Notification Tracking

Retrieve notification details including delivery status and channel-specific payload

- ⊘ **delivered** — deferred: API not implemented yet
- ⊘ **failed** — deferred: API not implemented yet
- ⊘ **notFound** — deferred: API not implemented yet

List notifications with pagination, filterable by channel and status

- ⊘ **defaultPage** — deferred: API not implemented yet
- ⊘ **filterByChannel** — deferred: API not implemented yet

## notifications: Notification Delivery

Send a notification through any supported channel

- ⊘ **email** — deferred: API not implemented yet
- ⊘ **sms** — deferred: API not implemented yet
- ⊘ **push** — deferred: API not implemented yet
- ⊘ **invalidChannel** — deferred: API not implemented yet

## Flows

### login-then-profile *(e2e)*

Login with valid credentials, then fetch the profile using the returned token

1. **login#success** (http · POST /auth/login)
   - outputs:
     - state.token ← response.body.accessToken
     - state.userId ← response.body.id
2. **<compute>**
   - reads: state.token
   - writes: authHeader
3. **get-profile#authorized** (http · GET /auth/me)
   - inputs:
     - headers.Authorization ← state.authHeader
