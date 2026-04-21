import { test, expect } from '@playwright/test';
import { CountdownTimerWidget } from '../../pages/cdt/countdown-timer.widget';
import { URLS, VIEWPORTS, ALL_PAGES, TEST_EMAIL, ANNOUNCEMENT_BAR_ID } from '../../fixtures/cdt-test-data';

test.describe('Header Timer Bar', () => {
  let w: CountdownTimerWidget;

  test.beforeEach(async ({ page }) => {
    w = new CountdownTimerWidget(page);
  });

  // ════════════════════════════════════════════════════════════════════════
  // 1. VISIBILITY — across all pages
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Visibility — all pages', () => {

    for (const { name, path } of ALL_PAGES) {
      test(`@smoke timer bar is visible on ${name} page`, async () => {
        await w.goto(path);
        await expect(w.timerBar).toBeVisible({ timeout: 10000 });
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
      await expect(w.timerBar).toContainText('Hurry up!');
    });

    test('@smoke "Get discount" link is visible', async () => {
      await expect(w.getDiscountLink).toBeVisible();
    });

    test('@smoke "Shop now" button is visible and enabled', async () => {
      await expect(w.shopNowButton).toBeVisible();
      await expect(w.shopNowButton).toBeEnabled();
    });

    test('@smoke discount code "haha123" is visible', async () => {
      await expect(w.discountCode).toBeVisible();
    });

    test('@smoke copy button is visible and clickable', async () => {
      await expect(w.copyButton).toBeVisible();
      await w.copyButton.click();
      await w.page.waitForTimeout(500);
    });

    test('@smoke "Remind me" button is visible', async () => {
      await expect(w.remindMeButton).toBeVisible();
      await expect(w.remindMeButton).toContainText('Remind me');
    });

  });

  // ════════════════════════════════════════════════════════════════════════
  // 3. DIGITS — display & labels
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Digits', () => {

    test.beforeEach(async () => { await w.goto(URLS.home); });

    test('@smoke all digit groups are visible', async () => {
      await expect(w.daysGroup).toBeVisible();
      await expect(w.hoursGroup).toBeVisible();
      await expect(w.minutesGroup).toBeVisible();
      await expect(w.secondsGroup).toBeVisible();
    });

    test('@smoke DAYS / HOURS / MINUTES / SECONDS labels are visible', async () => {
      await expect(w.daysLabel).toBeVisible();
      await expect(w.hoursLabel).toBeVisible();
      await expect(w.minutesLabel).toBeVisible();
      await expect(w.secondsLabel).toBeVisible();
    });

    test('digit values are numeric and within valid range', async () => {
      const days    = await w.getDaysValue();
      const hours   = await w.getHoursValue();
      const minutes = await w.getMinutesValue();
      const seconds = await w.getSecondsValue();

      expect(days,    'days >= 0').toBeGreaterThanOrEqual(0);
      expect(hours,   'hours 0–23').toBeGreaterThanOrEqual(0);
      expect(hours,   'hours 0–23').toBeLessThanOrEqual(23);
      expect(minutes, 'minutes 0–59').toBeGreaterThanOrEqual(0);
      expect(minutes, 'minutes 0–59').toBeLessThanOrEqual(59);
      expect(seconds, 'seconds 0–59').toBeGreaterThanOrEqual(0);
      expect(seconds, 'seconds 0–59').toBeLessThanOrEqual(59);
    });

    test('digits do not display negative values', async ({ page }) => {
      await page.waitForTimeout(2000);
      expect(await w.getDaysValue()).toBeGreaterThanOrEqual(0);
      expect(await w.getHoursValue()).toBeGreaterThanOrEqual(0);
      expect(await w.getMinutesValue()).toBeGreaterThanOrEqual(0);
      expect(await w.getSecondsValue()).toBeGreaterThanOrEqual(0);
    });

  });

  // ════════════════════════════════════════════════════════════════════════
  // 4. REAL-TIME COUNTDOWN
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Real-time countdown', () => {

    test('@smoke seconds decrement in real-time', async ({ page }) => {
      await w.goto(URLS.home);

      // Wait for page to stabilize before reading first value
      await page.waitForTimeout(1000);
      const before = await w.getSecondsValue();

      // Poll every 500 ms for up to 6 s — stop as soon as the value changes.
      // A fixed 4 s sleep is fragile when the read happens to land on the same
      // digit after a full-minute rollover or when the DOM is briefly stale.
      let after = before;
      for (let i = 0; i < 12; i++) {
        await page.waitForTimeout(500);
        after = await w.getSecondsValue();
        if (after !== before) break;
      }

      const decreased  = after < before;
      const rolledOver = after > before; // any increase means minute rolled over
      expect(
        decreased || rolledOver,
        `Expected seconds to change from ${before} but it stayed at ${after} after 6 s`
      ).toBe(true);
    });

    test('countdown is consistent across page navigation', async () => {
      await w.goto(URLS.home);
      const homeDays  = await w.getDaysValue();
      const homeHours = await w.getHoursValue();

      await w.goto(URLS.product);
      const productDays  = await w.getDaysValue();
      const productHours = await w.getHoursValue();

      expect(productDays).toBe(homeDays);
      expect(Math.abs(productHours - homeHours)).toBeLessThanOrEqual(1);
    });

  });

  // ════════════════════════════════════════════════════════════════════════
  // 5. REMIND ME POPUP
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Remind me popup', () => {

    test.beforeEach(async () => {
      await w.goto(URLS.home);
      // Close Announcement Bar only — it overlaps the Remind me button
      await w.dismissAnnouncementBar(ANNOUNCEMENT_BAR_ID);
      // Scroll Remind me button into view after bar is dismissed
      await w.remindMeButton.scrollIntoViewIfNeeded();
    });

    test('@smoke clicking "Remind me" opens popup', async () => {
      await w.remindMeButton.click();
      await expect(w.popup).toBeVisible({ timeout: 5000 });
    });

    test('@smoke popup shows email input', async () => {
      await w.remindMeButton.click();
      await expect(w.popupEmailInput).toBeVisible();
      await expect(w.popup).toContainText('Email Address');
    });

    test('@smoke popup shows consent checkbox', async () => {
      await w.remindMeButton.click();
      await expect(w.popupConsentCheckbox).toBeVisible();
      await expect(w.popup).toContainText('Yes, send me emails so i know');
    });

    test('@smoke popup shows "Register" button', async () => {
      await w.remindMeButton.click();
      await expect(w.popup).toContainText('Register');
      await expect(w.popupRegisterButton).toBeVisible();
    });

    test('@smoke popup shows notification message', async () => {
      await w.remindMeButton.click();
      await expect(w.popup).toContainText('We will notify you when flash');
      await expect(w.popup).toContainText('Alert Me Via Email!');
    });

    test('@smoke register with valid email shows success state', async () => {
      await w.remindMeButton.click();
      await w.popupEmailInput.fill(TEST_EMAIL);
      await w.popupConsentCheckbox.check();
      await w.popupRegisterButton.click();
      await expect(w.popupSuccessText).toBeVisible({ timeout: 8000 });
      await expect(w.popupSuccessCloseButton).toBeVisible();
    });

    test('success state "Close" button dismisses popup', async () => {
      await w.remindMeButton.click();
      await w.popupEmailInput.fill(TEST_EMAIL);
      await w.popupConsentCheckbox.check();
      await w.popupRegisterButton.click();
      await expect(w.popupSuccessCloseButton).toBeVisible({ timeout: 8000 });
      await w.popupSuccessCloseButton.click();
      await expect(w.popup).not.toBeVisible({ timeout: 3000 });
    });

  });

  // ════════════════════════════════════════════════════════════════════════
  // 6. CLOSE BUTTON
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Close button', () => {

    test('close button dismisses the timer bar', async () => {
      await w.goto(URLS.home);
      await expect(w.timerBar).toBeVisible();
      await w.closeButton.click();
      await expect(w.timerBar).not.toBeVisible({ timeout: 3000 });
    });

    test('timer bar stays hidden after navigating to another page', async () => {
      await w.goto(URLS.home);
      await w.closeButton.click();
      await expect(w.timerBar).not.toBeVisible({ timeout: 3000 });
      await w.goto(URLS.product);
      await expect(w.timerBar).not.toBeVisible({ timeout: 3000 });
    });

  });

  // ════════════════════════════════════════════════════════════════════════
  // 7. RESPONSIVE LAYOUT
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Responsive layout', () => {

    for (const [name, size] of Object.entries(VIEWPORTS)) {
      test(`@responsive renders on ${name} (${size.width}×${size.height})`, async ({ page }) => {
        await page.setViewportSize(size);
        await w.goto(URLS.home);
        await expect(w.timerBar).toBeVisible();
        const box = await w.timerBar.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.width).toBeGreaterThan(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(size.width + 1);
      });
    }

  });

});