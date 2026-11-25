import { expect, test } from '@playwright/test';

test('home page loads and shows the privacy promise', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'PDF Tools' })).toBeVisible();
  await expect(page.getByText('Your file never leaves this device.')).toBeVisible();
});
