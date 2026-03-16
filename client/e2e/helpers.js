/**
 * Shared E2E test helpers.
 *
 * devLogin works by clicking the demo buttons on the login page
 * and then navigating via the app's router (hash changes),
 * NOT via page.goto() which would reload and lose in-memory auth.
 */

/**
 * Login as MENTOR or APPRENTICE via demo buttons, then navigate
 * to a target route using in-page hash navigation.
 */
export async function devLoginPro(page, role = 'MENTOR', targetRoute = null) {
  await page.goto('/#/login');
  await page.waitForSelector('.auth-demo-row', { timeout: 5000 });

  if (role === 'MENTOR') {
    await page.locator('.auth-demo-btn--pro').click();
  } else {
    await page.locator('.auth-demo-btn--apprentice').click();
  }

  await page.waitForURL(url => url.hash.startsWith('#/pro'), { timeout: 8000 });

  if (targetRoute) {
    // Navigate within the SPA using hash change — no full reload
    await page.evaluate((route) => { window.location.hash = route; }, targetRoute);
    await page.waitForTimeout(1000);
  }
}

/**
 * Login as CLIENT via devLogin injected through the app's React context.
 * Since the Client demo button goes to /demo instead of devLogin,
 * we use the Mentor devLogin then override the role via evaluate,
 * OR we inject the auth state directly.
 *
 * Approach: click Mentor demo (which does devLogin), then use in-app
 * navigation. The ProtectedRoute for client paths also allows MENTEE/APPRENTICE.
 * But CLIENT-only paths need CLIENT role.
 *
 * Cleanest approach: set localStorage token + navigate. The app falls back
 * gracefully in dev mode when token is invalid.
 */
export async function devLoginClient(page, targetRoute = null) {
  await page.goto('/#/login');
  await page.waitForSelector('.auth-demo-row', { timeout: 5000 });

  // The APPRENTICE role is allowed on client routes (CLIENT, MENTEE, APPRENTICE)
  await page.locator('.auth-demo-btn--apprentice').click();
  await page.waitForURL(url => url.hash.startsWith('#/pro'), { timeout: 8000 });

  if (targetRoute) {
    await page.evaluate((route) => { window.location.hash = route; }, targetRoute);
    await page.waitForTimeout(1500);
  } else {
    // Navigate to client dashboard
    await page.evaluate(() => { window.location.hash = '#/client'; });
    await page.waitForTimeout(1500);
  }
}

/**
 * Navigate within the SPA without full reload.
 */
export async function navigateHash(page, hash) {
  await page.evaluate((h) => { window.location.hash = h; }, hash);
  await page.waitForTimeout(1000);
}
