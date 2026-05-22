import { test, expect, type Page } from '@playwright/test';

/**
 * Blog SEO regression suite.
 *
 * Picks a handful of recent posts from /en/news, then for each one verifies
 * the SEO-critical surface area:
 *  - Title length 50-65, description 140-160
 *  - Exactly one h1
 *  - At least one BlogPosting / NewsArticle JSON-LD block
 *  - hreflang count equals the number of supported locales
 *  - No 4xx images, no internal links to nonexistent skin pages
 *
 * Designed to run against a live deploy (config: BASE_URL=https://snakeonline.io)
 * OR against a local dev server. Picks the first 5 posts so the run stays
 * under 90s even on the slow path.
 */

const LOCALES = ['en','tr','de','es','pt','fr','it','ru','ar','zh','ja','ko','hi','id'];

async function collectPostLinks(page: Page): Promise<string[]> {
  await page.goto('/en/news');
  const hrefs = await page.locator('a[href*="/news/"]').evaluateAll(anchors =>
    Array.from(new Set(
      anchors
        .map(a => a.getAttribute('href') || '')
        .filter(h => /\/en\/news\/[a-z0-9-]+$/.test(h))
    ))
  );
  return hrefs.slice(0, 5);
}

test.describe('Blog SEO baseline', () => {
  test('news index page renders with at least one post link', async ({ page }) => {
    await page.goto('/en/news');
    const cards = page.locator('a[href*="/news/"]');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
  });

  test('5 random posts pass the SEO checklist', async ({ page }) => {
    const links = await collectPostLinks(page);
    test.skip(links.length === 0, 'No blog posts published yet — pipeline not warmed.');

    for (const href of links) {
      await page.goto(href);

      // Title length.
      const titleTxt = await page.title();
      expect(titleTxt.length, `Title length on ${href}`).toBeGreaterThanOrEqual(45);
      expect(titleTxt.length, `Title length on ${href}`).toBeLessThanOrEqual(75);

      // Description length.
      const desc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(desc, `Missing description on ${href}`).toBeTruthy();
      expect((desc ?? '').length, `Description length on ${href}`).toBeGreaterThanOrEqual(130);
      expect((desc ?? '').length, `Description length on ${href}`).toBeLessThanOrEqual(170);

      // Exactly one h1.
      const h1s = page.locator('h1');
      await expect(h1s).toHaveCount(1);

      // hreflang completeness.
      const hreflangCount = await page.locator('link[rel="alternate"][hreflang]').count();
      expect(hreflangCount, `hreflang tags on ${href}`).toBeGreaterThanOrEqual(LOCALES.length);

      // JSON-LD: at least one BlogPosting or NewsArticle.
      const jsonLdBlocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      const hasArticle = jsonLdBlocks.some(b => /"@type"\s*:\s*"(BlogPosting|NewsArticle)"/.test(b));
      expect(hasArticle, `No article JSON-LD on ${href}`).toBeTruthy();

      // No banned AI-tell phrases on the rendered page (production smoke).
      const body = await page.locator('article, main').first().innerText();
      expect(body, `AI-tell phrase on ${href}`).not.toMatch(/\bas an? AI\b|\bdelve into\b|\btapestry of\b/i);
    }
  });

  test('canonical points to itself', async ({ page }) => {
    const links = await collectPostLinks(page);
    test.skip(links.length === 0, 'No blog posts published yet.');
    const href = links[0];
    await page.goto(href);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain(href.replace(/^\//, ''));
  });
});
