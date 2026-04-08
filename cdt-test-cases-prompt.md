# Playwright Test Cases — CDT Storefront App Widgets

## Prompt: Add CDT App Widget Tests to Existing Playwright Project

```
Continue the current Playwright project. I need to add comprehensive end-to-end test cases for a Shopify app called "CDT" (Countdown Timer & related widgets) installed on the storefront: https://automation-test-uat-v2.myshopify.com/

The CDT app provides multiple widgets that display on the storefront. I need tests to verify each widget works correctly from the customer-facing side. The app admin configuration is done via the Shopify app dashboard — focus tests on storefront behavior only.

Create the following structure:

```
tests/
└── cdt/
    ├── countdown-timer.spec.ts
    ├── announcement-bar.spec.ts
    ├── quantity-bar.spec.ts
    ├── popup-modal.spec.ts
    ├── delivery-timer.spec.ts
    ├── popup-notifications.spec.ts
    ├── spinning-wheel.spec.ts
    ├── reserved-cart-timer.spec.ts
    ├── widget-integration.spec.ts
    └── ui-customization.spec.ts

pages/
└── cdt/
    ├── countdown-timer.widget.ts
    ├── announcement-bar.widget.ts
    ├── quantity-bar.widget.ts
    ├── popup-modal.widget.ts
    ├── delivery-timer.widget.ts
    ├── popup-notifications.widget.ts
    ├── spinning-wheel.widget.ts
    ├── reserved-cart-timer.widget.ts
    └── base-widget.page.ts

fixtures/
└── cdt-test-data.ts
```

Visit the storefront first to identify actual selectors, DOM structure, and widget behavior before writing code.

---

### 1. Countdown Timer — `countdown-timer.spec.ts`

**Display & Rendering:**
- Verify countdown timer is visible on the configured page (homepage / product page / collection page)
- Verify timer displays correct format: days, hours, minutes, seconds
- Verify timer renders correctly on desktop viewport (1920×1080)
- Verify timer renders correctly on tablet viewport (768×1024)
- Verify timer renders correctly on mobile viewport (375×667)
- Verify no layout shift or overflow when timer is displayed

**Real-time Update:**
- Verify seconds decrement in real-time (capture value, wait 3 seconds, verify value decreased by ~3)
- Verify minutes decrement after 60 seconds pass (or mock time if possible)
- Verify timer does not freeze or glitch during countdown

**Enable/Disable:**
- Verify timer is visible when enabled
- Verify timer is completely removed from DOM or hidden when disabled
- Verify no empty placeholder or broken layout when timer is disabled

**Schedule:**
- Verify timer is NOT visible before the scheduled start time
- Verify timer appears when the scheduled time is reached (if testable)
- Verify timer disappears or shows expiry state after the end time

**Expiry Behavior:**
- Verify timer shows correct state when countdown reaches 00:00:00:00 (hidden, or shows expired message)
- Verify no negative values are displayed after expiry

---

### 2. Announcement Bar — `announcement-bar.spec.ts`

**Display & Rendering:**
- Verify announcement bar is visible at the top of the page
- Verify announcement bar displays the correct text/message
- Verify bar does not overlap with the site header or navigation
- Verify bar does not overlap with other CDT widgets
- Verify correct display on desktop, tablet, and mobile viewports
- Verify bar is dismissible if close button exists (click X → bar disappears)

**CTA / Link:**
- Verify CTA button or link is visible if configured
- Verify clicking CTA redirects to the correct URL
- Verify CTA link opens in correct target (same tab or new tab as configured)

**Schedule:**
- Verify bar is NOT visible before scheduled start time
- Verify bar disappears after scheduled end time

**Multiple Announcements:**
- Verify rotation/carousel between multiple announcement messages if configured
- Verify transition animation is smooth (no flicker)

---

### 3. Quantity Bar (Stock Counter) — `quantity-bar.spec.ts`

**Display:**
- Verify quantity bar is visible on the product page
- Verify bar shows correct stock quantity or percentage
- Verify bar label text matches configuration (e.g., "X items sold" or "Only X left")

**Dynamic Update:**
- Verify stock display updates after a purchase is made (if testable via cart flow)
- Verify progress bar width corresponds to the stock level

**Out of Stock:**
- Verify quantity bar is hidden or shows appropriate message when product is out of stock
- Navigate to an out-of-stock product → verify bar behavior

**Variant Change:**
- Select different product variants → verify quantity bar updates to reflect the selected variant's stock

---

### 4. Popup Modal — `popup-modal.spec.ts`

**Trigger & Display:**
- Verify popup modal appears based on configured trigger (page load, time delay, scroll percentage, exit intent)
- For time-delay trigger: verify popup does NOT appear before the delay, then appears after
- Verify popup overlay/backdrop is displayed
- Verify popup content matches configuration (text, image, form, CTA)
- Verify popup displays correctly on desktop and mobile viewports

**Close Action:**
- Verify clicking the close (X) button dismisses the popup
- Verify clicking outside the popup (on backdrop) dismisses it
- Verify pressing Escape key dismisses the popup
- Verify page is scrollable again after popup is closed

**Repeat Prevention:**
- Verify popup does NOT reappear on page reload after being dismissed (cookie/session-based)
- Verify popup does NOT appear again during the same session after being closed
- Clear cookies → verify popup appears again on next visit

**CTA:**
- Verify CTA button in popup is clickable and redirects correctly
- Verify form submission inside popup works if applicable

---

### 5. Delivery Timer — `delivery-timer.spec.ts`

**Display & Message:**
- Verify delivery timer is visible on the product page
- Verify message displays correctly (e.g., "Order within X hrs Y mins to get it by [date]")
- Verify the delivery date shown is calculated correctly based on current time + configured delivery days
- Verify message updates in real-time as time passes

**Date Calculation:**
- Verify delivery date skips weekends if configured
- Verify delivery date accounts for holidays/cutoff times if configured
- Verify if current time is past cutoff → delivery date shifts to next business day

**Timezone:**
- Verify delivery timer uses the correct timezone as configured
- Verify displayed time is consistent regardless of user's local timezone (or adapts correctly)

**Responsive:**
- Verify correct display on desktop and mobile viewports
- Verify no text truncation or overflow

---

### 6. Popup Notifications (Social Proof) — `popup-notifications.spec.ts`

**Display:**
- Verify popup notification appears on the page (e.g., "Someone from [City] just purchased [Product]")
- Verify notification appears at configured position (bottom-left, bottom-right, etc.)
- Verify notification contains expected content: buyer info, product name, time, location

**Rotation & Timing:**
- Verify multiple notifications rotate in sequence
- Verify delay between notifications matches configuration
- Verify notification auto-dismisses after configured display duration
- Verify smooth slide-in / fade-in animation

**Disable:**
- Verify no notifications appear when the feature is disabled
- Verify no empty notification container or broken layout when disabled

**Interaction:**
- Verify clicking on a notification redirects to the correct product page
- Verify notification does not block page interaction (user can still scroll and click)

**Responsive:**
- Verify notification displays correctly on mobile without overlapping content

---

### 7. Spinning Wheel (Spin to Win) — `spinning-wheel.spec.ts`

**Display & Trigger:**
- Verify spinning wheel popup or icon appears based on trigger configuration
- Verify wheel displays correct segments with configured prizes/labels
- Verify wheel displays correctly on desktop and mobile viewports

**Animation & Spin:**
- Verify clicking the spin button triggers the wheel animation
- Verify wheel spins smoothly without lag or visual glitches
- Verify wheel stops at a segment after spinning
- Verify the result displayed matches the segment the wheel stopped on

**Reward Logic:**
- Verify winning result shows the correct reward (discount code, message, etc.)
- Verify the discount code is displayed and copyable (if applicable)
- Verify losing result shows the correct message

**Form / Email Collection:**
- Verify email input is required before spinning (if configured)
- Verify email validation works (empty, invalid format)
- Verify form submission succeeds with valid email

**Repeat Prevention:**
- Verify wheel does NOT allow spinning again after first attempt (per session/cookie)
- Verify appropriate message is shown on revisit (e.g., "You already spun")

**Close Action:**
- Verify close button works
- Verify clicking outside the wheel popup closes it

---

### 8. Reserved Cart Timer — `reserved-cart-timer.spec.ts`

**Timer Start:**
- Add a product to cart → verify reserved cart timer starts and is visible
- Verify timer displays correct countdown format (e.g., "Your cart is reserved for MM:SS")
- Verify timer appears on the cart page

**Persistence:**
- Add product to cart → refresh page → verify timer is still running and has not reset
- Add product to cart → navigate away → return to cart → verify timer continues from where it left off

**Expiry:**
- Verify timer reaches 00:00 → verify appropriate behavior (cart cleared, warning message, or redirect)
- Verify no negative timer values are shown

**Multiple Products:**
- Add multiple products → verify single timer runs for the entire cart (not per item)

**Responsive:**
- Verify timer displays correctly on desktop and mobile viewports

---

### 9. Widget Integration — `widget-integration.spec.ts`

**Multiple Widgets on Same Page:**
- Navigate to homepage → verify all enabled widgets are visible without overlapping
- Navigate to product page → verify countdown timer, quantity bar, delivery timer, and reserved cart timer can coexist
- Navigate to collection page → verify widgets display correctly alongside product grid

**Widget Positioning:**
- Verify each widget renders in its configured position
- Verify z-index ordering is correct (popup > announcement bar > inline widgets)
- Verify no widget is hidden behind another

**Performance:**
- Verify page load time with all widgets enabled is acceptable (< 5 seconds)
- Verify no console errors related to CDT widgets (capture browser console logs)
- Verify no layout shift (CLS) caused by widgets loading

**Conflict Check:**
- Verify announcement bar + popup modal do not overlap
- Verify popup notification does not cover the spinning wheel
- Verify countdown timer does not overlap with site navigation

---

### 10. UI Customization — `ui-customization.spec.ts`

**Text Customization:**
- Verify custom text content is displayed correctly on each widget
- Verify special characters and emojis render correctly in widget text
- Verify long text does not break layout or overflow container

**Color Customization:**
- Verify widget background color matches configuration (capture CSS computed style)
- Verify widget text color matches configuration
- Verify CTA button color matches configuration
- Verify color contrast is sufficient for readability

**Style / Theme:**
- Verify font family matches configuration (if customizable)
- Verify border radius, padding, and spacing look correct
- Verify widget style is consistent with the overall storefront theme

**Responsive Customization:**
- Verify custom styles are maintained across desktop, tablet, and mobile viewports
- Verify no style regression when switching between viewport sizes

**Asset Integrity:**
- Verify all widget images and icons load correctly (no broken images)
- Verify no missing CSS assets (check for unstyled elements)
- Verify no 404 errors for widget resources (intercept network requests)

---

### General Guidelines for All Tests:

- Use `test.describe` to group related tests within each spec file
- Use `test.beforeEach` for common navigation and setup
- Use viewport helpers for responsive testing:
  ```typescript
  const viewports = {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  };
  ```
- Tag tests with `@smoke`, `@regression`, `@responsive` for selective execution
- Use soft assertions where multiple checks happen in one test
- Add meaningful test descriptions that explain expected behavior
- Capture screenshots on failure for debugging
- Use `page.waitForSelector` with reasonable timeouts for widget loading
- Use `page.evaluate` to check CSS computed styles for UI customization tests
- Use `page.on('console')` to capture console errors for performance tests
- Use `page.route` to intercept network requests for asset integrity checks

Add npm scripts:
- "test:cdt" — run all CDT widget tests
- "test:cdt:smoke" — run only smoke tagged tests
- "test:cdt:responsive" — run only responsive tagged tests

Visit the storefront before writing any code to identify actual widget selectors, DOM structure, CSS classes, and behavior patterns.
```
