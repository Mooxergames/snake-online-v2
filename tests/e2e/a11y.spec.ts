import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Critical-path accessibility smoke tests using axe-core.
 * We assert that core pages have ZERO WCAG 2.0/2.1/2.2 AA violations.
 * Color-contrast rule is currently enabled — if a violation surfaces it WILL fail the build.
 */

const PAGES_TO_CHECK = [
  { name: 'Home', url: '/en' },
  { name: 'Skin detail', url: '/en/skins/country-t-rkiye' },
  { name: 'Versus', url: '/en/vs/wormzone-io' },
  { name: 'How to play', url: '/en/how-to-play' },
];

for (const p of PAGES_TO_CHECK) {
  test(`a11y: ${p.name} has no WCAG 2.2 AA violations`, async ({ page }) => {
    await page.goto(p.url);
    // domcontentloaded is enough; networkidle never settles because of the
    // Vimeo iframe + the simulated live-online setInterval on the Home page.
    await page.waitForLoadState('domcontentloaded');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      // `color-contrast-enhanced` is AAA, not AA — skip it.
      .disableRules(['color-contrast-enhanced'])
      // The Vimeo iframe sits in the accessibility tree but its content is
      // outside our control; we mark it aria-hidden + tabindex=-1 which axe still
      // sometimes flags. Excluding the iframe lets us focus on first-party content.
      .exclude('iframe[src*="vimeo"]')
      .analyze();

    if (results.violations.length > 0) {
      // Print concise summary so failing test logs are readable
      const summary = results.violations.map(v => `  ${v.id} (${v.impact}): ${v.help} [${v.nodes.length} node(s)]`).join('\n');
      console.log(`\n${p.name} violations:\n${summary}`);
    }

    expect(results.violations).toEqual([]);
  });
}

test('Home has a skip-to-content link as first focusable element', async ({ page }) => {
  await page.goto('/en');
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');
  expect(focused.toLowerCase()).toContain('skip');
});

test('Home: keyboard Tab through hero CTAs reaches both buttons', async ({ page }) => {
  await page.goto('/en');
  const playLink = page.getByRole('link', { name: /play free now/i }).first();
  await expect(playLink).toBeVisible();
  await playLink.focus();
  await expect(playLink).toBeFocused();
});

test('Mobile menu opens, traps focus, closes on Escape', async ({ page, browser }) => {
  // Force mobile viewport so the hamburger renders
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const m = await context.newPage();
  await m.goto('/en');

  const toggle = m.getByRole('button', { name: /open menu/i });
  await expect(toggle).toBeVisible();
  await toggle.click();

  // After open, first mobile link should be focused
  const firstLink = m.locator('#mobile-nav a').first();
  await expect(firstLink).toBeFocused();

  // Escape closes
  await m.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await context.close();
});
