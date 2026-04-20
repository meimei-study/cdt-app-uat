import { test, expect } from '@playwright/test';
import { AnnouncementBarWidget } from '../../pages/cdt/announcement-bar.widget';
import { URLS, VIEWPORTS, ALL_PAGES } from '../../fixtures/cdt-test-data';

// Widget type loaded from CDT_ANNOUNCEMENT_BAR_TYPE in .env (e.g. "02-bar")

test.describe('Announcement Bar', () => {
  let w: AnnouncementBarWidget;

  test.beforeEach(async ({ page }) => {
    w = new AnnouncementBarWidget(page);
    await w.unlockStorefront();
  });

  // ════════════════════════════════════════════════════════════════════════
  // 1. VISIBILITY — across all pages
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Visibility — all pages', () => {

    for (const { name, path } of ALL_PAGES) {
      test(`@smoke announcement bar visible on ${name} page`, async () => {
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

    test('@smoke announcement bar message text is visible and not empty', async () => {
      await expect(w.messageText).toBeVisible({ timeout: 10000 });
      const text = await w.getMessageText();
      expect(text.length, 'message should not be empty').toBeGreaterThan(0);
    });

    test('announcement bar message is consistent across pages', async () => {
      await w.goto(URLS.home);
      const homeText = await w.getMessageText();

      await w.goto(URLS.product);
      const productText = await w.getMessageText();

      expect(productText).toBe(homeText);
    });

    test('@smoke CTA button is visible and enabled (if configured)', async () => {
      const count = await w.ctaButton.count();
      if (count === 0) {
        test.skip(true, 'No CTA button configured for this bar');
        return;
      }
      await expect(w.ctaButton).toBeVisible();
      await expect(w.ctaButton).toBeEnabled();
    });

    test('@smoke CTA link is visible (if configured)', async () => {
      const count = await w.ctaLink.count();
      if (count === 0) {
        test.skip(true, 'No CTA link configured for this bar');
        return;
      }
      await expect(w.ctaLink).toBeVisible();
    });

  });

  // ════════════════════════════════════════════════════════════════════════
  // 3. CLOSE BUTTON
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Close button', () => {

    test('close button dismisses the announcement bar', async () => {
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
  // 4. RESPONSIVE LAYOUT
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