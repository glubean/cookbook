/**
 * Browser — login flow with form fill + navigation.
 * https://the-internet.herokuapp.com/login
 *
 * Pattern: type(), clickAndNavigate(), expectURL(), expectText()
 *
 * This is the most common browser test pattern: fill a form,
 * submit, and assert you land on the right page.
 *
 * Run:
 *   glubean run explore/browser/login.test.ts
 */
import { browserTest } from "../../config/browser.ts";

const BASE = "https://the-internet.herokuapp.com";

// ---------------------------------------------------------------------------
// 1. Successful login
// ---------------------------------------------------------------------------

export const loginSuccess = browserTest(
  { id: "browser-login-success", name: "login success", tags: ["smoke"] },
  async ({ page }) => {
    await page.goto(`${BASE}/login`);

    await page.type("#username", "tomsmith");
    await page.type("#password", "SuperSecretPassword!");
    await page.clickAndNavigate('button[type="submit"]');

    await page.expectURL("/secure");
    await page.expectText("#flash", "You logged into a secure area!");
  },
);

// ---------------------------------------------------------------------------
// 2. Failed login — wrong credentials
// ---------------------------------------------------------------------------

export const loginFailure = browserTest(
  { id: "browser-login-failure", name: "login failure", tags: ["smoke"] },
  async ({ page }) => {
    await page.goto(`${BASE}/login`);

    await page.type("#username", "wrong");
    await page.type("#password", "wrong");
    await page.click('button[type="submit"]');

    // Page stays on /login, error flash shown
    await page.expectURL("/login");
    await page.expectText("#flash", "Your username is invalid!");
  },
);
