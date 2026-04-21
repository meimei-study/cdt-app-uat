# CDT-UAT

End-to-end test suite for CDT (Countdown Timer & Discount Tools) Shopify app widgets, built with [Playwright](https://playwright.dev/).

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
npx playwright install chromium
```

Create a `.env` file in the project root:

```env
SHOPIFY_PASSWORD=your_password_here
```

## Running Tests

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (headless) |
| `npm run test:headed` | Run all tests with browser visible |
| `npm run test:debug` | Run in Playwright debug mode |
| `npm run test:cdt` | Run CDT widget tests only |
| `npm run test:cdt:smoke` | Run smoke tests (`@smoke` tag) |
| `npm run test:cdt:responsive` | Run responsive tests (`@responsive` tag) |
| `npm run report` | Open the last HTML test report |

Run a single test file:

```bash
npx playwright test tests/cdt/countdown-timer.spec.ts
npx playwright test tests/cdt/announcement-bar.spec.ts
```

Run a single test by title:

```bash
npx playwright test --grep "test title here"
```

## Project Structure

```
CDT-UAT/
├── .auth/
│   └── storefront.json              # Saved session cookies (auto-generated)
├── fixtures/
│   └── cdt-test-data.ts             # Shared constants (URLs, IDs, viewports, email)
├── pages/
│   ├── LoginPage.js                 # Legacy login page object
│   └── cdt/
│       ├── base-widget.page.ts      # Base class: unlockStorefront(), goto()
│       ├── countdown-timer.widget.ts # Countdown timer page object
│       └── announcement-bar.widget.ts # Announcement bar page object
├── tests/
│   ├── login.spec.js                # Legacy login test
│   ├── setup/
│   │   └── auth.setup.ts            # One-time storefront authentication
│   └── cdt/
│       ├── countdown-timer.spec.ts  # Countdown timer widget tests
│       └── announcement-bar.spec.ts # Announcement bar widget tests
├── playwright.config.js
├── tsconfig.json
└── .env                             # Environment variables (not committed)
```

## Widgets Under Test

| Widget | ID | Description |
|--------|----|-------------|
| Header Countdown Timer | `87142` | Sticky top bar with flip-clock digits, "Remind me" popup, discount code |
| Announcement Bar | `87143` | Full-width banner with email capture, discount code, sign-up flow |

## Test Tags

- `@smoke` — core functionality, run on every deployment
- `@responsive` — layout checks across desktop (1920×1080), tablet (768×1024), and mobile (375×667)

## Configuration

Key settings in [playwright.config.js](playwright.config.js):

- **Base URL**: `https://review-jan.myshopify.com`
- **Browser**: Chromium (Desktop Chrome)
- **Execution**: Sequential (`fullyParallel: false`) to avoid session conflicts
- **Retries**: 1 on failure
- **Timeouts**: 30s per test, 8s per assertion
- **Artifacts**: Screenshots and video captured on failure only
- **Auth**: `auth.setup.ts` runs once before all tests and saves cookies to `.auth/storefront.json`