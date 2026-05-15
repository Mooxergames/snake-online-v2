import { test, expect } from '@playwright/test';

test.describe('How-to-play guide', () => {
  test('renders with HowTo schema and 7 steps', async ({ page }) => {
    await page.goto('/en/how-to-play');
    await expect(page.locator('h1')).toContainText(/how to play/i);

    // 7-step ordered list
    const steps = page.locator('ol > li');
    await expect(steps).toHaveCount(7);

    const blobs = await page.locator('script[type="application/ld+json"]').allTextContents();
    const joined = blobs.join('|');
    expect(joined).toContain('"@type":"HowTo"');
    expect(joined).toContain('HowToStep');
  });
});
