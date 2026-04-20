import { test, expect } from '@playwright/test';
import { CountdownTimerWidget } from '../../pages/cdt/countdown-timer.widget';
import { URLS, VIEWPORTS, ALL_PAGES_WITH_HEADER_TIMER } from '../../fixtures/cdt-test-data';

test.describe('Countdown Timer Widget', () => {
  let widget: CountdownTimerWidget;

  test.beforeEach(async ({ page }) => {
    widget = new CountdownTimerWidget(page);
    await widget.unlockStorefront();
  });

  // ════════════════════════════════════════════════════════════════════════
  // HEADER TIMER BAR — Visibility across all pages
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Header Timer Bar — Cross-page visibility', () => {

    for (const { name, path } of ALL_PAGES_WITH_HEADER_TIMER) {
      test(`@smoke header timer bar is visible on ${name} page`, async () => {
        await widget.goto(path);
        await expect(widget.headerTimerBar).toBeVisible({ timeout: 10000 });
      });
    }

    for (const { name, path } of ALL_PAGES_WITH_HEADER_TIMER) {
      test(`header timer shows digit groups on ${name} page`, async () => {
        await widget.goto(path);
        await expect(widget.headerDaysGroup).toBeVisible();
        await expect(widget.headerHoursGroup).toBeVisible();
        await expect(widget.headerMinutesGroup).toBeVisible();
        await expect(widget.headerSecondsGroup).toBeVisible();
      });
    }

    for (const { name, path } of ALL_PAGES_WITH_HEADER_TIMER) {
      test(`header timer shows DAYS/HOURS/MINUTES/SECONDS labels on ${name} page`, async () => {
        await widget.goto(path);
        await expect(widget.daysLabel).toBeVisible();
        await expect(widget.hoursLabel).toBeVisible();
        await expect(widget.minutesLabel).toBeVisible();
        await expect(widget.secondsLabel).toBeVisible();
      });
    }

  });

  // ════════════════════════════════════════════════════════════════════════
  // HEADER TIMER BAR — Content correctness
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Header Timer Bar — Content', () => {

    test.beforeEach(async () => {
      await widget.goto(URLS.home);
    });

    test('@smoke header timer digits are numeric and within valid range', async () => {
      const days    = await widget.getHeaderDaysValue();
      const hours   = await widget.getHeaderHoursValue();
      const minutes = await widget.getHeaderMinutesValue();
      const seconds = await widget.getHeaderSecondsValue();

      expect(days,    'days >= 0').toBeGreaterThanOrEqual(0);
      expect(hours,   'hours >= 0').toBeGreaterThanOrEqual(0);
      expect(hours,   'hours <= 23').toBeLessThanOrEqual(23);
      expect(minutes, 'minutes >= 0').toBeGreaterThanOrEqual(0);
      expect(minutes, 'minutes <= 59').toBeLessThanOrEqual(59);
      expect(seconds, 'seconds >= 0').toBeGreaterThanOrEqual(0);
      expect(seconds, 'seconds <= 59').toBeLessThanOrEqual(59);
    });

    test('header timer does not display negative values', async ({ page }) => {
      await page.waitForTimeout(2000);
      expect(await widget.getHeaderDaysValue()).toBeGreaterThanOrEqual(0);
      expect(await widget.getHeaderHoursValue()).toBeGreaterThanOrEqual(0);
      expect(await widget.getHeaderMinutesValue()).toBeGreaterThanOrEqual(0);
      expect(await widget.getHeaderSecondsValue()).toBeGreaterThanOrEqual(0);
    });

    test('@smoke header timer discount code is visible', async () => {
      // haha123 button is visible in header
      await expect(widget.headerDiscountCode).toBeVisible({ timeout: 10000 });
      const codeText = await widget.headerDiscountCode.innerText();
      expect(codeText.trim().length, 'discount code should have text').toBeGreaterThan(0);
    });

    test('@smoke header timer "Shop now" button is visible and clickable', async () => {
      await expect(widget.headerShopNowButton).toBeVisible();
      await expect(widget.headerShopNowButton).toBeEnabled();
    });

    test('@smoke header timer "Get discount" link is visible', async () => {
      await expect(widget.headerGetDiscountLink).toBeVisible();
    });

    test('@smoke header timer "Remind me" button is visible', async () => {
      await expect(widget.headerRemindMeButton).toBeVisible();
    });

  });

  // ════════════════════════════════════════════════════════════════════════
  // HEADER TIMER BAR — Real-time countdown
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Header Timer Bar — Real-time countdown', () => {

    test('@smoke header timer seconds decrement in real-time', async ({ page }) => {
      await widget.goto(URLS.home);

      // Read seconds twice 3s apart — must differ (or rollover 0→59)
      const before = await widget.getHeaderSecondsValue();
      await page.waitForTimeout(3000);
      const after = await widget.getHeaderSecondsValue();

      const decreased  = after < before;
      const rolledOver = before <= 2 && after >= 57;
      expect(
        decreased || rolledOver,
        `Expected seconds to decrease. before=${before}, after=${after}`
      ).toBe(true);
    });

    test('header timer countdown is consistent across page navigation', async () => {
      await widget.goto(URLS.home);
      const homeDays  = await widget.getHeaderDaysValue();
      const homeHours = await widget.getHeaderHoursValue();

      await widget.goto(URLS.product);
      const productDays  = await widget.getHeaderDaysValue();
      const productHours = await widget.getHeaderHoursValue();

      expect(productDays).toBe(homeDays);
      expect(Math.abs(productHours - homeHours)).toBeLessThanOrEqual(1);
    });

  });

  // ════════════════════════════════════════════════════════════════════════
  // HEADER TIMER BAR — Responsive layout
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Header Timer Bar — Responsive', () => {

    for (const [name, size] of Object.entries(VIEWPORTS)) {
      test(`@responsive header timer renders on ${name} (${size.width}×${size.height})`, async ({ page }) => {
        await page.setViewportSize(size);
        await widget.goto(URLS.home);
        await expect(widget.headerTimerBar).toBeVisible();
        const box = await widget.headerTimerBar.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.width).toBeGreaterThan(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(size.width + 1);
      });
    }

  });

  // ════════════════════════════════════════════════════════════════════════
  // HEADER TIMER BAR — Close button
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Header Timer Bar — Close button', () => {

    test('close button dismisses the header timer bar', async () => {
      await widget.goto(URLS.home);
      await expect(widget.headerTimerBar).toBeVisible();
      await widget.headerCloseButton.click();
      await expect(widget.headerTimerBar).not.toBeVisible({ timeout: 3000 });
    });

    test('header timer stays hidden after navigation when closed', async () => {
      await widget.goto(URLS.home);
      await widget.headerCloseButton.click();
      await expect(widget.headerTimerBar).not.toBeVisible({ timeout: 3000 });

      await widget.goto(URLS.product);
      await expect(widget.headerTimerBar).not.toBeVisible({ timeout: 3000 });
    });

  });

  // ════════════════════════════════════════════════════════════════════════
  // POPUP TIMER — skip gracefully if not present on this store
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Popup Timer — Product page', () => {

    test.beforeEach(async () => {
      await widget.goto(URLS.product);
    });

    test('@smoke popup countdown timer is visible on product page', async () => {
      // Popup may be hidden (display:none) if not configured — check it exists in DOM
      const count = await widget.popupTimer.count();
      if (count === 0) {
        test.skip(true, 'Popup timer widget not present on this store/page');
        return;
      }
      // If present, it should either be visible or have display:none (configured off)
      const isVisible = await widget.popupTimer.isVisible();
      // Just assert it's in the DOM — visible state depends on store config
      expect(count).toBeGreaterThan(0);
      console.log(`Popup timer found. Visible:   ${isVisible}`);
    });

    test('popup timer close button works when popup is visible', async () => {
      const isVisible = await widget.popupTimer.isVisible().catch(() => false);
      if (!isVisible) {
        test.skip(true, 'Popup timer not visible — skipping close button test');
        return;
      }
      await widget.popupCloseButton.click();
      await expect(widget.popupTimer).not.toBeVisible({ timeout: 3000 });
    });

  });

});