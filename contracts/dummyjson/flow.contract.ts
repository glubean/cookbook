/**
 * DummyJSON Flow — contract.flow() example.
 *
 * Verifies that login + authenticated request work together.
 * Shows state passing between steps.
 *
 * Run:
 *   npx glubean run contracts/dummyjson/flow.contract.ts
 */
import { contract } from "@glubean/sdk";
import { dummyApi } from "../../config/dummyjson-api.ts";

export const loginThenGetProfile = contract.flow("login-then-profile")
  .http("login", {
    endpoint: "POST /auth/login",
    client: dummyApi,
    body: { username: "emilys", password: "emilyspass" },
    expect: { status: 200 },
  })
  .returns((res) => ({ token: res.token, userId: res.id }))
  .http("get-profile", {
    endpoint: "GET /auth/me",
    client: dummyApi,
    headers: (state) => ({ Authorization: `Bearer ${state.token}` }),
    expect: { status: 200 },
  })
  .build();
