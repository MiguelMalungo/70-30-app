import { test, expect } from '@playwright/test';
import { devLoginClient, navigateHash } from './helpers.js';

test.describe('Booking Flow — End-to-End', () => {
  test.beforeEach(async ({ page }) => {
    await devLoginClient(page, '#/client/services');
  });

  test('services page loads with categories', async ({ page }) => {
    const cards = page.locator('.sp-cat-card, [class*="cat-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 8000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('navigate: Services → Category page', async ({ page }) => {
    await page.waitForSelector('.sp-cat-card', { timeout: 8000 });
    await page.locator('.sp-cat-card').first().click();
    await page.waitForTimeout(1000);
    // URL should include a category slug
    expect(page.url()).toMatch(/#\/client\/services\/.+/);
  });

  test('wizard — complete 4-step booking flow', async ({ page }) => {
    await navigateHash(page, '#/client/wizard');
    await page.waitForSelector('.wz-cat-grid, .wizard', { timeout: 8000 });

    // ─── Step 1: Service Selection ───
    await page.locator('.wz-cat-btn').first().click();
    await page.waitForTimeout(500);
    await page.locator('.wz-sub-btn').first().waitFor({ timeout: 3000 });
    await page.locator('.wz-sub-btn').first().click();
    await page.waitForTimeout(300);
    await page.locator('.wz-btn-next').click();
    await page.waitForTimeout(500);

    // ─── Step 2: Schedule ───
    await page.locator('.wz-day-btn:not([disabled])').first().waitFor({ timeout: 3000 });
    await page.locator('.wz-day-btn:not([disabled])').first().click();
    await page.waitForTimeout(300);
    await page.locator('.wz-time-btn').first().click();
    await page.waitForTimeout(300);
    await page.locator('.wz-btn-next').click();
    await page.waitForTimeout(500);

    // ─── Step 3: Details ───
    const addressInput = page.locator('.wz-input[type="text"]').first();
    await addressInput.waitFor({ timeout: 3000 });
    await addressInput.fill('Rua dos Testes, 42, Lisboa');

    const textarea = page.locator('.wz-textarea');
    if (await textarea.isVisible()) {
      await textarea.fill('Teste E2E - booking flow');
    }

    await page.locator('.wz-btn-next').click();
    await page.waitForTimeout(500);

    // ─── Step 4: Confirm ───
    const summaryCard = page.locator('.wz-summary-card');
    await expect(summaryCard).toBeVisible({ timeout: 3000 });
    await expect(summaryCard).toContainText('Rua dos Testes');

    await page.locator('.wz-btn-confirm').click();

    // ─── Success ───
    await page.waitForSelector('.wizard-success, [class*="success"]', { timeout: 10000 });
  });

  test('wizard — step 1 requires selection before Next advances', async ({ page }) => {
    await navigateHash(page, '#/client/wizard');
    await page.waitForSelector('.wz-cat-grid', { timeout: 8000 });

    // Try clicking next without selecting anything
    const nextBtn = page.locator('.wz-btn-next');
    if (await nextBtn.isVisible()) {
      const isDisabled = await nextBtn.isDisabled();
      if (!isDisabled) {
        await nextBtn.click();
        await page.waitForTimeout(500);
        // Should still show categories (step 1)
        await expect(page.locator('.wz-cat-grid')).toBeVisible();
      }
    }
  });

  test('wizard — step 3 requires address > 5 chars', async ({ page }) => {
    await navigateHash(page, '#/client/wizard');
    await page.waitForSelector('.wz-cat-grid', { timeout: 8000 });

    // Navigate to step 3
    await page.locator('.wz-cat-btn').first().click();
    await page.waitForTimeout(300);
    await page.locator('.wz-sub-btn').first().click();
    await page.waitForTimeout(300);
    await page.locator('.wz-btn-next').click();
    await page.waitForTimeout(300);
    await page.locator('.wz-day-btn:not([disabled])').first().click();
    await page.waitForTimeout(200);
    await page.locator('.wz-time-btn').first().click();
    await page.waitForTimeout(200);
    await page.locator('.wz-btn-next').click();
    await page.waitForTimeout(300);

    // Enter short address
    const addressInput = page.locator('.wz-input[type="text"]').first();
    await addressInput.fill('Rua');

    const nextBtn = page.locator('.wz-btn-next');
    if (await nextBtn.isVisible()) {
      const disabled = await nextBtn.isDisabled();
      if (!disabled) {
        await nextBtn.click();
        await page.waitForTimeout(500);
        // Should still be on step 3
        await expect(addressInput).toBeVisible();
      }
    }
  });

  test('my bookings page loads', async ({ page }) => {
    await navigateHash(page, '#/client/bookings');
    await page.waitForTimeout(2000);
    // Page should render without crashing
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(0);
    // Should show bookings-related content
    expect(body).toMatch(/Reservas|Bookings|Bokningar|booking/i);
  });
});
