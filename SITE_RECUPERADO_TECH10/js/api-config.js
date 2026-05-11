/**
 * Configuração centralizada da API — Tech10
 * Usa backend VivaCommerce com loja do seed (slug tech10-informatica).
 * Carregue api-adapter.js antes de load-products e cart-vivacommerce.js.
 */
const tenantConfig = typeof window !== 'undefined' ? window.TENANT_CONFIG || {} : {};
const tenantStore = tenantConfig.store || {};
const tenantMeta = tenantConfig.tenant || {};
const API_CONFIG = {
  provider: tenantStore.provider || 'vivacommerce',

  /** Slug da loja Tech10 no seed — usa revivah-tech (seed-completo-segmentos.ts) */
  TECH10_STORE_SLUG: tenantStore.slug || tenantMeta.slug || 'revivah-tech',

  STORE_SLUG: tenantStore.slug || tenantMeta.slug || 'revivah-tech',

  SITE_BASE_PATH: tenantMeta.publicSiteBasePath || '/tech10',

  VIVACOMMERCE_BASE_URL: tenantStore.baseUrl || (typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'http://localhost:3101'),

  get ACTIVE_URL() {
    return this.VIVACOMMERCE_BASE_URL;
  },

  get STORE_API() {
    return this.VIVACOMMERCE_BASE_URL + '/api/store';
  },

  get ADMIN_API() {
    return this.ACTIVE_URL + '/api';
  },

  get HEALTH() {
    return this.ACTIVE_URL + '/health';
  }
};

if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
  console.log('API Config Tech10:', {
    provider: API_CONFIG.provider,
    url: API_CONFIG.ACTIVE_URL,
    storeSlug: API_CONFIG.TECH10_STORE_SLUG
  });
}
