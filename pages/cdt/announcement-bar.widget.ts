import { Page, Locator } from '@playwright/test';
import { BaseWidgetPage } from './base-widget.page';
import { ANNOUNCEMENT_BAR_TYPE } from '../../fixtures/cdt-test-data';

export class AnnouncementBarWidget extends BaseWidgetPage {

  // Dynamic selector — type set via CDT_ANNOUNCEMENT_BAR_TYPE in .env
  readonly widgetType: string;
  readonly selector: string;

  // ── Container ─────────────────────────────────────────────────────────────
  readonly bar: Locator;

  // ── Text content ──────────────────────────────────────────────────────────
  // Announcement bar typically shows a message + optional CTA (no countdown digits)
  readonly messageText: Locator;
  readonly ctaButton: Locator;
  readonly ctaLink: Locator;
  readonly closeButton: Locator;

  constructor(page: Page, widgetType: string = ANNOUNCEMENT_BAR_TYPE) {
    super(page);
    this.widgetType = widgetType;
    this.selector   = `.sct-timer.sct-timer-${widgetType}`;

    const s = this.selector;

    this.bar         = page.locator(s);
    this.messageText = page.locator(`${s} .sct-timer-text`);
    this.ctaButton   = page.locator(`${s} .sct-timer-button a`);
    this.ctaLink     = page.locator(`${s} .sct-timer-link a`);
    this.closeButton = page.locator(`${s} button.sct-timer-close-btn`);
  }

  async getMessageText(): Promise<string> {
    return (await this.messageText.innerText()).trim();
  }
}