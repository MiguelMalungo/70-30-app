import { test, expect } from '@playwright/test';
import { devLoginClient, devLoginPro, navigateHash } from './helpers.js';

test.describe('Navigation & Lazy Loading', () => {
  test('all public routes load without errors', async ({ page }) => {
    const routes = ['/', '/#/login', '/#/register', '/#/demo'];
    for (const route of routes) {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(route);
      await page.waitForTimeout(1000);

      expect(errors).toHaveLength(0);
      page.removeAllListeners('pageerror');
    }
  });

  test('client routes lazy-load without chunk errors', async ({ page }) => {
    await devLoginClient(page, '#/client');

    const routes = ['#/client/services', '#/client/bookings', '#/client/profile'];
    for (const route of routes) {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await navigateHash(page, route);
      await page.waitForTimeout(1500);

      expect(errors).toHaveLength(0);
      page.removeAllListeners('pageerror');
    }
  });

  test('pro routes lazy-load without chunk errors', async ({ page }) => {
    await devLoginPro(page, 'MENTOR');

    const routes = ['#/pro/community', '#/pro/inbox', '#/pro/escrow', '#/pro/calendar'];
    for (const route of routes) {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await navigateHash(page, route);
      await page.waitForTimeout(1500);

      expect(errors).toHaveLength(0);
      page.removeAllListeners('pageerror');
    }
  });

  test('mobile nav hamburger menu toggles', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const menuBtn = page.locator('.nav-toggle, [aria-label*="menu" i], button:has(svg.lucide-menu)').first();
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(300);
      const navLinks = page.locator('.nav-links, .mobile-nav');
      await expect(navLinks).toBeVisible();
    }
  });

  test('language switcher changes page content', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.hero', { timeout: 5000 });

    const enBtn = page.locator('.nav-lang button, [class*="lang"] button', { hasText: 'EN' }).first();
    if (await enBtn.isVisible()) {
      await enBtn.click();
      await page.waitForTimeout(500);
      const body = await page.locator('body').textContent();
      expect(body).toMatch(/Services|How it works|Book|Home/i);
    }
  });

  test('page titles update via PageMeta', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/70\.30/);

    await devLoginClient(page, '#/client/services');
    await page.waitForTimeout(1500);
    const title = await page.title();
    expect(title).toMatch(/Serviços|Services|Tjänster|70\.30/);
  });

  test('error boundary catches bad routes gracefully', async ({ page }) => {
    await devLoginClient(page);
    await navigateHash(page, '#/nonexistent-route');
    await page.waitForTimeout(1000);
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(0);
  });

  test('wizard back navigation works', async ({ page }) => {
    await devLoginClient(page, '#/client/wizard');
    await page.waitForSelector('.wz-cat-grid', { timeout: 8000 });

    // Advance to step 2
    await page.locator('.wz-cat-btn').first().click();
    await page.waitForTimeout(300);
    await page.locator('.wz-sub-btn').first().click();
    await page.waitForTimeout(300);
    await page.locator('.wz-btn-next').click();
    await page.waitForTimeout(500);

    await expect(page.locator('.wz-calendar-grid')).toBeVisible();

    // Go back
    const backBtn = page.locator('.wz-btn-back, [class*="btn-back"]').first();
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('.wz-cat-grid').first()).toBeVisible();
    }
  });
});
