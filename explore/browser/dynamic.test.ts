/**
 * Browser — dynamic content and element state assertions.
 * https://the-internet.herokuapp.com
 *
 * Pattern: expectVisible(), expectHidden(), expectCount(),
 *          expectAttribute(), select(), click()
 *
 * These patterns cover SPAs and pages with dynamic DOM updates:
 * dropdowns, checkboxes, elements that appear/disappear.
 *
 * Run:
 *   glubean run explore/browser/dynamic.test.ts
 */
import { browserTest } from "../../config/browser.ts";

const BASE = "https://the-internet.herokuapp.com";

// ---------------------------------------------------------------------------
// 1. Dropdown — select an option and verify
// ---------------------------------------------------------------------------

export const dropdown = browserTest(
  { id: "browser-dynamic-dropdown", name: "dropdown selection", tags: ["smoke"] },
  async ({ page }) => {
    await page.goto(`${BASE}/dropdown`);
    await page.select("#dropdown", "2");
    await page.expectAttribute("#dropdown", "value", "2");
  },
);

// ---------------------------------------------------------------------------
// 2. Checkboxes — toggle and verify state
// ---------------------------------------------------------------------------

export const checkboxes = browserTest(
  { id: "browser-dynamic-checkboxes", name: "checkbox toggle", tags: ["smoke"] },
  async ({ page, expect }) => {
    await page.goto(`${BASE}/checkboxes`);

    // Checkbox 1 starts unchecked, checkbox 2 starts checked
    const before = await page.evaluate(() =>
      [...document.querySelectorAll("#checkboxes input")].map(
        (el) => (el as HTMLInputElement).checked,
      ),
    );
    expect(before[0]).toBe(false);
    expect(before[1]).toBe(true);

    // Toggle checkbox 1
    await page.click("#checkboxes input:first-child");

    const after = await page.evaluate(() =>
      (document.querySelector("#checkboxes input:first-child") as HTMLInputElement)
        .checked,
    );
    expect(after).toBe(true);
  },
);

// ---------------------------------------------------------------------------
// 3. Dynamic loading — wait for element to appear
// ---------------------------------------------------------------------------

export const dynamicLoading = browserTest(
  { id: "browser-dynamic-loading", name: "wait for lazy content", tags: ["smoke"] },
  async ({ page }) => {
    await page.goto(`${BASE}/dynamic_loading/1`);

    // Element exists in DOM but is hidden
    await page.expectHidden("#finish");

    // Click start and wait for the loading to complete
    await page.click("#start button");
    await page.expectVisible("#finish", { timeout: 10_000 });
    await page.expectText("#finish", "Hello World!");
  },
);

// ---------------------------------------------------------------------------
// 4. Add/remove elements — verify count changes
// ---------------------------------------------------------------------------

export const addRemove = browserTest(
  { id: "browser-dynamic-add-remove", name: "add/remove elements" },
  async ({ page }) => {
    await page.goto(`${BASE}/add_remove_elements/`);

    // Add 3 elements
    for (let i = 0; i < 3; i++) {
      await page.click("button[onclick='addElement()']");
    }
    await page.expectCount("#elements button", 3);

    // Remove 1
    await page.click("#elements button");
    await page.expectCount("#elements button", 2);
  },
);
