const DEFAULT_PORTAL_BASE_URL = 'https://sistema.tech10cloud.com/portal';
const DEFAULT_STATUS_BASE_URL = 'https://sistema.tech10cloud.com/status';
const DEFAULT_SUPPORT_WHATSAPP = '55974001960';
const DEFAULT_TENANT_ID = 'tech10';
const DEFAULT_STORE_SLUG = 'tech10';
const DEFAULT_SITE_NAME = 'Tech10 Informática';
const DEFAULT_RUNTIME_ID = 'tech10-portal';

const ALLOWED_CATALOG_SOURCES = ['store_backend', 'erp_stock'];
const ALLOWED_CHECKOUT_MODES = ['store_backend', 'quote_only'];

function normalizeUrl(value) {
  return value ? String(value).trim().replace(/\/$/, '') : '';
}

function normalizeChoice(value, allowed, fallback) {
  const normalized = String(value || '').trim().toLowerCase();
  return allowed.includes(normalized) ? normalized : fallback;
}

function normalizeWhatsapp(value) {
  return String(value || DEFAULT_SUPPORT_WHATSAPP).replace(/\D/g, '');
}

function getStoreBaseUrl(value) {
  const normalized = normalizeUrl(value);
  if (!normalized) return '';
  return normalized.endsWith('/api/store') ? normalized : `${normalized}/api/store`;
}

function buildHealthUrl(value) {
  const normalized = normalizeUrl(value);
  if (!normalized) return '';
  if (normalized.endsWith('/api/store')) {
    return normalized.replace(/\/api\/store$/, '/health');
  }
  return `${normalized}/health`;
}

function getRuntimeEnv() {
  const legacyStoreBackendUrl = normalizeUrl(
    process.env.TECH10_STORE_BACKEND_URL || process.env.STORE_BACKEND_URL || ''
  );

  const catalogSource = normalizeChoice(
    process.env.TECH10_CATALOG_SOURCE,
    ALLOWED_CATALOG_SOURCES,
    'store_backend'
  );

  const catalogBackendUrl = normalizeUrl(
    process.env.TECH10_CATALOG_BACKEND_URL || legacyStoreBackendUrl
  );

  const checkoutMode = normalizeChoice(
    process.env.TECH10_CHECKOUT_MODE,
    ALLOWED_CHECKOUT_MODES,
    legacyStoreBackendUrl ? 'store_backend' : 'quote_only'
  );

  const checkoutBackendUrl = normalizeUrl(
    process.env.TECH10_CHECKOUT_BACKEND_URL || legacyStoreBackendUrl || catalogBackendUrl
  );

  const supportWhatsapp = normalizeWhatsapp(
    process.env.TECH10_SUPPORT_WHATSAPP || DEFAULT_SUPPORT_WHATSAPP
  );

  const tenantId = String(process.env.TECH10_TENANT_ID || DEFAULT_TENANT_ID).trim() || DEFAULT_TENANT_ID;
  const storeSlug = String(
    process.env.TECH10_PUBLIC_STORE_SLUG || process.env.TECH10_STORE_SLUG || DEFAULT_STORE_SLUG
  ).trim() || DEFAULT_STORE_SLUG;
  const siteName = String(process.env.TECH10_SITE_NAME || DEFAULT_SITE_NAME).trim() || DEFAULT_SITE_NAME;
  const runtimeId = String(process.env.TECH10_RUNTIME_ID || DEFAULT_RUNTIME_ID).trim() || DEFAULT_RUNTIME_ID;

  return {
    tenantId,
    storeSlug,
    siteName,
    runtimeId,
    mode: 'standalone',
    catalogSource,
    checkoutMode,
    catalogBackendUrl,
    checkoutBackendUrl,
    storeBaseUrl: getStoreBaseUrl(catalogBackendUrl),
    checkoutStoreBaseUrl: getStoreBaseUrl(checkoutBackendUrl),
    portalBaseUrl: normalizeUrl(process.env.TECH10_ERP_PORTAL_BASE_URL || DEFAULT_PORTAL_BASE_URL),
    statusBaseUrl: normalizeUrl(process.env.TECH10_ERP_STATUS_BASE_URL || DEFAULT_STATUS_BASE_URL),
    supportWhatsapp,
    supportWhatsappUrl: supportWhatsapp
      ? `https://wa.me/${supportWhatsapp}`
      : '',
    healthTargets: {
      catalog: buildHealthUrl(catalogBackendUrl),
      checkout: checkoutMode === 'store_backend' ? buildHealthUrl(checkoutBackendUrl) : '',
    },
  };
}

function buildCapabilityModel(env) {
  const browseCatalog = Boolean(env.catalogBackendUrl);
  const quoteOnly = env.checkoutMode === 'quote_only';
  const cartEnabled = env.checkoutMode === 'store_backend' && Boolean(env.checkoutBackendUrl);
  const supportConfigured = Boolean(env.supportWhatsapp);
  return {
    browseCatalog,
    cart: cartEnabled,
    checkout: cartEnabled,
    quoteOnly,
    assistedCartBridge: quoteOnly && browseCatalog,
    assistedCheckoutBridge: quoteOnly && supportConfigured,
    portalBridge: Boolean(env.portalBaseUrl),
    publicStatus: Boolean(env.statusBaseUrl),
  };
}

function splitStorePath(rawPath) {
  if (Array.isArray(rawPath)) {
    return rawPath.flatMap((value) => String(value).split('/')).filter(Boolean);
  }

  if (typeof rawPath === 'string' && rawPath.length > 0) {
    return rawPath.split('/').filter(Boolean);
  }

  return [];
}

function classifyStoreOperation(method, pathParts) {
  const root = (pathParts[0] || '').toLowerCase();
  const readMethod = method === 'GET' || method === 'HEAD';
  const checkoutRoots = ['carts', 'checkouts', 'orders', 'line-items', 'payment', 'payments'];
  const catalogRoots = ['products', 'categories', 'collections', 'lojas', 'tenant', 'search'];

  if (checkoutRoots.includes(root)) {
    return 'checkout';
  }

  if (catalogRoots.includes(root)) {
    return 'catalog';
  }

  return readMethod ? 'catalog' : 'checkout';
}

function getBackendForOperation(env, operation) {
  if (operation === 'catalog') {
    return env.catalogBackendUrl;
  }

  if (env.checkoutMode !== 'store_backend') {
    return '';
  }

  return env.checkoutBackendUrl;
}

function buildStoreTargetUrl(baseUrl, pathParts, query) {
  const suffix = pathParts.length
    ? `/${pathParts.map((part) => encodeURIComponent(part)).join('/')}`
    : '';

  const target = new URL(`${getStoreBaseUrl(baseUrl)}${suffix}`);

  Object.entries(query || {}).forEach(([key, value]) => {
    if (key === 'path' || typeof value === 'undefined') return;

    if (Array.isArray(value)) {
      value.forEach((item) => target.searchParams.append(key, String(item)));
      return;
    }

    target.searchParams.append(key, String(value));
  });

  return target;
}

module.exports = {
  DEFAULT_PORTAL_BASE_URL,
  DEFAULT_STATUS_BASE_URL,
  ALLOWED_CATALOG_SOURCES,
  ALLOWED_CHECKOUT_MODES,
  normalizeUrl,
  getRuntimeEnv,
  buildCapabilityModel,
  splitStorePath,
  classifyStoreOperation,
  getBackendForOperation,
  buildStoreTargetUrl,
};
