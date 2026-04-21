import { Page, Locator } from '@playwright/test';
import { BaseWidgetPage } from './base-widget.page';
import { HEADER_TIMER_ID } from '../../fixtures/cdt-test-data';

export class CountdownTimerWidget extends BaseWidgetPage {

  readonly timerId: string;
  readonly selector: string;

  // ── Container ─────────────────────────────────────────────────────────────
  readonly timerBar: Locator;

  // ── Header bar content ────────────────────────────────────────────────────
  readonly flashSaleText: Locator;
  readonly hurryUpText: Locator;
  readonly getDiscountLink: Locator;
  readonly shopNowButton: Locator;
  readonly discountCode: Locator;
  readonly copyButton: Locator;
  readonly remindMeButton: Locator;
  readonly closeButton: Locator;

  // ── Digit groups ──────────────────────────────────────────────────────────
  readonly daysGroup: Locator;
  readonly hoursGroup: Locator;
  readonly minutesGroup: Locator;
  readonly secondsGroup: Locator;

  // ── Labels ────────────────────────────────────────────────────────────────
  readonly daysLabel: Locator;
  readonly hoursLabel: Locator;
  readonly minutesLabel: Locator;
  readonly secondsLabel: Locator;

  // ── Popup (opened by "Remind me") ─────────────────────────────────────────
  readonly popup: Locator;
  readonly popupEmailInput: Locator;
  readonly popupConsentCheckbox: Locator;
  readonly popupRegisterButton: Locator;
  readonly popupCloseButton: Locator;

  // ── Popup post-register states ────────────────────────────────────────────
  readonly popupSuccessText: Locator;
  readonly popupSuccessCloseButton: Locator;

  constructor(page: Page, timerId: string = HEADER_TIMER_ID) {
    super(page);
    this.timerId  = timerId;
    this.selector = `#sct-timer-${timerId}`;

    const s = this.selector;
    const p = `#popup-settings__box-${timerId}`;

    // Header bar
    this.timerBar        = page.locator(s);
    this.flashSaleText   = page.locator(s).getByText('Flash sale!');
    this.hurryUpText     = page.locator(s).getByText('Hurry up!');
    this.getDiscountLink = page.locator(s).getByRole('link', { name: 'Get discount' });
    this.shopNowButton   = page.locator(s).getByRole('link', { name: 'Shop now' });
    this.discountCode    = page.locator(s).getByText('haha123');
    this.copyButton      = page.locator('.copy-button-inner').first();
    this.remindMeButton  = page.locator(`#remind-me__button-${timerId}`);
    this.closeButton     = page.locator(s).getByRole('button', { name: 'x' });

    // Digit groups
    this.daysGroup    = page.locator(`${s} .sct-rotor-group[data-timer-group="days"]`);
    this.hoursGroup   = page.locator(`${s} .sct-rotor-group[data-timer-group="hours"]`);
    this.minutesGroup = page.locator(`${s} .sct-rotor-group[data-timer-group="minutes"]`);
    this.secondsGroup = page.locator(`${s} .sct-rotor-group[data-timer-group="seconds"]`);

    // Labels
    this.daysLabel    = page.locator(`${s} .sct-rotor-group[data-timer-group="days"] .sct-rotor-group-heading`);
    this.hoursLabel   = page.locator(`${s} .sct-rotor-group[data-timer-group="hours"] .sct-rotor-group-heading`);
    this.minutesLabel = page.locator(`${s} .sct-rotor-group[data-timer-group="minutes"] .sct-rotor-group-heading`);
    this.secondsLabel = page.locator(`${s} .sct-rotor-group[data-timer-group="seconds"] .sct-rotor-group-heading`);

    // Popup
    this.popup                 = page.locator(p);
    this.popupEmailInput       = page.getByRole('textbox', { name: 'example@gmail.com' });
    this.popupConsentCheckbox  = page.getByRole('checkbox', { name: 'Yes, send me emails so i know' });
    this.popupRegisterButton   = page.getByRole('button', { name: 'Register' });
    this.popupCloseButton      = page.locator(`#popup-settings__close-btn-${timerId}`);

    // Popup success state
    this.popupSuccessText        = page.locator(p).getByText('Thank you for subscription,');
    this.popupSuccessCloseButton = page.getByRole('button', { name: 'Close' });
  }

  // ── Helper: dismiss Announcement Bar that may overlap popup ─────────────
  // Only closes specific widget by ID — never touches this countdown timer

  async dismissAnnouncementBar(announcementBarId: string) {
    // Scope close button strictly to Announcement Bar ID — both widgets share
    // the same .sct-timer-close-btn class so ID scoping is the only way to
    // distinguish them
    const closeBtn = this.page.locator(
      `#sct-timer-${announcementBarId} button.sct-timer-close-btn`
    );
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click();
      await this.page.waitForTimeout(500);
      // Confirm bar is gone before proceeding
      await this.page.locator(`#sct-timer-${announcementBarId}`)
        .waitFor({ state: 'hidden', timeout: 3000 })
        .catch(() => {});
    }
  }

  // ── Digit value readers ───────────────────────────────────────────────────

  private async readDigitValue(group: Locator): Promise<number> {
    return group.evaluate((el) => {
      // Each digit group has one rotor-top per digit position (tens, units).
      // Concatenate all of them to get the full value, e.g. ["3","3"] → 33.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toText = (r: any): string => (r.textContent || '').trim();
      const rotorTops = el.querySelectorAll('[data-timer-element="rotor-top"]');
      if (rotorTops.length > 0) {
        const text = Array.from(rotorTops).map(toText).join('');
        const n = parseInt(text, 10);
        if (!isNaN(n)) return n;
      }
      // Fallback: read one digit at a time from rotor leaves
      const leaves = el.querySelectorAll('.sct-rotor-leaf');
      if (leaves.length > 0) {
        const text = Array.from(leaves).map(r => toText(r).charAt(0)).join('');
        const n = parseInt(text, 10);
        if (!isNaN(n)) return n;
      }
      // Last resort: full wrapper text content
      const wrapper = el.querySelector('.sct-rotors-wrapper');
      if (wrapper) {
        // Each digit position repeats its value N times; take the first char per
        // rotor element to reconstruct the two-digit number.
        const rotors = wrapper.querySelectorAll('.sct-rotor, .sct-rotors-item');
        if (rotors.length > 0) {
          const text = Array.from(rotors)
            .map(r => toText(r).replace(/\D/g, '').charAt(0))
            .join('');
          const n = parseInt(text, 10);
          if (!isNaN(n)) return n;
        }
        const digits = (wrapper.textContent || '').replace(/\D/g, '');
        const n = parseInt(digits, 10);
        if (!isNaN(n)) return n;
      }
      return -1;
    });
  }

  async getDaysValue():    Promise<number> { return this.readDigitValue(this.daysGroup); }
  async getHoursValue():   Promise<number> { return this.readDigitValue(this.hoursGroup); }
  async getMinutesValue(): Promise<number> { return this.readDigitValue(this.minutesGroup); }
  async getSecondsValue(): Promise<number> { return this.readDigitValue(this.secondsGroup); }
}