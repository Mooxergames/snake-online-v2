import { test, expect } from '@playwright/test';

test.describe('Versus pages', () => {
  test('/vs/wormzone-io renders comparison table', async ({ page }) => {
    await page.goto('/en/vs/wormzone-io');
    await expect(page.locator('h1')).toContainText(/snake online vs worms zone/i);
    await expect(page.getByText(/real-time multiplayer/i).first()).toBeVisible();
    await expect(page.getByText(/native seo \+ hreflang/i)).toBeVisible();

    const blobs = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blobs.join('|')).toContain('BreadcrumbList');
  });

  test('/vs/slither-io renders verdict copy', async ({ page }) => {
    await page.goto('/en/vs/slither-io');
    await expect(page.locator('h1')).toContainText(/slither/i);
  });

  test('unknown competitor returns 404', async ({ page }) => {
    const res = await page.goto('/en/vs/nope-not-real');
    expect(res?.status() ?? 0).toBeGreaterThanOrEqual(400);
  });
});
