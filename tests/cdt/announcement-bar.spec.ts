import { test, expect } from '@playwright/test';
import { AnnouncementBarWidget } from '../../pages/cdt/announcement-bar.widget';
import { URLS, VIEWPORTS, ALL_PAGES, TEST_EMAIL } from '../../fixtures/cdt-test-data';

// Widget ID loaded from CDT_ANNOUNCEMENT_BAR_ID in .env (e.g. "87143")

test.describe('Announcement Bar', () => {
  let w: AnnouncementBarWidget;

  test.beforeEach(async ({ page }) => {
    w = new AnnouncementBarWidget(page);
  });

  // ════════════════════════════════════════════════════════════════════════
  // 1. VISIBILITY — across all pages
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Visibility — all pages', () => {

    for (const { name, path } of ALL_PAGES) {
      test(`@smoke bar is visible on ${name} page`, async () => {
        await w.goto(path);
        await expect(w.bar).toBeVisible({ timeout: 10000 });
      });
    }

  });

  // ════════════════════════════════════════════════════════════════════════
  // 2. CONTENT
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Content', () => {

    test.beforeEach(async () => { await w.goto(URLS.home); });

    test('@smoke "Flash sale!" text is visible', async () => {
      await expect(w.flashSaleText).toBeVisible();
    });

    test('@smoke "Hurry up!" text is visible', async () => {
      await expect(w.hurryUpText).toBeVisible();
    });

    test('@smoke "Get discount" link is visible', async () => {
      await expect(w.getDiscountLink).toBeVisible();
    });

    test('@smoke "Shop now" button is visible and enabled', async () => {
      await expect(w.shopNowButton).toBeVisible();
      await expect(w.shopNowButton).toBeEnabled();
    });

    test('@smoke discount code is visible and not empty', async () => {
      await expect(w.discountCodeInner).toBeVisible();
      const text = await w.getDiscountCodeText();
      expect(text.length, 'discount code should not be empty').toBeGreaterThan(0);
    });

    test('@smoke copy button is visible', async () => {
      await expect(w.copyButton).toBeVisible();
    });

    test('content is consistent across pages', async () => {
      await w.goto(URLS.home);
      const homeText = await w.getDiscountCodeText();

      await w.goto(URLS.product);
      const productText = await w.getDiscountCodeText();

      expect(productText).toBe(homeText);
    });

  });

  // ════════════════════════════════════════════════════════════════════════
  // 3. COPY DISCOUNT CODE
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Copy discount code', () => {

    test.beforeEach(async () => { await w.goto(URLS.home); });

    test('@smoke copy button is clickable', async () => {
      await expect(w.copyButton).toBeVisible();
      await expect(w.copyButton).toBeEnabled();
      await w.copyButton.click();
      // After click — button may show "Copied!" feedback
      await w.page.waitForTimeout(500);
    });

  });

  // ════════════════════════════════════════════════════════════════════════
  // 4. EMAIL CAPTURE
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Email capture', () => {

    test.beforeEach(async () => { await w.goto(URLS.home); });

    test('@smoke email input is visible', async () => {
      await expect(w.emailInput).toBeVisible();
    });

    test('@smoke "Sign up" button is visible and enabled', async () => {
      await expect(w.signUpButton).toBeVisible();
      await expect(w.signUpButton).toBeEnabled();
    });

    test('@smoke "Remind me" button is visible', async () => {
      await expect(w.remindMeButton).toBeVisible();
    });

    test('sign up with empty email shows validation message', async () => {
      await w.signUpButton.click();
      await expect(w.validationMessage).toBeVisible({ timeout: 5000 });
    });

    test('@smoke sign up with valid email shows success state', async () => {
      await w.emailInput.fill(TEST_EMAIL);
      await w.signUpButton.click();
      await expect(w.successTitle).toBeVisible({ timeout: 8000 });
      await expect(w.successDiscount).toBeVisible();
      await expect(w.successDiscountCode).toBeVisible();
      await expect(w.successCopyButton).toBeVisible();
    });

    test('email input accepts text correctly', async () => {
      await w.emailInput.fill(TEST_EMAIL);
      await expect(w.emailInput).toHaveValue(TEST_EMAIL);
    });

  });

  // ════════════════════════════════════════════════════════════════════════
  // 5. CLOSE BUTTON
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Close button', () => {

    test('close button dismisses the bar', async () => {
      await w.goto(URLS.home);
      await expect(w.bar).toBeVisible();
      await w.closeButton.click();
      await expect(w.bar).not.toBeVisible({ timeout: 3000 });
    });

    test('bar stays hidden after navigating to another page', async () => {
      await w.goto(URLS.home);
      await w.closeButton.click();
      await expect(w.bar).not.toBeVisible({ timeout: 3000 });
      await w.goto(URLS.product);
      await expect(w.bar).not.toBeVisible({ timeout: 3000 });
    });

  });

  // ════════════════════════════════════════════════════════════════════════
  // 6. RESPONSIVE LAYOUT
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Responsive layout', () => {

    for (const [name, size] of Object.entries(VIEWPORTS)) {
      test(`@responsive renders on ${name} (${size.width}×${size.height})`, async ({ page }) => {
        await page.setViewportSize(size);
        await w.goto(URLS.home);
        await expect(w.bar).toBeVisible();
        const box = await w.bar.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.width).toBeGreaterThan(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(size.width + 1);
      });
    }

  });

});