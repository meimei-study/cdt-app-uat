import { Page } from '@playwright/test';
import { STORE_PASSWORD } from '../../fixtures/cdt-test-data';

export class BaseWidgetPage {
  constructor(protected page: Page) {}

  async unlockStorefront() {
    await this.page.goto('/');
    const passwordInput = this.page.locator('#password');
    if (await passwordInput.isVisible()) {
      await passwordInput.fill(STORE_PASSWORD);
      await this.page.click('[type="submit"]');
      await this.page.waitForLoadState('networkidle');
    }
  }

  async goto(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }
}
