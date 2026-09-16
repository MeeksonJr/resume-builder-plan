import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness & Viewport Integrity (Phase 44 E2E)', () => {
  test('homepage has zero horizontal document overflow on mobile', async ({ page }) => {
    // Emulate mobile phone screen (390 x 844 iPhone 14)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });

  test('navbar preserves touch target accessibility on mobile viewports', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that interactive links are accessible
    const links = await page.locator('header a, nav a').all();
    for (const link of links.slice(0, 3)) {
      const box = await link.boundingBox();
      if (box && box.width > 0) {
        // Must have reasonable minimum dimension for tap targets
        expect(box.height).toBeGreaterThanOrEqual(20);
      }
    }
  });
});
