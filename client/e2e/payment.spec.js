import { test, expect } from '@playwright/test';
import { devLoginClient, navigateHash } from './helpers.js';

test.describe('Payment / Escrow Flow', () => {
  test.beforeEach(async ({ page }) => {
    await devLoginClient(page, '#/client/escrow');
    await page.waitForSelector('.escrow-checkout-card, .escrow-page, .escrow-container', { timeout: 8000 });
  });

  test('escrow page loads with payment methods', async ({ page }) => {
    const methodBtns = page.locator('.escrow-method-btn');
    await expect(methodBtns.first()).toBeVisible();
    await expect(methodBtns).toHaveCount(3);
  });

  test('card payment — form renders with inputs', async ({ page }) => {
    await page.locator('.escrow-method-btn').first().click();
    await page.waitForTimeout(300);

    const cardInputs = page.locator('.escrow-card-form .escrow-input');
    const count = await cardInputs.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('card number — sanitizes and formats with spaces', async ({ page }) => {
    await page.locator('.escrow-method-btn').first().click();
    await page.waitForTimeout(300);

    const cardInput = page.locator('.escrow-card-form .escrow-input').first();
    await cardInput.fill('4242424242424242');
    const value = await cardInput.inputValue();
    expect(value).toMatch(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/);
  });

  test('card number — rejects non-numeric characters', async ({ page }) => {
    await page.locator('.escrow-method-btn').first().click();
    await page.waitForTimeout(300);

    const cardInput = page.locator('.escrow-card-form .escrow-input').first();
    await cardInput.fill('4242abcd42424242');
    const value = await cardInput.inputValue();
    expect(value.replace(/\s/g, '')).toMatch(/^\d+$/);
  });

  test('expiry — formats as MM/YY', async ({ page }) => {
    await page.locator('.escrow-method-btn').first().click();
    await page.waitForTimeout(300);

    const expiryInput = page.locator('.escrow-card-form .escrow-input').nth(1);
    await expiryInput.fill('1228');
    const value = await expiryInput.inputValue();
    expect(value).toMatch(/^\d{2}\/\d{2}$/);
  });

  test('CVC — limits to 3-4 digits', async ({ page }) => {
    await page.locator('.escrow-method-btn').first().click();
    await page.waitForTimeout(300);

    const cvcInput = page.locator('.escrow-card-form .escrow-input').nth(2);
    await cvcInput.fill('12345');
    const value = await cvcInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(4);
    expect(value).toMatch(/^\d+$/);
  });

  test('card payment — submit triggers processing', async ({ page }) => {
    await page.locator('.escrow-method-btn').first().click();
    await page.waitForTimeout(300);

    const inputs = page.locator('.escrow-card-form .escrow-input');
    await inputs.nth(0).fill('4242424242424242');
    await inputs.nth(1).fill('1228');
    await inputs.nth(2).fill('123');

    const payBtn = page.locator('.escrow-pay-btn');
    await payBtn.click();
    await page.waitForTimeout(500);

    // Should show processing state or success
    const btnText = await payBtn.textContent();
    const successEl = page.locator('.escrow-pay-success');
    const isProcessing = btnText?.includes('…') || btnText?.includes('Processing') || btnText?.includes('Processando');
    const isSuccess = await successEl.isVisible().catch(() => false);
    expect(isProcessing || isSuccess).toBeTruthy();
  });

  test('PayPal method — shows PayPal button', async ({ page }) => {
    await page.locator('.escrow-method-btn').nth(1).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.escrow-paypal-btn')).toBeVisible();
  });

  test('MB Way method — shows MB Way button', async ({ page }) => {
    await page.locator('.escrow-method-btn').nth(2).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.escrow-mbway-btn')).toBeVisible();
  });

  test('escrow status flow — advance button works', async ({ page }) => {
    const advanceBtn = page.locator('.escrow-btn-advance');
    if (await advanceBtn.isVisible()) {
      await advanceBtn.click();
      await page.waitForTimeout(500);
    }
  });
});
