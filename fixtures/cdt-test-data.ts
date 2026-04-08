export const STORE_URL = 'https://automation-test-uat-v2.myshopify.com';
export const STORE_PASSWORD = process.env.SHOPIFY_PASSWORD || '123456';

export const URLS = {
  home: '/',
  collections: '/collections/all',
  product: '/products/adidas-adizero-boston-8-black',
};

export const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};
