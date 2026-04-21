// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 8000 },
  fullyParallel: false,
  retries: 1,
  reporter: [['html', { open: 'never' }], ['list']],

  projects: [
    // ── Setup: login once, save session to .auth/storefront.json ────────────
    {
      name: 'setup',
      testMatch: /.*auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://review-jan.myshopify.com',
        headless: false,
        // No storageState here — this IS the step that creates it
      },
    },

    // ── Main tests: reuse saved session ─────────────────────────────────────
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://review-jan.myshopify.com',
        headless: false,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        storageState: '.auth/storefront.json',
      },
      dependencies: ['setup'],
    },
  ],
});