/**
 * Browser — data extraction from rendered pages.
 * https://books.toscrape.com
 *
 * Pattern: goto(), expectVisible(), evaluate(), log()
 *
 * Use `evaluate()` to run JS in the page context and extract
 * structured data. Useful for scraping, price monitoring,
 * or verifying rendered content that isn't in the DOM statically.
 *
 * Run:
 *   glubean run explore/browser/scrape.test.ts
 */
import { browserTest } from "../../config/browser.ts";

const BASE = "https://books.toscrape.com";

// ---------------------------------------------------------------------------
// 1. Extract book titles and prices from the catalogue
// ---------------------------------------------------------------------------

export const extractBooks = browserTest(
  { id: "browser-scrape-books", name: "extract book catalogue", tags: ["smoke"] },
  async ({ page, expect, log }) => {
    await page.goto(BASE);
    await page.expectVisible(".product_pod");

    const books = await page.evaluate(() =>
      [...document.querySelectorAll(".product_pod")].map((pod) => ({
        title: pod.querySelector("h3 a")?.getAttribute("title") ?? "",
        price: pod.querySelector(".price_color")?.textContent?.trim() ?? "",
        inStock: !!pod.querySelector(".instock"),
      })),
    );

    expect(books.length).toBeGreaterThan(0);

    log(`Found ${books.length} books on page 1:`);
    for (const b of books.slice(0, 5)) {
      log(`  ${b.price} — ${b.title}${b.inStock ? "" : " (out of stock)"}`);
    }
  },
);

// ---------------------------------------------------------------------------
// 2. Navigate to a category and count results
// ---------------------------------------------------------------------------

export const categoryCount = browserTest(
  { id: "browser-scrape-category", name: "category result count", tags: ["smoke"] },
  async ({ page, expect, log }) => {
    await page.goto(`${BASE}/catalogue/category/books/science_22/index.html`);
    await page.expectVisible(".product_pod");

    const heading = await page.textContent("h1");
    const count = await page.evaluate(
      () => document.querySelectorAll(".product_pod").length,
    );

    expect(count).toBeGreaterThan(0);
    log(`${heading}: ${count} books`);
  },
);
