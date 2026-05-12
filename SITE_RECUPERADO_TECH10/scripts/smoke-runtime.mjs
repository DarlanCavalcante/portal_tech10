import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const runtimeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = (process.env.SMOKE_BASE_URL || 'http://localhost:4111').replace(/\/$/, '');
const expectStoreConfigured =
  process.env.EXPECT_CATALOG_BACKEND === '1' || process.env.EXPECT_STORE_BACKEND === '1';

const targets = [
  { path: '/', expectedStatus: 200, label: 'home' },
  { path: '/loja', expectedStatus: 200, label: 'loja' },
  { path: '/carrinho', expectedStatus: 200, label: 'carrinho' },
  { path: '/checkout', expectedStatus: 200, label: 'checkout' },
  { path: '/portal', expectedStatus: 200, label: 'portal' },
  { path: '/api/runtime-config', expectedStatus: 200, label: 'runtime-config' },
  { path: '/api/health', expectedStatus: expectStoreConfigured ? 200 : 503, label: 'health' },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchJsonOrThrow(url, label) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${label} retornou HTTP ${response.status}`);
  }
  return response.json();
}

function buildFallbackProduct() {
  return {
    id: 'tech10-smoke-product',
    title: 'Produto Smoke Tech10',
    description: 'Produto sintético para validar a seleção assistida.',
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Crect fill=%22%23dbeafe%22 width=%22120%22 height=%22120%22/%3E%3Ctext fill=%22%231d4ed8%22 x=%2260%22 y=%2260%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2212%22%3ESmoke%3C/text%3E%3C/svg%3E',
    category: {
      id: 'smoke',
      name: 'Smoke',
      handle: 'smoke',
    },
    variants: [
      {
        id: 'tech10-smoke-variant',
        title: 'Padrao',
        inventory_quantity: 10,
        prices: [{ amount: 2500 }],
      },
    ],
    metadata: {
      sku: 'TECH10-SMOKE',
      brand: 'Tech10',
      categoryHandle: 'smoke',
      sellable: true,
    },
  };
}

async function resolveSmokeProduct() {
  if (!expectStoreConfigured) {
    return buildFallbackProduct();
  }

  const payload = await fetchJsonOrThrow(
    `${baseUrl}/api/store/lojas/tech10/produtos?limit=1`,
    'catálogo Tech10'
  );
  const product = payload && payload.data && Array.isArray(payload.data.products)
    ? payload.data.products[0]
    : null;

  assert(product && product.id, 'catálogo Tech10 não retornou um produto utilizável para o smoke');
  assert(Array.isArray(product.variants) && product.variants[0] && product.variants[0].id, 'produto do smoke não possui variante válida');
  return product;
}

function createLocalStorageMock() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

async function runAssistedBridgeProbe(runtimeConfig, product) {
  const apiConfigSource = fs.readFileSync(path.join(runtimeRoot, 'js', 'api-config.js'), 'utf8');
  const apiAdapterSource = fs.readFileSync(path.join(runtimeRoot, 'js', 'api-adapter.js'), 'utf8');
  const quoteOnlyMode = runtimeConfig && runtimeConfig.commerce && runtimeConfig.commerce.checkoutMode
    ? runtimeConfig.commerce.checkoutMode
    : 'quote_only';
  const catalogSource = runtimeConfig && runtimeConfig.commerce && runtimeConfig.commerce.catalogSource
    ? runtimeConfig.commerce.catalogSource
    : 'erp_stock';

  const sandbox = {
    console,
    clearTimeout,
    setTimeout,
    localStorage: createLocalStorageMock(),
    fetch: async function unexpectedFetch(url) {
      throw new Error(`fetch inesperado durante o probe assistido: ${url}`);
    },
  };

  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.location = { origin: baseUrl };
  sandbox.TENANT_CONFIG = {
    tenant: {
      id: 'tech10',
      slug: 'tech10',
    },
    store: {
      runtimeId: 'tech10',
      slug: 'tech10',
      baseUrl,
      provider: 'tenant-standalone',
      checkoutMode: quoteOnlyMode,
      catalogSource,
    },
  };
  sandbox.__tech10_runtime_config = runtimeConfig;
  sandbox.__tech10_products = [product];
  sandbox.__pm_product_cache = [product];
  sandbox.__tech10_product_catalog = [product];

  vm.createContext(sandbox);
  new vm.Script(apiConfigSource, { filename: 'js/api-config.js' }).runInContext(sandbox);
  new vm.Script(apiAdapterSource, { filename: 'js/api-adapter.js' }).runInContext(sandbox);

  const adapter = sandbox.MarketplaceAdapter;
  assert(adapter, 'MarketplaceAdapter não foi inicializado no probe assistido');

  const variant = product.variants[0];
  const created = await adapter.createCart();
  assert(created && created.cart && created.cart.id, 'createCart não retornou um carrinho assistido válido');

  const createdCartId = created.cart.id;
  const added = await adapter.addLineItem(createdCartId, variant.id, 2, product.id);
  const addedCart = added && added.cart ? added.cart : null;
  assert(addedCart && Array.isArray(addedCart.items) && addedCart.items.length === 1, 'addLineItem não criou o item assistido esperado');
  assert(addedCart.items[0].quantity === 2, 'addLineItem não preservou a quantidade assistida esperada');

  const fetched = await adapter.getCart(createdCartId);
  assert(fetched && Array.isArray(fetched.items) && fetched.items.length === 1, 'getCart não reencontrou o item assistido persistido');
  assert(fetched.items[0].title === addedCart.items[0].title, 'getCart não preservou o título do item assistido');

  const updated = await adapter.updateLineItem(createdCartId, addedCart.items[0].id, 3);
  const updatedCart = updated && updated.cart ? updated.cart : null;
  assert(updatedCart && updatedCart.items[0] && updatedCart.items[0].quantity === 3, 'updateLineItem não atualizou a quantidade assistida');

  const removed = await adapter.removeLineItem(createdCartId, updatedCart.items[0].id);
  const removedCart = removed && removed.cart ? removed.cart : null;
  assert(removedCart && Array.isArray(removedCart.items) && removedCart.items.length === 0, 'removeLineItem não limpou a seleção assistida');

  const storedCartId = sandbox.API_CONFIG.readStoredCartId();
  const storedAssistedCart = sandbox.API_CONFIG.readAssistedCart();

  assert(storedCartId === createdCartId, 'o cartId assistido não foi persistido pelo contrato canônico');
  assert(storedAssistedCart && storedAssistedCart.id === createdCartId, 'o snapshot assistido não foi persistido corretamente');
  assert(Array.isArray(storedAssistedCart.items) && storedAssistedCart.items.length === 0, 'o snapshot assistido final deveria terminar vazio após a remoção');

  return {
    cartId: createdCartId,
    variantId: variant.id,
    productId: product.id,
    fetchedTitle: fetched.items[0].title,
    updatedQuantity: updatedCart.items[0].quantity,
    finalItems: removedCart.items.length,
  };
}

function buildProbeRuntimeConfig(runtimeConfig) {
  const commerce = runtimeConfig && runtimeConfig.commerce ? runtimeConfig.commerce : {};
  const capabilities = commerce.capabilities || {};

  if (expectStoreConfigured) {
    return runtimeConfig;
  }

  return {
    ...runtimeConfig,
    commerce: {
      ...commerce,
      checkoutMode: commerce.checkoutMode || 'quote_only',
      capabilities: {
        ...capabilities,
        quoteOnly: true,
        assistedCartBridge: true,
        assistedCheckoutBridge: true,
      },
    },
  };
}

async function main() {
  for (const target of targets) {
    const response = await fetch(`${baseUrl}${target.path}`);
    if (response.status !== target.expectedStatus) {
      throw new Error(`Smoke falhou em ${target.label}: esperado ${target.expectedStatus}, recebido ${response.status}`);
    }
  }

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  const health = await healthResponse.json();
  const runtimeConfigResponse = await fetch(`${baseUrl}/api/runtime-config`);
  const runtimeConfig = await runtimeConfigResponse.json();

  assert(runtimeConfig && runtimeConfig.commerce, 'runtime-config não retornou o bloco commerce');
  assert(runtimeConfig.commerce.checkoutMode === 'quote_only', 'runtime-config não declarou checkoutMode=quote_only');
  if (expectStoreConfigured) {
    assert(runtimeConfig.commerce.capabilities && runtimeConfig.commerce.capabilities.assistedCartBridge === true, 'runtime-config não declarou assistedCartBridge=true');
    assert(runtimeConfig.commerce.capabilities && runtimeConfig.commerce.capabilities.assistedCheckoutBridge === true, 'runtime-config não declarou assistedCheckoutBridge=true');
  }

  const smokeProduct = await resolveSmokeProduct();
  const probeRuntimeConfig = buildProbeRuntimeConfig(runtimeConfig);
  const assistedBridgeProbe = await runAssistedBridgeProbe(probeRuntimeConfig, smokeProduct);

  console.log(JSON.stringify({
    ok: true,
    baseUrl,
    expectStoreConfigured,
    healthStatus: health.status,
    commerce: runtimeConfig.commerce,
    probeCommerce: probeRuntimeConfig.commerce,
    integrations: health.integrations,
    assistedBridgeProbe,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
