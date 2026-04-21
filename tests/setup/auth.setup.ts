import { test as setup } from '@playwright/test';
import { STORE_PASSWORD } from '../../fixtures/cdt-test-data';
import path from 'path';

export const STORAGE_STATE = path.join(__dirname, '../../.auth/storefront.json');

setup('authenticate storefront', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  const passwordInput = page.locator('#password');
  if (await passwordInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await passwordInput.fill(STORE_PASSWORD);
    await page.click('[type="submit"]');
    await page.waitForLoadState('domcontentloaded');
  }

  // Save session cookies to file
  await page.context().storageState({ path: STORAGE_STATE });
  console.log('✅ Storefront session saved to .auth/storefront.json');
});