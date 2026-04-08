import { Page, Locator } from '@playwright/test';
import { BaseWidgetPage } from './base-widget.page';

export class CountdownTimerWidget extends BaseWidgetPage {
  // Inline countdown timer on product page
  readonly inlineTimer: Locator;
  readonly inlineDigitsGrid: Locator;

  // Popup countdown timer
  readonly popupTimer: Locator;
  readonly popupCloseButton: Locator;

  // Digit units (shared between inline and popup)
  readonly daysValue: Locator;
  readonly hoursValue: Locator;
  readonly minutesValue: Locator;
  readonly secondsValue: Locator;

  readonly daysLabel: Locator;
  readonly hoursLabel: Locator;
  readonly minutesLabel: Locator;
  readonly secondsLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.inlineTimer = page.locator('.timer-countdown');
    this.inlineDigitsGrid = page.locator('.sct-timer-digits');

    this.popupTimer = page.locator('[id^="sct-timer"] .textTimer-sct');
    this.popupCloseButton = page.locator('[id^="sct-timer"] .icon-close');

    this.daysValue = page.locator('.sizer.days').first();
    this.hoursValue = page.locator('.sizer.hours').first();
    this.minutesValue = page.locator('.sizer.minutes').first();
    this.secondsValue = page.locator('.sizer.seconds').first();

    this.daysLabel = page.locator('.sct-digit-group-heading.days').first();
    this.hoursLabel = page.locator('.sct-digit-group-heading.hours').first();
    this.minutesLabel = page.locator('.sct-digit-group-heading.minutes').first();
    this.secondsLabel = page.locator('.sct-digit-group-heading.seconds').first();
  }

  async getSecondsValue(): Promise<number> {
    const text = await this.secondsValue.innerText();
    return parseInt(text.trim(), 10);
  }

  async getMinutesValue(): Promise<number> {
    const text = await this.minutesValue.innerText();
    return parseInt(text.trim(), 10);
  }

  async getHoursValue(): Promise<number> {
    const text = await this.hoursValue.innerText();
    return parseInt(text.trim(), 10);
  }

  async getDaysValue(): Promise<number> {
    const text = await this.daysValue.innerText();
    return parseInt(text.trim(), 10);
  }
}
