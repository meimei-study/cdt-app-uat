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
```

To run a single test by title:
```bash
npx playwright test --grep "test title here"
```

## Architecture

### Page Object Model (POM)

All widget interactions are encapsulated in page object classes under `pages/`:

- **`BaseWidgetPage`** (`pages/cdt/base-widget.page.ts`) — shared base for all CDT widgets. Provides `unlockStorefront()` (handles Shopify password gate) and `goto(path)` (navigates and waits for `networkidle`).
- **Widget classes** (e.g., `CountdownTimerWidget`) extend `BaseWidgetPage`, expose `readonly Locator` properties, and add helper methods like `getSecondsValue()` that parse numeric text from the DOM.

### Test Organization

Tests live in `tests/cdt/` as `.spec.ts` files. Each test file:
1. Uses `test.beforeEach` to call `unlockStorefront()` then navigate to the relevant page.
2. Groups related cases with `test.describe()`.
3. Tags tests with `@smoke` (core functionality, run on every deploy) or `@responsive` (layout checks across viewports).

### Shared Fixtures

`fixtures/cdt-test-data.ts` exports:
- `STORE_URL`, `STORE_PASSWORD` (read from `process.env.SHOPIFY_PASSWORD`)
- `URLS` — named paths: `home`, `collections`, `product`
- `VIEWPORTS` — `desktop` (1920×1080), `tablet` (768×1024), `mobile` (375×667)

### Adding a New Widget

1. Create `pages/cdt/<widget-name>.widget.ts` extending `BaseWidgetPage`.
2. Declare `readonly` locators in the constructor using Playwright CSS/attribute selectors.
3. Add helper methods for extracting parsed values if needed.
4. Create `tests/cdt/<widget-name>.spec.ts` following the existing countdown-timer pattern.
5. Add the widget's page URL to `URLS` in `fixtures/cdt-test-data.ts` if needed.

### Key Playwright Config Notes

- `headless: false` by default — the browser is always visible unless overridden via `npm test` (which passes `--headed=false`)
- `fullyParallel: false` — tests run sequentially to avoid storefront session conflicts
- `retries: 1` — each failing test is automatically retried once
- Screenshots and video are captured only on failure
- Assertion timeout is 5 seconds; test timeout is 30 seconds

### File Conventions

- New CDT widget page objects: TypeScript (`.ts`)
- Legacy login page: JavaScript (`.js`) — do not convert
- Mix of CommonJS (`pages/LoginPage.js`) and ES module style TypeScript coexists; `tsconfig.json` targets CommonJS output
