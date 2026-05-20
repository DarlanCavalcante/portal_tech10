/**
 * API Adapter — Store proxy / Tech10
 * Usa rotas same-origin do runtime standalone para acessar produtos/categorias.
 */
(function (global) {
  'use strict';

  const CATEGORY_NAME_MAP = {
    veiculos: 'Veículos',
    mouse: 'Mouse',
    cabos: 'Cabos',
    'redes-equipamentos': 'Redes e Equipamentos',
  };

  function slugifyCategoryValue(value) {
    if (!value) return 'outros';
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/^product:/i, '')
      .replace(/[>:]+/g, '-')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-')
      .toLowerCase() || 'outros';
  }

  function formatCategoryName(name, handle) {
    const rawName = String(name || '').trim();
    const normalizedHandle = slugifyCategoryValue(handle || rawName);

    if (CATEGORY_NAME_MAP[normalizedHandle]) {
      return CATEGORY_NAME_MAP[normalizedHandle];
    }

    if (!rawName) {
      return normalizedHandle
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ') || 'Outros';
    }

    return rawName
      .replace(/\s*>\s*/g, ' · ')
      .replace(/\bveiculos\b/gi, 'Veículos')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function normalizeCategory(category) {
    if (!category) return null;

    const rawHandle = category.handle || category.id || category.name || 'outros';
    const handle = slugifyCategoryValue(rawHandle);
    const name = formatCategoryName(category.name || category.id || category.handle, rawHandle);

    return {
      id: category.id || handle,
      name,
      handle,
      rawHandle,
    };
  }

  function getBaseUrl() {
    const config = global.API_CONFIG || {};
    if (typeof config.resolveRuntimeBaseUrl === 'function') {
      return config.resolveRuntimeBaseUrl();
    }
    return (config.ACTIVE_URL || 'http://localhost:3000').replace(/\/$/, '');
  }

  function getStoreSlug() {
    const config = global.API_CONFIG || {};
    return config.TECH10_STORE_SLUG || config.storeSlug || null;
  }

  const base = () => getBaseUrl() + '/api/store';
  const slug = () => getStoreSlug();

  async function getRuntimeConfig() {
    if (global.__tech10_runtime_config) {
      return global.__tech10_runtime_config;
    }

    try {
      const res = await fetch(`${getBaseUrl()}/api/runtime-config`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      global.__tech10_runtime_config = data;
      return data;
    } catch (err) {
      console.error('[api-adapter] getRuntimeConfig:', err);
      return null;
    }
  }

  function getRuntimeCommerceSnapshot() {
    const runtime = global.__tech10_runtime_config || {};
    if (runtime.commerce) {
      return runtime.commerce;
    }

    const config = global.API_CONFIG || {};
    const quoteOnly = (config.CHECKOUT_MODE || 'quote_only') === 'quote_only';

    return {
      catalogSource: config.CATALOG_SOURCE || 'erp_stock',
      checkoutMode: config.CHECKOUT_MODE || 'quote_only',
      capabilities: {
        cart: !quoteOnly,
        checkout: !quoteOnly,
        quoteOnly,
        assistedCartBridge: quoteOnly,
        assistedCheckoutBridge: quoteOnly
      }
    };
  }

  function isQuoteOnlyCommerce(commerce) {
    const snapshot = commerce || getRuntimeCommerceSnapshot();
    const capabilities = snapshot.capabilities || {};
    return snapshot.checkoutMode === 'quote_only'
      || capabilities.quoteOnly === true
      || capabilities.cart === false;
  }

  function hasAssistedCartBridge(commerce) {
    const snapshot = commerce || getRuntimeCommerceSnapshot();
    const capabilities = snapshot.capabilities || {};
    return capabilities.assistedCartBridge === true
      || (isQuoteOnlyCommerce(snapshot) && capabilities.cart === false);
  }

  async function shouldUseAssistedCartBridge() {
    const runtime = await getRuntimeConfig();
    const commerce = runtime && runtime.commerce ? runtime.commerce : getRuntimeCommerceSnapshot();
    return isQuoteOnlyCommerce(commerce) && hasAssistedCartBridge(commerce);
  }

  function getApiConfig() {
    return global.API_CONFIG || {};
  }

  function buildAssistedCartId() {
    const storeSlug = getStoreSlug() || 'tenant';
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    return `assisted-cart-${storeSlug}-${Date.now().toString(36)}-${randomSuffix}`;
  }

  function readAssistedCart() {
    const config = getApiConfig();
    if (typeof config.readAssistedCart === 'function') {
      return config.readAssistedCart();
    }
    return null;
  }

  function persistAssistedCart(cart) {
    const config = getApiConfig();
    if (typeof config.persistAssistedCart === 'function') {
      config.persistAssistedCart(cart);
    }
  }

  function buildEmptyAssistedCart(cartId) {
    return {
      id: cartId || buildAssistedCartId(),
      assisted: true,
      quote_only: true,
      currency_code: 'brl',
      items: [],
      subtotal: 0,
      total: 0
    };
  }

  function normalizeVariantTitle(title) {
    const value = String(title || '').trim();
    if (!value || /^default\b/i.test(value)) {
      return '';
    }
    return value;
  }

  function getProductPools() {
    return [
      global.__tech10_products,
      global.__pm_product_cache,
      global.__tech10_product_catalog
    ].filter(Array.isArray);
  }

  function findProductByVariantId(variantId, productId) {
    const wantedVariantId = String(variantId || '');
    const wantedProductId = String(productId || '');
    const pools = getProductPools();

    for (const pool of pools) {
      for (const product of pool) {
        if (!product) continue;
        if (wantedProductId && String(product.id) === wantedProductId) {
          const productVariant = (product.variants || []).find(function (variant) {
            return String(variant && variant.id) === wantedVariantId;
          }) || (product.variants && product.variants[0]) || null;
          if (productVariant) {
            return { product, variant: productVariant };
          }
        }

        const matchedVariant = (product.variants || []).find(function (variant) {
          return String(variant && variant.id) === wantedVariantId;
        });

        if (matchedVariant) {
          return { product, variant: matchedVariant };
        }
      }
    }

    return null;
  }

  function findVariantInProduct(product, variantId) {
    if (!product || !Array.isArray(product.variants) || !product.variants.length) {
      return null;
    }

    const wantedVariantId = String(variantId || '');
    return product.variants.find(function (variant) {
      return String(variant && variant.id) === wantedVariantId;
    }) || product.variants[0] || null;
  }

  function getVariantInventoryQuantity(product, variantId) {
    const variant = findVariantInProduct(product, variantId);
    const parsed = parseInt(variant && variant.inventory_quantity, 10);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  async function resolveCurrentProductSnapshot(variantId, productId) {
    if (productId) {
      const liveProduct = await getProductById(productId);
      const liveVariant = findVariantInProduct(liveProduct, variantId);
      if (liveProduct && liveVariant) {
        return { product: liveProduct, variant: liveVariant, source: 'live' };
      }
    }

    const cachedProduct = findProductByVariantId(variantId, productId);
    if (cachedProduct) {
      return { product: cachedProduct.product, variant: cachedProduct.variant, source: 'cache' };
    }

    return null;
  }

  function buildAssistedCartItem(product, variant, quantity) {
    const safeProduct = product || {};
    const safeVariant = variant || {};
    const variantTitle = normalizeVariantTitle(safeVariant.title);
    const availableQuantity = getVariantInventoryQuantity({
      variants: [safeVariant]
    }, safeVariant.id);
    const amount = safeVariant && safeVariant.prices && safeVariant.prices[0] && safeVariant.prices[0].amount
      ? safeVariant.prices[0].amount
      : 0;
    const title = safeProduct.title || 'Produto';
    const thumbnail = safeProduct.thumbnail
      || (safeProduct.images && safeProduct.images[0] && (safeProduct.images[0].url || safeProduct.images[0]))
      || null;

    return {
      id: `assist-item-${safeVariant.id || safeProduct.id || Date.now()}`,
      product_id: safeProduct.id || null,
      variant_id: safeVariant.id || safeProduct.id || null,
      title: variantTitle ? `${title} · ${variantTitle}` : title,
      base_title: title,
      variant_title: variantTitle,
      quantity: quantity || 1,
      available_quantity: availableQuantity,
      inventory_quantity: availableQuantity,
      unit_price: amount,
      subtotal: amount * (quantity || 1),
      thumbnail,
      metadata: {
        sku: safeProduct.metadata && safeProduct.metadata.sku ? safeProduct.metadata.sku : null,
        brand: safeProduct.metadata && safeProduct.metadata.brand ? safeProduct.metadata.brand : null
      },
      variant: {
        id: safeVariant.id || null,
        title: safeVariant.title || '',
        inventory_quantity: availableQuantity,
        product: {
          id: safeProduct.id || null,
          title,
          thumbnail,
          images: Array.isArray(safeProduct.images) ? safeProduct.images : []
        }
      }
    };
  }

  function recalculateCartTotals(cart) {
    const nextCart = cart || buildEmptyAssistedCart();
    const items = Array.isArray(nextCart.items) ? nextCart.items : [];
    nextCart.items = items.map(function (item, index) {
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const unitPrice = Number(item.unit_price != null ? item.unit_price : item.unitPrice || 0);
      const nextItem = Object.assign({}, item, {
        id: item.id || `assist-item-${item.variant_id || index}`,
        quantity,
        unit_price: unitPrice,
        subtotal: unitPrice * quantity
      });
      return nextItem;
    });
    nextCart.subtotal = nextCart.items.reduce(function (sum, item) {
      return sum + (item.subtotal || 0);
    }, 0);
    nextCart.total = nextCart.subtotal;
    nextCart.currency_code = nextCart.currency_code || 'brl';
    nextCart.assisted = true;
    nextCart.quote_only = true;
    return nextCart;
  }

  function ensureAssistedCart(cartId) {
    const currentCart = readAssistedCart();
    const ensuredCart = currentCart && typeof currentCart === 'object'
      ? Object.assign({}, currentCart)
      : buildEmptyAssistedCart(cartId);

    if (!ensuredCart.id) {
      ensuredCart.id = cartId || buildAssistedCartId();
    } else if (cartId && ensuredCart.id !== cartId) {
      ensuredCart.id = cartId;
    }

    return recalculateCartTotals(ensuredCart);
  }

  function persistAssistedCartState(cart) {
    const normalized = normalizeCart(recalculateCartTotals(cart));
    const config = getApiConfig();
    persistAssistedCart(normalized);
    if (typeof config.persistStoredCartId === 'function') {
      config.persistStoredCartId(normalized.id);
    }
    return normalized;
  }

  function normalizeCartItem(item, index) {
    const safeItem = item || {};
    const variant = safeItem.variant || null;
    const product = variant && variant.product ? variant.product : null;
    const title = safeItem.title
      || safeItem.product_name
      || safeItem.product_title
      || (product && product.title)
      || 'Produto';
    const quantity = Math.max(1, parseInt(safeItem.quantity, 10) || 1);
    const unitPrice = Number(
      safeItem.unit_price != null
        ? safeItem.unit_price
        : safeItem.unitPrice != null
          ? safeItem.unitPrice
          : (variant && variant.prices && variant.prices[0] && variant.prices[0].amount) || 0
    );
    const thumbnail = safeItem.thumbnail
      || safeItem.product_image
      || (product && product.thumbnail)
      || (product && product.images && product.images[0] && (product.images[0].url || product.images[0]))
      || null;
    const availableQuantity = Number(
      safeItem.available_quantity != null
        ? safeItem.available_quantity
        : safeItem.inventory_quantity != null
          ? safeItem.inventory_quantity
          : (variant && variant.inventory_quantity != null ? variant.inventory_quantity : NaN)
    );

    return {
      id: safeItem.id || `assist-item-${safeItem.variant_id || index}`,
      product_id: safeItem.product_id || (product && product.id) || null,
      variant_id: safeItem.variant_id || (variant && variant.id) || null,
      title,
      quantity,
      available_quantity: Number.isFinite(availableQuantity) ? Math.max(0, availableQuantity) : null,
      inventory_quantity: Number.isFinite(availableQuantity) ? Math.max(0, availableQuantity) : null,
      unit_price: unitPrice,
      subtotal: safeItem.subtotal != null ? safeItem.subtotal : unitPrice * quantity,
      thumbnail,
      metadata: safeItem.metadata || {},
      variant: variant || safeItem.variant || null
    };
  }

  /**
   * Produtos — GET /api/store/tenant/:slug/products (page, perPage)
   * Quando há slug (Tech10), usa tenant para listar só produtos da loja do seed.
   */
  async function getProducts(options = {}) {
    const { limit = 12, offset = 0, category_id, categoryId, q } = options;
    const cat = category_id || categoryId;
    const storeSlug = slug();

    if (storeSlug) {
      // Rota correta do backend: GET /api/store/lojas/:slug/produtos
      let url = `${base()}/lojas/${encodeURIComponent(storeSlug)}/produtos?limit=${limit}&offset=${offset}`;
      if (cat) url += `&category=${encodeURIComponent(cat)}`;
      if (q) url += `&search=${encodeURIComponent(q)}`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        // Resposta: { success, data: { products: [] } }
        const products = (data.data?.products || data.products || []).map(normalizeProduct);
        return products;
      } catch (err) {
        console.error('[api-adapter] getProducts (tenant):', err);
        return [];
      }
    }

    let url = `${base()}/products?limit=${limit}&offset=${offset}`;
    if (cat) url += `&category=${encodeURIComponent(cat)}`;
    if (q) url += `&q=${encodeURIComponent(q)}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const products = (data.products || []).map(normalizeProduct);
      return products;
    } catch (err) {
      console.error('[api-adapter] getProducts:', err);
      return [];
    }
  }

  function normalizeProduct(p) {
    if (!p) return null;
    const variant = (p.variants && p.variants[0]) || {};
    const prices = variant.prices || [];
    const amount = (prices[0] && prices[0].amount) != null ? prices[0].amount : 0;
    const metadata = p.metadata || {};

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      thumbnail: p.thumbnail || (p.images && p.images[0] && p.images[0].url) || null,
      variants: [{
        id: variant.id,
        title: variant.title,
        inventory_quantity: variant.inventory_quantity ?? 0,
        prices: [{ amount }]
      }],
      images: p.images,
      category: normalizeCategory(p.category),
      metadata: {
        sku: metadata.sku || p.sku || null,
        brand: metadata.brand || p.brand || null,
      },
    };
  }

  async function getProductById(id) {
    try {
      const res = await fetch(`${base()}/products/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.product ? normalizeProduct(data.product) : null;
    } catch (err) {
      console.error('[api-adapter] getProductById:', err);
      return null;
    }
  }

  /**
   * Categorias — GET /api/store/tenant/:slug/categories quando há slug
   */
  async function getCategories() {
    // Derivar categorias dos próprios produtos da loja (garante apenas as reais do tenant)
    const storeSlug = slug();
    if (storeSlug) {
      try {
        const res = await fetch(`${base()}/lojas/${encodeURIComponent(storeSlug)}/produtos?limit=100`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const products = data.data?.products || data.products || [];
        const seen = new Map();
        products.forEach(p => {
          const cat = normalizeCategory(p.category);
          if (cat && !seen.has(cat.handle)) {
            seen.set(cat.handle, cat);
          }
        });
        return Array.from(seen.values());
      } catch (err) {
        console.error('[api-adapter] getCategories (tenant via produtos):', err);
      }
    }
    // Fallback: categorias gerais
    try {
      const res = await fetch(`${base()}/categories`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const list = (data.data && data.data.categories) || data.categories || [];
      return list.map(normalizeCategory).filter(Boolean);
    } catch (err) {
      console.error('[api-adapter] getCategories:', err);
      return [];
    }
  }

  async function createCart() {
    if (await shouldUseAssistedCartBridge()) {
      const config = getApiConfig();
      const cartId = typeof config.readStoredCartId === 'function' ? config.readStoredCartId() : null;
      const cart = persistAssistedCartState(ensureAssistedCart(cartId));
      return { cart };
    }

    try {
      const res = await fetch(`${base()}/carts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region_id: 'reg_default' })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const cart = data.cart || data;
      return { cart };
    } catch (err) {
      console.error('[api-adapter] createCart:', err);
      throw err;
    }
  }

  function mergeAssistedItemWithLiveSnapshot(item, product, variant, quantity) {
    const refreshed = buildAssistedCartItem(product, variant, quantity);
    return Object.assign({}, item, refreshed, {
      id: item.id || refreshed.id
    });
  }

  async function reconcileAssistedCartStock(cart) {
    const nextCart = ensureAssistedCart(cart && cart.id ? cart.id : null);
    nextCart.items = Array.isArray(cart && cart.items) ? cart.items.map(function (item) {
      return Object.assign({}, item);
    }) : [];

    const reconciledItems = [];
    for (const item of nextCart.items) {
      const snapshot = await resolveCurrentProductSnapshot(item.variant_id, item.product_id);
      if (!snapshot || !snapshot.product || !snapshot.variant) {
        reconciledItems.push(item);
        continue;
      }

      const availableQuantity = getVariantInventoryQuantity(snapshot.product, snapshot.variant.id);
      if (availableQuantity < 1) {
        continue;
      }

      const desiredQuantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const clampedQuantity = Math.min(desiredQuantity, availableQuantity);
      reconciledItems.push(
        mergeAssistedItemWithLiveSnapshot(item, snapshot.product, snapshot.variant, clampedQuantity)
      );
    }

    nextCart.items = reconciledItems;
    return nextCart;
  }

  async function getCart(cartId) {
    if (!cartId) return null;
    if (await shouldUseAssistedCartBridge()) {
      const cart = readAssistedCart();
      if (!cart) return null;
      if (cart.id && String(cart.id) !== String(cartId)) return null;
      return persistAssistedCartState(await reconcileAssistedCartStock(cart));
    }
    try {
      const res = await fetch(`${base()}/carts/${cartId}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const cart = data.cart || data;
      return normalizeCart(cart);
    } catch (err) {
      console.error('[api-adapter] getCart:', err);
      return null;
    }
  }

  function normalizeCart(cart) {
    if (!cart) return null;
    const items = (cart.items || []).map(normalizeCartItem);
    const subtotal = cart.subtotal != null
      ? Number(cart.subtotal)
      : items.reduce(function (sum, item) {
          return sum + (item.subtotal || 0);
        }, 0);
    const total = cart.total != null ? Number(cart.total) : subtotal;
    return {
      id: cart.id,
      items,
      subtotal,
      total,
      currency_code: cart.currency_code || 'brl',
      assisted: cart.assisted === true
    };
  }

  async function addLineItem(cartId, variantId, quantity = 1, productId) {
    if (await shouldUseAssistedCartBridge()) {
      const nextCart = ensureAssistedCart(cartId);
      const matchedProduct = await resolveCurrentProductSnapshot(variantId, productId);

      if (!matchedProduct) {
        throw new Error('Não foi possível preparar a seleção assistida deste produto.');
      }

      const desiredQuantity = Math.max(1, parseInt(quantity, 10) || 1);
      const availableQuantity = getVariantInventoryQuantity(matchedProduct.product, matchedProduct.variant.id);
      if (availableQuantity < 1) {
        throw new Error('Este item ficou sem estoque no momento. Atualize a página para ver a disponibilidade atual.');
      }

      const itemKey = `assist-item-${variantId}`;
      const existingItem = nextCart.items.find(function (item) {
        return String(item.id) === itemKey || String(item.variant_id) === String(variantId);
      });

      if (existingItem) {
        const currentQuantity = Math.max(1, parseInt(existingItem.quantity, 10) || 1);
        const nextQuantity = Math.min(currentQuantity + desiredQuantity, availableQuantity);
        Object.assign(
          existingItem,
          mergeAssistedItemWithLiveSnapshot(existingItem, matchedProduct.product, matchedProduct.variant, nextQuantity)
        );
      } else {
        nextCart.items.push(
          buildAssistedCartItem(
            matchedProduct.product,
            matchedProduct.variant,
            Math.min(desiredQuantity, availableQuantity)
          )
        );
      }

      return {
        success: true,
        cart: persistAssistedCartState(nextCart)
      };
    }

    try {
      const res = await fetch(`${base()}/carts/${cartId}/line-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant_id: variantId, quantity })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'HTTP ' + res.status);
      }
      const data = await res.json();
      const cart = (data.cart || data);
      return { success: true, cart: normalizeCart(cart) };
    } catch (err) {
      console.error('[api-adapter] addLineItem:', err);
      throw err;
    }
  }

  async function updateLineItem(cartId, itemId, quantity) {
    if (await shouldUseAssistedCartBridge()) {
      const nextCart = ensureAssistedCart(cartId);
      const targetItem = nextCart.items.find(function (item) {
        return String(item.id) === String(itemId);
      });

      if (!targetItem) {
        throw new Error('Item não encontrado na seleção assistida.');
      }

      const snapshot = await resolveCurrentProductSnapshot(targetItem.variant_id, targetItem.product_id);
      if (!snapshot || !snapshot.product || !snapshot.variant) {
        throw new Error('Não foi possível confirmar o estoque deste item agora.');
      }

      const availableQuantity = getVariantInventoryQuantity(snapshot.product, snapshot.variant.id);
      if (availableQuantity < 1) {
        nextCart.items = nextCart.items.filter(function (item) {
          return String(item.id) !== String(itemId);
        });
      } else {
        const desiredQuantity = Math.max(1, parseInt(quantity, 10) || 1);
        const clampedQuantity = Math.min(desiredQuantity, availableQuantity);
        Object.assign(
          targetItem,
          mergeAssistedItemWithLiveSnapshot(targetItem, snapshot.product, snapshot.variant, clampedQuantity)
        );
      }

      return {
        success: true,
        cart: persistAssistedCartState(nextCart)
      };
    }

    try {
      const res = await fetch(`${base()}/carts/${cartId}/line-items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const cart = (data.cart || data);
      return { success: true, cart: normalizeCart(cart) };
    } catch (err) {
      console.error('[api-adapter] updateLineItem:', err);
      throw err;
    }
  }

  async function removeLineItem(cartId, itemId) {
    if (await shouldUseAssistedCartBridge()) {
      const nextCart = ensureAssistedCart(cartId);
      nextCart.items = nextCart.items.filter(function (item) {
        return String(item.id) !== String(itemId);
      });

      return {
        success: true,
        cart: persistAssistedCartState(nextCart)
      };
    }

    try {
      const res = await fetch(`${base()}/carts/${cartId}/line-items/${itemId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const cart = (data.cart || data);
      return { success: true, cart: normalizeCart(cart) };
    } catch (err) {
      console.error('[api-adapter] removeLineItem:', err);
      throw err;
    }
  }

  global.MarketplaceAdapter = {
    getRuntimeConfig,
    getProducts,
    getProductById,
    getCategories,
    normalizeCategory,
    normalizeCategoryHandle: slugifyCategoryValue,
    createCart,
    getCart,
    addLineItem,
    updateLineItem,
    removeLineItem
  };
})(typeof window !== 'undefined' ? window : this);
