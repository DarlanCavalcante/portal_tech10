/**
 * Configuração centralizada da API — Tech10
 * Usa runtime standalone do tenant Tech10, com proxy same-origin em /api/store.
 * Carregue api-adapter.js antes de load-products e cart-storefront.js.
 */
(function (global) {
  'use strict';

  const tenantConfig = typeof window !== 'undefined' ? window.TENANT_CONFIG || {} : {};
  const tenantStore = tenantConfig.store || {};
  const tenantMeta = tenantConfig.tenant || {};
  const tenantRuntimeId = tenantStore.runtimeId || tenantMeta.id || tenantStore.slug || tenantMeta.slug || 'tenant';
  const runtimeOrigin = tenantStore.baseUrl || (typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'http://localhost:3101');

  const API_CONFIG = {
    provider: tenantStore.provider || 'tenant-standalone',

    TECH10_STORE_SLUG: tenantStore.slug || tenantMeta.slug || 'tech10',

    STORE_SLUG: tenantStore.slug || tenantMeta.slug || 'tech10',

    SITE_BASE_PATH: tenantMeta.publicSiteBasePath || '/',

    RUNTIME_BASE_URL: runtimeOrigin,
    STORE_RUNTIME_BASE_URL: runtimeOrigin,

    // Alias legado mantido apenas para compatibilidade temporária com scripts antigos.
    VIVACOMMERCE_BASE_URL: runtimeOrigin,
    LEGACY_STORE_BASE_URL: runtimeOrigin,

    CATALOG_SOURCE: tenantStore.catalogSource || 'erp_stock',

    CHECKOUT_MODE: tenantStore.checkoutMode || 'quote_only',

    CART_STORAGE_KEY: `${tenantRuntimeId}_storefront_cart_id`,

    LEGACY_CART_STORAGE_KEY: 'vivacommerce_cart_id',

    EXTRA_LEGACY_CART_STORAGE_KEYS: ['vc_cart_id', 'medusa_cart_id'],

    get CART_STORAGE_KEYS() {
      return Array.from(new Set([
        this.CART_STORAGE_KEY,
        this.LEGACY_CART_STORAGE_KEY
      ].concat(this.EXTRA_LEGACY_CART_STORAGE_KEYS || []).filter(Boolean)));
    },

    readStoredCartId() {
      if (typeof localStorage === 'undefined') return null;
      for (const key of this.CART_STORAGE_KEYS) {
        const value = localStorage.getItem(key);
        if (value) return value;
      }
      return null;
    },

    persistStoredCartId(value) {
      if (typeof localStorage === 'undefined') return;
      for (const key of this.CART_STORAGE_KEYS) {
        if (!value) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      }
    },

    get ACTIVE_URL() {
      return this.RUNTIME_BASE_URL;
    },

    get STORE_API() {
      return this.RUNTIME_BASE_URL + (tenantStore.apiBasePath || '/api/store');
    },

    get ADMIN_API() {
      return this.RUNTIME_BASE_URL + (tenantStore.adminApiBasePath || '/api');
    },

    get HEALTH() {
      return this.RUNTIME_BASE_URL + (tenantStore.healthPath || '/api/health');
    }
  };

  global.API_CONFIG = API_CONFIG;

  if (typeof window !== 'undefined') {
    console.log('API Config Tech10:', {
      provider: API_CONFIG.provider,
      url: API_CONFIG.ACTIVE_URL,
      storeSlug: API_CONFIG.TECH10_STORE_SLUG,
      catalogSource: API_CONFIG.CATALOG_SOURCE,
      checkoutMode: API_CONFIG.CHECKOUT_MODE
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
