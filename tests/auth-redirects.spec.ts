import { test, expect } from '@playwright/test';

test.describe('Редиректы неавторизованных', () => {
  test('История, Гараж, Избранное → страница "Войдите, чтобы продолжить"', async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.setItem('maintenance_authenticated', 'true');
      } catch {}
    });

    await page.goto('/');

    const cookieAccept = page.getByRole('button', { name: 'Принять' });
    if (await cookieAccept.isVisible().catch(() => false)) {
      await cookieAccept.click();
    }

    const header = page.getByRole('banner');

    await Promise.all([
      page.waitForURL(/\/profile-history/, { waitUntil: 'commit' }),
      header.getByRole('img', { name: 'История заказов' }).click(),
    ]);
    await page.waitForURL(/\/login-required/, { waitUntil: 'commit', timeout: 15000 });

    await page.goto('/');
    await header.getByRole('link', { name: 'Добавить в гараж' }).click();
    await Promise.race([
      page.waitForURL(/\/login-required/, { waitUntil: 'commit' }),
      page.getByRole('heading', { name: 'Войдите, чтобы продолжить' }).waitFor({ state: 'visible' }),
    ]);

    await page.goto('/');
    await header.getByRole('link', { name: 'Избранное' }).click();
    await Promise.race([
      page.waitForURL(/\/login-required/, { waitUntil: 'commit' }),
      page.getByRole('heading', { name: 'Войдите, чтобы продолжить' }).waitFor({ state: 'visible' }),
    ]);
  });
});

test.afterEach(async ({ page }, testInfo) => {
  const full = await page.screenshot({ fullPage: true });
  await testInfo.attach('fullpage-screenshot', { body: full, contentType: 'image/png' });
});



