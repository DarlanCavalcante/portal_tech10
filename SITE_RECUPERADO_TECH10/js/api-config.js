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

    ASSISTED_CART_STORAGE_KEY: `${tenantRuntimeId}_assisted_cart`,

    LEGACY_CART_STORAGE_KEY: 'vivacommerce_cart_id',

    EXTRA_LEGACY_CART_STORAGE_KEYS: ['vc_cart_id', 'medusa_cart_id'],

    get CART_STORAGE_KEYS() {
      return Array.from(new Set([
        this.CART_STORAGE_KEY,
        this.LEGACY_CART_STORAGE_KEY
      ].concat(this.EXTRA_LEGACY_CART_STORAGE_KEYS || []).filter(Boolean)));
    },

    resolveCartStorageKeys(fallbackKeys = []) {
      return Array.from(new Set([]
        .concat(this.CART_STORAGE_KEYS || [])
        .concat(fallbackKeys || [])
        .filter(Boolean)));
    },

    readStoredCartId() {
      if (typeof localStorage === 'undefined') return null;
      for (const key of this.resolveCartStorageKeys()) {
        const value = localStorage.getItem(key);
        if (value) return value;
      }
      const assistedCart = this.readAssistedCart();
      if (assistedCart && assistedCart.id) {
        return assistedCart.id;
      }
      return null;
    },

    persistStoredCartId(value) {
      if (typeof localStorage === 'undefined') return;
      for (const key of this.resolveCartStorageKeys()) {
        if (!value) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      }
    },

    readLegacyCartId() {
      return this.readStoredCartId();
    },

    persistLegacyCartId(value) {
      this.persistStoredCartId(value);
    },

    readAssistedCart() {
      if (typeof localStorage === 'undefined') return null;
      try {
        const rawValue = localStorage.getItem(this.ASSISTED_CART_STORAGE_KEY);
        if (!rawValue) return null;
        const parsedValue = JSON.parse(rawValue);
        return parsedValue && typeof parsedValue === 'object' ? parsedValue : null;
      } catch (error) {
        console.warn('[api-config] assisted cart parse error:', error);
        localStorage.removeItem(this.ASSISTED_CART_STORAGE_KEY);
        return null;
      }
    },

    persistAssistedCart(value) {
      if (typeof localStorage === 'undefined') return;
      if (!value) {
        localStorage.removeItem(this.ASSISTED_CART_STORAGE_KEY);
        return;
      }
      localStorage.setItem(this.ASSISTED_CART_STORAGE_KEY, JSON.stringify(value));
    },

    get ACTIVE_URL() {
      return this.RUNTIME_BASE_URL;
    },

    resolveRuntimeBaseUrl(fallbackUrl = 'http://localhost:3000') {
      return (this.STORE_RUNTIME_BASE_URL
        || this.RUNTIME_BASE_URL
        || this.LEGACY_STORE_BASE_URL
        || this.VIVACOMMERCE_BASE_URL
        || this.ACTIVE_URL
        || fallbackUrl).replace(/\/$/, '');
    },

    get STORE_API() {
      return this.RUNTIME_BASE_URL + (tenantStore.apiBasePath || '/api/store');
    },

    get ADMIN_API() {
      return this.RUNTIME_BASE_URL + (tenantStore.adminApiBasePath || '/api');
    },

    get HEALTH() {
      return this.RUNTIME_BASE_URL + (tenantStore.healthPath || '/api/health');
    },

    resolveLegacyStoreApiBaseUrl() {
      return this.STORE_API;
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
