import { test, expect } from '@playwright/test';
import { CountdownTimerWidget } from '../../pages/cdt/countdown-timer.widget';
import { URLS, VIEWPORTS } from '../../fixtures/cdt-test-data';

test.describe('Countdown Timer Widget', () => {
  let widget: CountdownTimerWidget;

  test.beforeEach(async ({ page }) => {
    widget = new CountdownTimerWidget(page);
    await widget.unlockStorefront();
    await widget.goto(URLS.product);
    await page.waitForTimeout(1000);
  });

  // ── Display & Rendering ──────────────────────────────────────────────────

  test('@smoke countdown timer is visible on product page', async () => {
    await expect(widget.inlineTimer).toBeVisible();
  });

  test('@smoke timer displays days, hours, minutes, seconds', async () => {
    await expect(widget.daysLabel).toBeVisible();
    await expect(widget.hoursLabel).toBeVisible();
    await expect(widget.minutesLabel).toBeVisible();
    await expect(widget.secondsLabel).toBeVisible();

    await expect(widget.daysValue).toBeVisible();
    await expect(widget.hoursValue).toBeVisible();
    await expect(widget.minutesValue).toBeVisible();
    await expect(widget.secondsValue).toBeVisible();
  });

  test('@responsive timer renders correctly on desktop (1920×1080)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await widget.goto(URLS.product);
    await expect(widget.inlineTimer).toBeVisible();
    const box = await widget.inlineTimer.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
  });

  test('@responsive timer renders correctly on tablet (768×1024)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await widget.goto(URLS.product);
    await expect(widget.inlineTimer).toBeVisible();
    const box = await widget.inlineTimer.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
  });

  test('@responsive timer renders correctly on mobile (375×667)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await widget.goto(URLS.product);
    await expect(widget.inlineTimer).toBeVisible();
    const box = await widget.inlineTimer.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
  });

  test('timer has no layout overflow', async ({ page }) => {
    const timerBox = await widget.inlineTimer.boundingBox();
    const viewportWidth = page.viewportSize()!.width;
    expect(timerBox).not.toBeNull();
    expect(timerBox!.x + timerBox!.width).toBeLessThanOrEqual(viewportWidth + 1);
  });

  // ── Real-time Update ─────────────────────────────────────────────────────

  test('@smoke seconds decrement in real-time', async ({ page }) => {
    const before = await widget.getSecondsValue();
    await page.waitForTimeout(3000);
    const after = await widget.getSecondsValue();

    // Seconds should have decreased (accounting for possible minute rollover)
    const decreased = after < before || (before < 3 && after >= 57);
    expect(decreased, `seconds before: ${before}, after: ${after}`).toBe(true);
  });

  test('timer digits are numeric and within valid range', async () => {
    const days = await widget.getDaysValue();
    const hours = await widget.getHoursValue();
    const minutes = await widget.getMinutesValue();
    const seconds = await widget.getSecondsValue();

    expect(days).toBeGreaterThanOrEqual(0);
    expect(hours).toBeGreaterThanOrEqual(0);
    expect(hours).toBeLessThanOrEqual(23);
    expect(minutes).toBeGreaterThanOrEqual(0);
    expect(minutes).toBeLessThanOrEqual(59);
    expect(seconds).toBeGreaterThanOrEqual(0);
    expect(seconds).toBeLessThanOrEqual(59);
  });

  test('timer does not display negative values', async ({ page }) => {
    await page.waitForTimeout(2000);
    const days = await widget.getDaysValue();
    const hours = await widget.getHoursValue();
    const minutes = await widget.getMinutesValue();
    const seconds = await widget.getSecondsValue();

    expect(days).toBeGreaterThanOrEqual(0);
    expect(hours).toBeGreaterThanOrEqual(0);
    expect(minutes).toBeGreaterThanOrEqual(0);
    expect(seconds).toBeGreaterThanOrEqual(0);
  });

  // ── Popup Timer ──────────────────────────────────────────────────────────

  test('@smoke popup countdown timer is visible on product page', async () => {
    await expect(widget.popupTimer).toBeVisible();
  });

  test('popup timer close button dismisses the timer', async ({ page }) => {
    await expect(widget.popupTimer).toBeVisible();
    await widget.popupCloseButton.click();
    await expect(widget.popupTimer).not.toBeVisible({ timeout: 3000 });
  });
});
