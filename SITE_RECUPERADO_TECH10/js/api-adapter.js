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
    if (config.STORE_RUNTIME_BASE_URL) {
      return config.STORE_RUNTIME_BASE_URL.replace(/\/$/, '');
    }
    if (config.RUNTIME_BASE_URL) {
      return config.RUNTIME_BASE_URL.replace(/\/$/, '');
    }
    if (config.LEGACY_STORE_BASE_URL) {
      return config.LEGACY_STORE_BASE_URL.replace(/\/$/, '');
    }
    if (config.VIVACOMMERCE_BASE_URL) {
      return config.VIVACOMMERCE_BASE_URL.replace(/\/$/, '');
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

  async function getCart(cartId) {
    if (!cartId) return null;
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
    const items = (cart.items || []).map(item => ({
      id: item.id,
      variant_id: item.variant_id,
      quantity: item.quantity
    }));
    return { id: cart.id, items };
  }

  async function addLineItem(cartId, variantId, quantity = 1) {
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
