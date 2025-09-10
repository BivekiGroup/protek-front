import { test, expect } from '@playwright/test';

test.describe('Главная страница', () => {
  test('отображает ключевые блоки и принимает cookies', async ({ page }) => {
    await page.addInitScript(() => {
      try { localStorage.setItem('maintenance_authenticated', 'true'); } catch {}
    });

    const resp = await page.goto('/');
    expect(resp?.ok()).toBeTruthy();

    // Сначала закрываем cookie-баннер, не ждём networkidle (на главной есть фоновые запросы)
    const cookieAccept = page.getByRole('button', { name: 'Принять' });
    if (await cookieAccept.isVisible().catch(() => false)) await cookieAccept.click();

    // Проверяем статические секции
    const subscribe = page.getByTestId('home-catalog-subscribe');
    if (await subscribe.count() === 0) {
      const fallback = page.getByRole('button', { name: 'Подписаться' });
      await fallback.waitFor({ state: 'attached', timeout: 10000 });
      await fallback.scrollIntoViewIfNeeded();
      await expect(fallback).toBeVisible();
    } else {
      await subscribe.waitFor({ state: 'attached', timeout: 15000 });
      await subscribe.scrollIntoViewIfNeeded();
      await expect(subscribe).toBeVisible();
    }
    const footerById = page.getByTestId('home-footer');
    let footer = footerById as ReturnType<typeof page.getByTestId> | ReturnType<typeof page.getByRole>;
    if (await footerById.count() === 0) {
      const byPolicy = page.getByRole('link', { name: 'Политика конфиденциальности' });
      const byConsent = page.getByRole('link', { name: 'Согласие на обработку персональных данных' });
      const bySupport = page.getByRole('link', { name: 'Support' });
      if (await byPolicy.count()) footer = byPolicy;
      else if (await byConsent.count()) footer = byConsent;
      else if (await bySupport.count()) footer = bySupport;
      else footer = byPolicy; // на случай, если появится позже
    }
    await footer.waitFor({ state: 'attached', timeout: 15000 });
    try {
      await (footer as any).scrollIntoViewIfNeeded();
    } catch {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    }
    await expect(footer).toBeVisible({ timeout: 15000 });

    // Мобильное меню показывается только на мобиле
    const viewport = page.viewportSize();
    const isMobile = !!viewport && viewport.width < 768;
    if (isMobile) {
      await expect(page.getByTestId('home-mobile-menu-bottom')).toBeVisible();
    } else {
      await expect.soft(page.getByTestId('home-mobile-menu-bottom')).not.toBeVisible();
    }
  });
});

test.afterEach(async ({ page }, testInfo) => {
  const full = await page.screenshot({ fullPage: true });
  await testInfo.attach('fullpage-screenshot', { body: full, contentType: 'image/png' });
});
