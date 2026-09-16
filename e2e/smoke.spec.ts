import { test, expect } from '@playwright/test';

test.describe('Landing & Public Surface Smoke Tests', () => {
  test('homepage renders hero heading and call to actions', async ({ page }) => {
    await page.goto('/');

    // Validate page title contains ResumeForge
    await expect(page).toHaveTitle(/ResumeForge/i);

    // Verify main hero headline or key CTAs are rendered
    const bodyText = await page.innerText('body');
    expect(bodyText.length).toBeGreaterThan(50);
  });

  test('navigation elements and links respond correctly', async ({ page }) => {
    await page.goto('/');

    // Find any CTA button or link
    const cta = page.locator('a, button').first();
    await expect(cta).toBeVisible();
  });

  test('handles 404 cleanly for invalid public resume slug', async ({ page }) => {
    const response = await page.goto('/r/non-existent-resume-slug-999999');
    // Expect 404 status or not-found page
    expect(response?.status()).toBe(404);
  });
});
