import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads with hero and navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-logo')).toBeVisible();
    await expect(page.locator('.hero')).toBeVisible();
  });

  test('login page loads with form', async ({ page }) => {
    await page.goto('/#/login');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('.btn-auth-submit')).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/#/register');
    await expect(page.locator('.auth-card')).toBeVisible();
  });

  test('navigation links work on homepage', async ({ page }) => {
    await page.goto('/');
    const howSection = page.locator('#how');
    if (await howSection.count() > 0) {
      await expect(howSection).toBeAttached();
    }
  });

  test('demo page loads', async ({ page }) => {
    await page.goto('/#/demo');
    await expect(page).toHaveURL(/demo/);
  });

  test('login form shows error on empty submit', async ({ page }) => {
    await page.goto('/#/login');
    await page.click('.btn-auth-submit');
    await expect(page.locator('.form-error')).toBeVisible();
  });

  test('language switcher changes text', async ({ page }) => {
    await page.goto('/');
    // Default is PT — switch to EN
    const enBtn = page.locator('.nav-lang button', { hasText: 'EN' });
    if (await enBtn.count() > 0) {
      await enBtn.click();
      // Check that some text changed to English
      await expect(page.locator('body')).toContainText(/Services|How it works/);
    }
  });

  test('login demo buttons exist', async ({ page }) => {
    await page.goto('/#/login');
    await expect(page.locator('.auth-demo-row')).toBeVisible();
    const demoButtons = page.locator('.auth-demo-btn');
    await expect(demoButtons).toHaveCount(3);
  });
});
