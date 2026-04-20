const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');

const PASSWORD = process.env.SHOPIFY_PASSWORD || '123456';

test('should unlock the storefront with valid password', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(PASSWORD);

  await expect(page).not.toHaveURL(/password/, { timeout: 10000 });
});
