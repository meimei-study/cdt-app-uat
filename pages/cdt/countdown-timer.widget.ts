import { Page, Locator } from '@playwright/test';
import { BaseWidgetPage } from './base-widget.page';

export class CountdownTimerWidget extends BaseWidgetPage {

  // ── Header Timer Bar (sct-timer-01-flipper) ──────────────────────────────
  readonly headerTimerBar: Locator;
  readonly headerDiscountCode: Locator;
  readonly headerShopNowButton: Locator;
  readonly headerGetDiscountLink: Locator;
  readonly headerRemindMeButton: Locator;
  readonly headerCloseButton: Locator;

  // Header timer — digit group containers
  readonly headerDaysGroup: Locator;
  readonly headerHoursGroup: Locator;
  readonly headerMinutesGroup: Locator;
  readonly headerSecondsGroup: Locator;

  // Header timer — labels
  readonly daysLabel: Locator;
  readonly hoursLabel: Locator;
  readonly minutesLabel: Locator;
  readonly secondsLabel: Locator;

  // ── Inline countdown timer (product page) ────────────────────────────────
  readonly inlineTimer: Locator;

  // ── Popup countdown timer ────────────────────────────────────────────────
  readonly popupTimer: Locator;
  readonly popupCloseButton: Locator;

  constructor(page: Page) {
    super(page);

    const header = '.sct-timer.sct-timer-01-flipper';

    this.headerTimerBar = page.locator(header);

    // Discount code — .sct-timer-email-capture has display:none
    // Visible element is .sct-timer-center .sct-timer-discount
    this.headerDiscountCode = page.locator(`${header} .sct-timer-center .sct-timer-discount`);

    this.headerShopNowButton   = page.locator(`${header} .sct-timer-button a`);
    this.headerGetDiscountLink = page.locator(`${header} .sct-timer-link a`);
    this.headerRemindMeButton  = page.locator(`${header} .sct-timer-remind-me button`);
    this.headerCloseButton     = page.locator(`${header} button.sct-timer-close-btn`);

    // Digit group containers — used for visibility & value reading
    this.headerDaysGroup    = page.locator(`${header} .sct-rotor-group[data-timer-group="days"]`);
    this.headerHoursGroup   = page.locator(`${header} .sct-rotor-group[data-timer-group="hours"]`);
    this.headerMinutesGroup = page.locator(`${header} .sct-rotor-group[data-timer-group="minutes"]`);
    this.headerSecondsGroup = page.locator(`${header} .sct-rotor-group[data-timer-group="seconds"]`);

    this.daysLabel    = page.locator(`${header} .sct-rotor-group[data-timer-group="days"] .sct-rotor-group-heading`);
    this.hoursLabel   = page.locator(`${header} .sct-rotor-group[data-timer-group="hours"] .sct-rotor-group-heading`);
    this.minutesLabel = page.locator(`${header} .sct-rotor-group[data-timer-group="minutes"] .sct-rotor-group-heading`);
    this.secondsLabel = page.locator(`${header} .sct-rotor-group[data-timer-group="seconds"] .sct-rotor-group-heading`);

    this.inlineTimer = page.locator('.timer-countdown');

    // Popup timer: div[id^="popup-settings__box"] (display:none by default,
    // shown based on store config — skip if not present)
    this.popupTimer       = page.locator('[id^="popup-settings__box"]');
    this.popupCloseButton = page.locator('[id^="popup-settings__box"] button');
  }

  // ── Header digit readers via evaluate() ──────────────────────────────────
  // evaluate() reads JS state directly — immune to mid-flip DOM changes

  private async readDigitValue(group: Locator): Promise<number> {
    const val = await group.evaluate((el) => {
      // Try rotor-top first
      const rotorTop = el.querySelector('[data-timer-element="rotor-top"]');
      if (rotorTop) {
        const num = parseInt((rotorTop.textContent || '').trim(), 10);
        if (!isNaN(num)) return num;
      }
      // Fallback: sct-rotor-leaf
      const leaf = el.querySelector('.sct-rotor-leaf');
      if (leaf) {
        const num = parseInt((leaf.textContent || '').trim(), 10);
        if (!isNaN(num)) return num;
      }
      // Fallback: entire wrapper text
      const wrapper = el.querySelector('.sct-rotors-wrapper');
      if (wrapper) {
        const num = parseInt((wrapper.textContent || '').replace(/\s/g, ''), 10);
        if (!isNaN(num)) return num;
      }
      return -1;
    });
    return val;
  }

  async getHeaderDaysValue():    Promise<number> { return this.readDigitValue(this.headerDaysGroup); }
  async getHeaderHoursValue():   Promise<number> { return this.readDigitValue(this.headerHoursGroup); }
  async getHeaderMinutesValue(): Promise<number> { return this.readDigitValue(this.headerMinutesGroup); }
  async getHeaderSecondsValue(): Promise<number> { return this.readDigitValue(this.headerSecondsGroup); }
}