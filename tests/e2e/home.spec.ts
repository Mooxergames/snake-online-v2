import { test, expect } from '@playwright/test';

test.describe('Home page (EN)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
  });

  test('renders Hero with exactly one h1', async ({ page }) => {
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
    await expect(h1s.first()).toContainText(/legends|arena/i);
  });

  test('shows live-online chip with player count', async ({ page }) => {
    const chip = page.getByText(/online now/i).first();
    await expect(chip).toBeVisible();
  });

  test('primary CTA links to /play', async ({ page }) => {
    const cta = page.getByRole('link', { name: /play free now/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /\/play$/);
  });

  test('Bento section renders with hero tile metric', async ({ page }) => {
    await page.locator('h2', { hasText: /modern arena/i }).scrollIntoViewIfNeeded();
    await expect(page.getByText(/ms latency/i)).toBeVisible();
    await expect(page.getByText(/12 global regions/i)).toBeVisible();
  });

  test('Compare section vs Worms Zone', async ({ page }) => {
    const heading = page.locator('h2', { hasText: /snake online vs/i });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
    await expect(page.getByText('Worms Zone .io').first()).toBeVisible();
  });

  test('FAQ accordion: clicking a closed question opens it (aria-expanded toggles)', async ({ page }) => {
    // The first FAQ question is open by default (useState(0)). Click a closed one.
    // Address by stable id, not by query (which re-runs and may match a different element after click).
    const closedTrigger = page.locator('button[id^="faq-trigger-"][aria-expanded="false"]').first();
    await closedTrigger.scrollIntoViewIfNeeded();
    const triggerId = await closedTrigger.getAttribute('id');
    expect(triggerId).toBeTruthy();
    await closedTrigger.click();
    // Re-query by the stable id to avoid the selector-race issue.
    const sameTrigger = page.locator(`#${triggerId}`);
    await expect(sameTrigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('schema.org JSON-LD blocks are present (Organization, VideoGame, FAQPage)', async ({ page }) => {
    const blobs = await page.locator('script[type="application/ld+json"]').allTextContents();
    const joined = blobs.join('|');
    expect(joined).toContain('Organization');
    expect(joined).toContain('VideoGame');
    expect(joined).toContain('FAQPage');
  });
});
