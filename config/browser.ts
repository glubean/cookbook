import { test, configure } from "@glubean/sdk";
import { browser } from "@glubean/browser";
import type { InstrumentedPage } from "@glubean/browser";

/**
 * Shared browser configuration for cookbook patterns.
 *
 * Launches a local Chrome instance with auto-tracing enabled.
 * Every test gets its own page via `browserTest` — no shared state.
 */
export const { chrome } = configure({
  plugins: {
    chrome: browser({
      launch: true,
      launchOptions: {
        headless: false
      },
    }),
  },
});

/**
 * Base test with a per-test `page` fixture.
 *
 * Usage:
 *   import { browserTest } from "../../config/browser.ts";
 *
 *   export const myTest = browserTest("my-test", async ({ page }) => {
 *     await page.goto("https://example.com");
 *     await page.expectText("h1", "Example Domain");
 *   });
 *
 * The page is automatically closed after the test, even on failure.
 * Screenshots are captured on failure by default.
 */
export const browserTest = test.extend({
  // Plugin fixtures need an explicit `use` type annotation so TypeScript
  // can infer the fixture value (here `InstrumentedPage`) for test callbacks.
  page: async (ctx, use: (instance: InstrumentedPage) => Promise<void>) => {
    const pg = await chrome.newPage(ctx);
    try {
      await use(pg);
    } finally {
      await pg.close();
    }
  },
});
