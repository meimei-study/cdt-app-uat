import { Page } from '@playwright/test';
import { STORE_PASSWORD } from '../../fixtures/cdt-test-data';

export class BaseWidgetPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async unlockStorefront() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
    const passwordInput = this.page.locator('#password');
    if (await passwordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await passwordInput.fill(STORE_PASSWORD);
      await this.page.click('[type="submit"]');
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async goto(path: string) {
    await this.page.goto(path);
    // domcontentloaded — Shopify apps prevent networkidle
    await this.page.waitForLoadState('domcontentloaded');
    // Allow CDT widget JS to initialize
    await this.page.waitForTimeout(1500);
  }

}


