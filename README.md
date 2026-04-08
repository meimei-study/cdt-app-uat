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
STOREFRONT_PASSWORD=your_password_here
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

## Project Structure

```
CDT-UAT/
├── tests/
│   ├── login.spec.js                    # Storefront authentication
│   └── cdt/
│       └── countdown-timer.spec.ts      # Countdown timer widget tests
├── pages/
│   ├── LoginPage.js                     # Login page object
│   └── cdt/
│       ├── base-widget.page.ts          # Base class for CDT widget pages
│       └── countdown-timer.widget.ts    # Countdown timer page object
├── fixtures/
│   └── cdt-test-data.ts                 # Shared test constants (URLs, viewports)
├── playwright.config.js
├── tsconfig.json
└── .env                                 # Environment variables (not committed)
```

## Test Tags

Tests are tagged for selective execution:

- `@smoke` — core functionality, run on every deployment
- `@responsive` — layout checks across desktop, tablet, and mobile viewports

## Configuration

Key settings in [playwright.config.js](playwright.config.js):

- **Base URL**: `https://automation-test-uat-v2.myshopify.com`
- **Browser**: Chromium (Desktop Chrome)
- **Retries**: 1 on failure
- **Artifacts**: screenshots and video captured on failure
- **Report**: HTML report saved to `playwright-report/`
