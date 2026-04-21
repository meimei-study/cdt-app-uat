import { Page, Locator } from '@playwright/test';
import { BaseWidgetPage } from './base-widget.page';
import { ANNOUNCEMENT_BAR_ID } from '../../fixtures/cdt-test-data';

export class AnnouncementBarWidget extends BaseWidgetPage {

  readonly barId: string;
  readonly selector: string;

  // ── Container ─────────────────────────────────────────────────────────────
  readonly bar: Locator;

  // ── Content ───────────────────────────────────────────────────────────────
  readonly flashSaleText: Locator;
  readonly hurryUpText: Locator;
  readonly getDiscountLink: Locator;
  readonly shopNowButton: Locator;

  // ── Discount code ─────────────────────────────────────────────────────────
  readonly discountCode: Locator;
  readonly discountCodeInner: Locator;
  readonly copyButton: Locator;

  // ── Email capture ─────────────────────────────────────────────────────────
  readonly emailInput: Locator;
  readonly signUpButton: Locator;
  readonly remindMeButton: Locator;

  // ── Post sign-up states ───────────────────────────────────────────────────
  readonly validationMessage: Locator;  // "Enter email address"
  readonly successTitle: Locator;       // "Thank you!"
  readonly successDiscount: Locator;    // "To get your 30%OFF discount,"
  readonly successDiscountCode: Locator;
  readonly successCopyButton: Locator;

  // ── Close button ──────────────────────────────────────────────────────────
  readonly closeButton: Locator;

  constructor(page: Page, barId: string = ANNOUNCEMENT_BAR_ID) {
    super(page);
    this.barId    = barId;
    this.selector = `#sct-timer-${barId}`;

    const s = this.selector;

    this.bar = page.locator(s);

    // Content
    this.flashSaleText   = page.locator(s).getByText('Flash sale!');
    this.hurryUpText     = page.locator(s).getByText('Hurry up!');
    this.getDiscountLink = page.locator(s).getByRole('link', { name: 'Get discount' });
    this.shopNowButton   = page.locator(s).getByRole('link', { name: 'Shop now' });

    // Discount code block
    this.discountCode      = page.locator(`${s} .sct-timer-discount`);
    this.discountCodeInner = page.locator(`${s} .sct-timer-discount-inner`);
    this.copyButton        = page.locator(`${s} .copy-button-inner`).first();

    // Email capture
    this.emailInput    = page.getByRole('textbox', { name: 'Your email *' });
    this.signUpButton  = page.locator(s).filter({ hasText: 'SIGN UP' }).locator('.email-button');
    this.remindMeButton = page.locator(`#remind-me__button-${barId}`);

    // Post sign-up
    this.validationMessage  = page.getByText('Enter email address');
    this.successTitle        = page.getByText('Thank you!');
    this.successDiscount     = page.getByText('To get your 30%OFF discount,');
    this.successDiscountCode = page.getByText('haha123').first();
    this.successCopyButton   = page.locator('.copy-button-inner').first();

    // Close button (x) top-right of bar
    this.closeButton = page.locator(`${s} .sct-timer-close-btn`);
  }

  async getDiscountCodeText(): Promise<string> {
    return (await this.discountCodeInner.innerText()).trim();
  }
}