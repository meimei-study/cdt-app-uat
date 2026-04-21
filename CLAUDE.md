# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

End-to-end test suite for CDT (Countdown Timer & Discount Tools) Shopify app widgets, targeting the storefront at `https://review-jan.myshopify.com`. Built with Playwright + TypeScript.

## Setup

```bash
npm install
npx playwright install chromium
```

Create `.env` in the project root:
```
SHOPIFY_PASSWORD=your_storefront_password
```

## Commands

```bash
npm test                      # Run all tests (headless)
npm run test:headed           # Run with visible browser
npm run test:debug            # Playwright debug mode (step-through)
npm run test:cdt              # CDT widget tests only (tests/cdt/)
npm run test:cdt:smoke        # Smoke tests tagged @smoke
npm run test:cdt:responsive   # Responsive tests tagged @responsive
npm run report                # Open HTML report from last run
```

To run a single test file:
```bash
npx playwright test tests/cdt/countdown-timer.spec.ts
npx playwright test tests/cdt/announcement-bar.spec.ts
```

To run a single test by title:
```bash
npx playwright test --grep "test title here"
```

## Architecture

### Authentication & Session Storage

`tests/setup/auth.setup.ts` runs as a Playwright setup project before all main tests. It handles the Shopify password gate and saves the authenticated session to `.auth/storefront.json`. All subsequent test projects reuse this saved session via `storageState` in `playwright.config.js` — they do **not** call `unlockStorefront()` in `beforeEach`.

### Page Object Model (POM)

All widget interactions are encapsulated in page object classes under `pages/`:

- **`BaseWidgetPage`** (`pages/cdt/base-widget.page.ts`) — shared base for all CDT widgets. Provides:
  - `unlockStorefront()` — handles Shopify password gate (used by `auth.setup.ts` only)
  - `goto(path)` — navigates and waits for `domcontentloaded`, then pauses 1.5 s for CDT widget JS to initialize
- **`CountdownTimerWidget`** (`pages/cdt/countdown-timer.widget.ts`) — extends `BaseWidgetPage`. Covers the sticky header timer bar (ID: `87142`). Exposes `readonly Locator` properties for all UI elements plus:
  - `getDaysValue()`, `getHoursValue()`, `getMinutesValue()`, `getSecondsValue()` — parse numeric values from the flip-clock DOM by collecting **all** `[data-timer-element="rotor-top"]` elements per digit group and concatenating their text, returning a full two-digit integer (e.g. `33`, not `3`).
  - `dismissAnnouncementBar(id)` — closes the announcement bar by its ID when it visually overlaps the popup under test.
- **`AnnouncementBarWidget`** (`pages/cdt/announcement-bar.widget.ts`) — extends `BaseWidgetPage`. Covers the full-width announcement bar (ID: `87143`). Exposes locators for content, discount code, email capture, sign-up states, and:
  - `getDiscountCodeText()` — returns trimmed inner text of the discount code element.

### Test Organization

Tests live in `tests/cdt/` as `.spec.ts` files. Each test file:
1. Uses `test.beforeEach` to call `w.goto(URLS.somePage)` — session is already authenticated via the setup project.
2. Groups related cases with `test.describe()`.
3. Tags tests with `@smoke` (core functionality, run on every deploy) or `@responsive` (layout checks across viewports).

### Shared Fixtures

`fixtures/cdt-test-data.ts` exports:

| Export | Value / Source |
|--------|---------------|
| `STORE_URL` | `https://review-jan.myshopify.com` |
| `STORE_PASSWORD` | `process.env.SHOPIFY_PASSWORD` |
| `HEADER_TIMER_ID` | `process.env.CDT_HEADER_TIMER_ID` or `'87142'` |
| `ANNOUNCEMENT_BAR_ID` | `process.env.CDT_ANNOUNCEMENT_BAR_ID` or `'87143'` |
| `URLS` | `home`, `collections`, `product`, `cart`, `contact`, `flashSale` |
| `ALL_PAGES_WITH_HEADER_TIMER` | Array of `{ name, path }` for the 5 pages that show the header timer |
| `ALL_PAGES` | Same 5 pages — used by announcement bar visibility tests |
| `VIEWPORTS` | `desktop` (1920×1080), `tablet` (768×1024), `mobile` (375×667) |
| `TEST_EMAIL` | `test.auto@apps-cyclone.com` — used for email capture tests |

### Adding a New Widget

1. Create `pages/cdt/<widget-name>.widget.ts` extending `BaseWidgetPage`.
2. Declare `readonly` locators in the constructor using Playwright CSS/attribute selectors.
3. Add helper methods for extracting parsed values if needed.
4. Create `tests/cdt/<widget-name>.spec.ts` following the existing countdown-timer pattern.
5. Add the widget's ID constant to `fixtures/cdt-test-data.ts` (e.g. `NEW_WIDGET_ID`).
6. Add page URLs to `URLS` in `fixtures/cdt-test-data.ts` if needed.

### Key Playwright Config Notes

- `headless: false` by default in both projects — browser is always visible unless overridden
- `fullyParallel: false` — tests run sequentially to avoid storefront session conflicts
- `retries: 1` — each failing test is automatically retried once
- Screenshots and video are captured only on failure
- Assertion timeout is **8 seconds**; test timeout is **30 seconds**

### Real-time Countdown Testing

The seconds decrement test polls every 500 ms for up to 6 s and breaks as soon as `getSecondsValue()` returns a different value from the initial read. This is more robust than a fixed-delay snapshot because:
- The flip clock DOM has two `[data-timer-element="rotor-top"]` elements per digit group (tens + units). `readDigitValue` concatenates both to produce the full two-digit value.
- A fixed 4 s wait with a single-digit read was flaky: if the window fell entirely within the same tens-decade (e.g. 39→33), the tens digit never changed and the test failed.

### File Conventions

- New CDT widget page objects: TypeScript (`.ts`)
- Legacy login page: JavaScript (`.js`) — do not convert
- Mix of CommonJS (`pages/LoginPage.js`) and ES module style TypeScript coexists; `tsconfig.json` targets CommonJS output
- `tsconfig.json` uses `lib: ["ES2020"]` (no `dom`). Inside `locator.evaluate()` callbacks, DOM method calls work at runtime but TypeScript has no DOM types — use `(r as any).textContent` or define a typed helper inside the callback.