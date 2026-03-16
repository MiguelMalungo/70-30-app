import { test, expect } from '@playwright/test';
import { devLoginPro } from './helpers.js';

test.describe('Authentication Flow', () => {
  test('login with Mentor demo → redirects to pro dashboard', async ({ page }) => {
    await devLoginPro(page, 'MENTOR');
    await expect(page).toHaveURL(/#\/pro/);
    await page.waitForSelector('[class*="dash"]', { timeout: 5000 });
  });

  test('login with Apprentice demo → redirects to pro dashboard', async ({ page }) => {
    await devLoginPro(page, 'APPRENTICE');
    await expect(page).toHaveURL(/#\/pro/);
  });

  test('login form validation — shows error on empty submit', async ({ page }) => {
    await page.goto('/#/login');
    await page.click('.btn-auth-submit');
    await expect(page.locator('.form-error')).toBeVisible();
  });

  test('login form — password visibility toggle works', async ({ page }) => {
    await page.goto('/#/login');
    const pwdInput = page.locator('#password');
    await expect(pwdInput).toHaveAttribute('type', 'password');

    await page.click('.password-toggle');
    await expect(pwdInput).toHaveAttribute('type', 'text');

    await page.click('.password-toggle');
    await expect(pwdInput).toHaveAttribute('type', 'password');
  });

  test('protected routes redirect when not authenticated', async ({ page }) => {
    await page.goto('/#/client/services');
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toMatch(/login|\/$/);
  });

  test('demo buttons are visible on login page', async ({ page }) => {
    await page.goto('/#/login');
    await expect(page.locator('.auth-demo-row')).toBeVisible();
    const demoButtons = page.locator('.auth-demo-btn');
    await expect(demoButtons).toHaveCount(3);
  });
});
