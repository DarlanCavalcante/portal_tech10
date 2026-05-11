/**
 * Configuração centralizada da API — Tech10
 * Usa runtime standalone do tenant Tech10, com proxy same-origin em /api/store.
 * Carregue api-adapter.js antes de load-products e cart-vivacommerce.js.
 */
const tenantConfig = typeof window !== 'undefined' ? window.TENANT_CONFIG || {} : {};
const tenantStore = tenantConfig.store || {};
const tenantMeta = tenantConfig.tenant || {};
const runtimeOrigin = tenantStore.baseUrl || (typeof window !== 'undefined' && window.location.origin
  ? window.location.origin
  : 'http://localhost:3101');
const API_CONFIG = {
  provider: tenantStore.provider || 'tech10-standalone',

  TECH10_STORE_SLUG: tenantStore.slug || tenantMeta.slug || 'revivah-tech',

  STORE_SLUG: tenantStore.slug || tenantMeta.slug || 'revivah-tech',

  SITE_BASE_PATH: tenantMeta.publicSiteBasePath || '/',

  RUNTIME_BASE_URL: runtimeOrigin,

  // Alias legado mantido para compatibilidade temporária com scripts antigos.
  VIVACOMMERCE_BASE_URL: runtimeOrigin,

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

if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
  console.log('API Config Tech10:', {
    provider: API_CONFIG.provider,
    url: API_CONFIG.ACTIVE_URL,
    storeSlug: API_CONFIG.TECH10_STORE_SLUG
  });
}
