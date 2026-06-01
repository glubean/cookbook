import { configure } from "@glubean/sdk";

export const { http: notificationsApi } = configure({
  http: {
    prefixUrl: "{{NOTIFICATIONS_API}}",
    timeout: 10000,
    retry: { limit: 2, retryOnTimeout: true },
  },
});
