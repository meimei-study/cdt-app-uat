export const STORE_URL = 'https://review-jan.myshopify.com';
export const STORE_PASSWORD = process.env.SHOPIFY_PASSWORD || '123456';

// ── Widget type suffixes (set in .env, e.g. "01-flipper", "02-bar") ──────────
// These map to the CDT app's generated class: .sct-timer.sct-timer-{TYPE}
// export const HEADER_TIMER_TYPE       = process.env.CDT_HEADER_TIMER_TYPE       || '01-flipper';
export const HEADER_TIMER_ID       = process.env.CDT_HEADER_TIMER_ID       || '87142';
export const ANNOUNCEMENT_BAR_ID = process.env.CDT_ANNOUNCEMENT_BAR_ID || '87143';
// ── Page URLs ────────────────────────────────────────────────────────────────

export const URLS = {
  home: '/',
  collections: '/collections/all',
  product: '/products/adidas-adizero-boston-8-black',
  cart: '/cart',
  contact: '/pages/contact',
  flashSale: '/pages/flash-sale',
};

// Pages where header countdown timer bar should appear
export const ALL_PAGES_WITH_HEADER_TIMER = [
  { name: 'Home',        path: URLS.home },
  { name: 'Collections', path: URLS.collections },
  { name: 'Product',     path: URLS.product },
  { name: 'Cart',        path: URLS.cart },
  { name: 'Contact',     path: URLS.contact },
];

// Pages where both widgets should appear
export const ALL_PAGES = [
  { name: 'Home',        path: URLS.home },
  { name: 'Collections', path: URLS.collections },
  { name: 'Product',     path: URLS.product },
  { name: 'Cart',        path: URLS.cart },
  { name: 'Contact',     path: URLS.contact },
];

export const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet:  { width: 768,  height: 1024 },
  mobile:  { width: 375,  height: 667  },
};

export const TEST_EMAIL = 'test.auto@apps-cyclone.com';