import { expect, test } from '@playwright/test';

test('navbar and footer are on the page', async ({ page }) => {
  await page.goto('/');

  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('link', { name: 'Tools', exact: true })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'History' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Log in' })).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Footer' }).getByRole('link', { name: 'Privacy' }),
  ).toBeVisible();
});

test('dark mode toggle works and is remembered after reload', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).not.toHaveClass(/dark/);

  await page.getByRole('button', { name: /light and dark/i }).click();
  await expect(html).toHaveClass(/dark/);

  await page.reload();
  await expect(html).toHaveClass(/dark/);
});

test('works on a phone-sized screen without sideways scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto('/');

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});
