import { test, configure } from "@glubean/sdk";
import { browser } from "@glubean/browser";
import type {
  BrowserAction,
  BrowserEvent,
  BrowserTestContext,
  InstrumentedPage,
} from "@glubean/browser";
import type { TestContext } from "@glubean/sdk";

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
        headless: true,
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
    const pg = await chrome.newPage(toBrowserContext(ctx));
    try {
      await use(pg);
    } finally {
      await pg.close();
    }
  },
});

function toBrowserContext(ctx: TestContext): BrowserTestContext {
  const runtime = ctx as TestContext & {
    event?: (ev: BrowserEvent) => void;
    log?: (message: string, data?: unknown) => void;
    warn?: (condition: boolean, message: string) => void;
    saveArtifact?: (
      name: string,
      content: string | Uint8Array,
      options?: { type?: string; mimeType?: string },
    ) => Promise<string>;
    artifactDir?: string;
  };
  const log = (message: string, data?: unknown) => {
    if (typeof runtime.log === "function") {
      runtime.log(message, data);
      return;
    }
    if (data === undefined) {
      console.info(message);
      return;
    }
    console.info(message, data);
  };

  return {
    ...ctx,
    action(action: BrowserAction) {
      if (typeof runtime.action === "function") {
        runtime.action(action);
        return;
      }
      log(`[browser:action] ${action.category} ${action.target}`);
    },
    event(ev) {
      if (typeof runtime.event === "function") {
        runtime.event(ev);
        return;
      }
      log(`[browser:event] ${ev.type}`, ev.data);
    },
    metric(name, value, options) {
      if (typeof runtime.metric === "function") {
        runtime.metric(name, value, options);
        return;
      }
      log(`[browser:metric] ${name}=${value}`, options);
    },
    log(message, data) {
      log(message, data);
    },
    warn(condition, message) {
      if (typeof runtime.warn === "function") {
        runtime.warn(condition, message);
        return;
      }
      if (!condition) {
        log(`[browser:warn] ${message}`);
      }
    },
    trace(request) {
      ctx.trace({
        protocol: "browser",
        target: `${request.method} ${request.url}`,
        status: request.status,
        durationMs: request.duration,
        ok: request.status < 400,
        name: request.name,
        method: request.method,
        url: request.url,
        duration: request.duration,
      });
    },
    saveArtifact:
      typeof runtime.saveArtifact === "function"
        ? (name, content, options) => runtime.saveArtifact!(name, content, options)
        : undefined,
    artifactDir: runtime.artifactDir,
  };
}
