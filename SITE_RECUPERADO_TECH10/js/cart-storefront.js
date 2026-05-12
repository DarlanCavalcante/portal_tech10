/**
 * Carrinho canônico do storefront Tech10.
 * Mantém aliases legados temporários para preservar compatibilidade sem misturar ownership.
 */
(function (global) {
  'use strict';

  const PRIMARY_CART_ID_KEY = 'tech10_storefront_cart_id';
  const LEGACY_CART_ID_KEY = 'vivacommerce_cart_id';
  const EXTRA_LEGACY_CART_ID_KEY = 'vc_cart_id';

  function getCartStorageKeys() {
    const apiConfig = global.API_CONFIG || {};
    const fallbackKeys = [
      PRIMARY_CART_ID_KEY,
      LEGACY_CART_ID_KEY,
      EXTRA_LEGACY_CART_ID_KEY
    ];

    if (typeof apiConfig.resolveCartStorageKeys === 'function') {
      return apiConfig.resolveCartStorageKeys(fallbackKeys);
    }

    const configuredKeys = Array.isArray(apiConfig.CART_STORAGE_KEYS)
      ? apiConfig.CART_STORAGE_KEYS
      : [apiConfig.CART_STORAGE_KEY, apiConfig.LEGACY_CART_STORAGE_KEY];

    return Array.from(new Set(configuredKeys.concat(fallbackKeys).filter(Boolean)));
  }

  function readCartId() {
    try {
      const apiConfig = global.API_CONFIG || {};
      if (typeof apiConfig.readStoredCartId === 'function') {
        return apiConfig.readStoredCartId();
      }

      for (const key of getCartStorageKeys()) {
        const value = localStorage.getItem(key);
        if (value) return value;
      }
    } catch (_) {
    }
    return null;
  }

  function persistCartId(value) {
    try {
      const apiConfig = global.API_CONFIG || {};
      if (typeof apiConfig.persistStoredCartId === 'function') {
        apiConfig.persistStoredCartId(value);
        return;
      }

      for (const key of getCartStorageKeys()) {
        if (!value) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      }
    } catch (_) {}
  }

  function getActiveStorefrontCart() {
    return [
      global.storefrontCart,
      global.cartStorefront,
      global.medusaCart,
      global.cartVivaCommerce
    ].find(function (cart) {
      return Boolean(cart);
    }) || null;
  }

  function getLegacyNotificationBridge(currentCart) {
    return [
      global.medusaCart,
      global.cartVivaCommerce
    ].find(function (cart) {
      return cart && cart !== currentCart && typeof cart.showNotification === 'function';
    }) || null;
  }

  function ensureToastContainer() {
    if (typeof document === 'undefined') return null;
    let container = document.getElementById('storefront-toast-container');
    if (container) return container;

    container = document.createElement('div');
    container.id = 'storefront-toast-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '99999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
    return container;
  }

  function showNativeToast(message, type) {
    if (typeof document === 'undefined') return;
    const container = ensureToastContainer();
    if (!container) return;

    const isError = type === 'error';
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.minWidth = '240px';
    toast.style.maxWidth = '320px';
    toast.style.padding = '12px 14px';
    toast.style.borderRadius = '12px';
    toast.style.boxShadow = '0 18px 45px rgba(15, 23, 42, 0.18)';
    toast.style.background = isError ? '#7f1d1d' : '#0f766e';
    toast.style.color = '#ffffff';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '700';
    toast.style.lineHeight = '1.4';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    toast.style.transition = 'opacity 180ms ease, transform 180ms ease';
    toast.style.pointerEvents = 'auto';

    container.appendChild(toast);
    requestAnimationFrame(function () {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-8px)';
      setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 220);
    }, isError ? 3600 : 2200);
  }

  function publishCartAliases(cart) {
    if (typeof window === 'undefined') return;

    window.storefrontCart = cart;
    window.cartStorefront = cart;
    window.cartVivaCommerce = window.cartVivaCommerce || cart;
    window.medusaCart = window.medusaCart || cart;
    window.getActiveStorefrontCart = getActiveStorefrontCart;
  }

  class StorefrontCart {
    constructor() {
      this.adapter = global.MarketplaceAdapter;
      this.cartId = readCartId();
      this.cartCountElement = document.getElementById('cartCount');
      this.cart = null;
    }

    async init() {
      if (!this.adapter) {
        console.warn('MarketplaceAdapter não encontrado. Carregue api-adapter.js antes.');
        return;
      }

      try {
        if (!this.cartId) {
          const { cart } = await this.adapter.createCart();
          this.cartId = cart.id;
          this.cart = cart;
          persistCartId(this.cartId);
        } else {
          const cart = await this.adapter.getCart(this.cartId);
          if (!cart) {
            this.cartId = null;
            persistCartId(null);
            await this.init();
            return;
          }
          this.cart = cart;
        }

        await this.updateCartCount();
      } catch (err) {
        console.error('StorefrontCart init:', err);
      }
    }

    async getCart() {
      if (!this.cartId || !this.adapter) return null;
      this.cart = await this.adapter.getCart(this.cartId);
      return this.cart;
    }

    async addItem(variantId, productId, quantity, buyNow) {
      if (!this.adapter) throw new Error('Adapter não disponível');
      try {
        if (!this.cartId) await this.init();
        const { cart } = await this.adapter.addLineItem(this.cartId, variantId, quantity || 1, productId);
        this.cart = cart;
        await this.updateCartCount();
        const commerce = (global.__tech10_runtime_config && global.__tech10_runtime_config.commerce) || {};
        const capabilities = commerce.capabilities || {};
        const assistedBridgeActive = (commerce.checkoutMode === 'quote_only'
          || capabilities.quoteOnly === true
          || capabilities.cart === false)
          && capabilities.assistedCartBridge === true;
        this.showNotification(assistedBridgeActive ? 'Produto adicionado à seleção!' : 'Produto adicionado ao carrinho!');
        if (buyNow) setTimeout(() => { window.location.href = '/carrinho'; }, 1000);
        return this.cart;
      } catch (err) {
        this.showNotification(err.message || 'Erro ao adicionar produto', 'error');
        throw err;
      }
    }

    async updateQuantity(itemId, quantity) {
      if (!this.cartId) throw new Error('Carrinho não encontrado');
      if (quantity < 1) return this.removeItem(itemId);
      try {
        const { cart } = await this.adapter.updateLineItem(this.cartId, itemId, quantity);
        this.cart = cart;
        await this.updateCartCount();
        return this.cart;
      } catch (err) {
        this.showNotification('Erro ao atualizar quantidade', 'error');
        throw err;
      }
    }

    async removeItem(itemId) {
      if (!this.cartId) throw new Error('Carrinho não encontrado');
      try {
        const { cart } = await this.adapter.removeLineItem(this.cartId, itemId);
        this.cart = cart;
        await this.updateCartCount();
        this.showNotification('Item removido do carrinho');
        return this.cart;
      } catch (err) {
        this.showNotification('Erro ao remover item', 'error');
        throw err;
      }
    }

    async updateCartCount() {
      try {
        const cart = await this.getCart();
        const count = (cart && cart.items) ? cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
        if (this.cartCountElement) {
          this.cartCountElement.textContent = count;
          this.cartCountElement.style.display = count > 0 ? 'flex' : 'none';
        }
      } catch (_) {}
    }

    getCount() {
      if (!this.cart || !Array.isArray(this.cart.items)) return 0;
      return this.cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }

    showNotification(message, type) {
      const bridge = getLegacyNotificationBridge(this);
      if (bridge) {
        bridge.showNotification(message, type);
        return;
      }
      showNativeToast(message, type);
    }
  }

  const cart = new StorefrontCart();
  publishCartAliases(cart);
})(typeof window !== 'undefined' ? window : this);
