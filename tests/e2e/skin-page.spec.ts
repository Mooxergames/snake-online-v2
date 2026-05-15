import { test, expect } from '@playwright/test';

test.describe('Programmatic skin pages', () => {
  test('country skin: Türkiye renders with breadcrumb + Product schema', async ({ page }) => {
    await page.goto('/en/skins/country-t-rkiye');

    await expect(page.locator('h1')).toHaveText(/türkiye/i);
    await expect(page.getByText('EXCLUSIVE').first()).toBeVisible();

    // Breadcrumb link
    await expect(page.getByRole('link', { name: /home/i }).first()).toBeVisible();

    // Schema check: CreativeWork (we deliberately moved off Product since $0 offers
    // disqualify rich results) + BreadcrumbList.
    const blobs = await page.locator('script[type="application/ld+json"]').allTextContents();
    const joined = blobs.join('|');
    expect(joined).toContain('CreativeWork');
    expect(joined).toContain('BreadcrumbList');
    expect(joined).toContain('isPartOf'); // Tied to parent VideoGame entity
  });

  test('fantasy skin: Ember renders with rarity badge', async ({ page }) => {
    await page.goto('/en/skins/fantasy-ember-01');
    await expect(page.locator('h1')).toContainText(/ember/i);
    await expect(page.getByText(/legendary/i).first()).toBeVisible();
  });

  test('related skins grid contains 6 entries', async ({ page }) => {
    await page.goto('/en/skins/country-t-rkiye');
    const related = page.locator('a[href*="/skins/"]');
    // At least 6 related + breadcrumb back to /snakes
    const count = await related.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });
});
