import { contract } from "@glubean/sdk";
import { dummyApi } from "../../config/dummyjson-api.ts";
import { getProfile } from "./profile.contract.ts";

export const profileAuthorizedOverlay = contract.bootstrap(
  getProfile.case("authorized"),
  async (ctx) => {
    const res = await dummyApi.post("auth/login", {
      json: { username: "emilys", password: "emilyspass" },
    });
    const body = await res.json<{ accessToken: string }>();

    ctx.cleanup(async () => {
      ctx.log("[profile-cleanup] would revoke the DummyJSON token here");
    });

    return { token: body.accessToken };
  },
);
